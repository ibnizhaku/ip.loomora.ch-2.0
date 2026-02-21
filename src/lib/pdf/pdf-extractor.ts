/**
 * Swiss-Invoice PDF-Extractor (pdfjs-dist)
 * Analysiert Schweizer Lieferantenrechnungen und extrahiert strukturierte Daten.
 *
 * Dokumentstruktur Schweizer Rechnung:
 *   - Absender (oben, y max)  = Lieferant
 *   - Empfänger (Fenstermitte) = eigene Firma → wird IGNORIERT
 *   - Rechnungsdaten: RG-Datum / Rechnungsdatum, Nummer
 *   - Positionstabelle
 *   - Totals
 *   - QR-/ESR-Zahlschein (unten, y min) → "CHF xxx.xx"
 */

export interface ExtractedPosition {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface ExtractedInvoiceData {
  externalNumber?: string;
  supplierName?: string;
  vatNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  grossAmount?: string;   // Zahlungsbetrag (Brutto, inkl. MwSt)
  netAmount?: string;
  vatAmount?: string;
  vatRate?: string;
  iban?: string;
  positions?: ExtractedPosition[];
  rawText?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Text-Extraktion: Zeilen nach Y-Koordinate rekonstruieren
// ──────────────────────────────────────────────────────────────────────────────
interface TextLine {
  y: number;
  text: string;
}

async function extractLines(file: File): Promise<TextLine[]> {
  const pdfjsLib = await import('pdfjs-dist');
  const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  const allLines: TextLine[] = [];
  let yOffset = 0;

  for (let p = 1; p <= Math.min(pdf.numPages, 5); p++) {
    const page = await pdf.getPage(p);
    const vp = page.getViewport({ scale: 1 });
    const tc = await page.getTextContent();

    const lineMap = new Map<number, string[]>();
    for (const item of tc.items) {
      if (!('str' in item) || !(item as any).str.trim()) continue;
      const rawY = Math.round((item as any).transform[5]);
      // Runde auf 2px → gleiche Zeile
      const y = Math.round(rawY / 2) * 2;
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push((item as any).str);
    }

    // Seite: y absteigend = von oben nach unten
    const pageLines = [...lineMap.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([y, strs]) => ({
        y: y + yOffset,
        text: strs.join(' ').trim(),
      }))
      .filter(l => l.text.length > 0);

    allLines.push(...pageLines);
    yOffset += Math.round(vp.height) + 1000; // Seiten-Offset damit y-Werte eindeutig bleiben
  }

  return allLines;
}

// ──────────────────────────────────────────────────────────────────────────────
// Parser
// ──────────────────────────────────────────────────────────────────────────────
function parseLines(lines: TextLine[]): ExtractedInvoiceData {
  const result: ExtractedInvoiceData = {};
  const fullText = lines.map(l => l.text).join('\n');

  // ── Rechnungsnummer ───────────────────────────────────────────────────────
  const rgNrPatterns = [
    /Rechnung\s+(\d{4,12})/i,          // "Rechnung 358630"
    /Rechnung(?:snummer)?[:\s#]+([A-Z0-9\-/_.]{3,30})/i,
    /Rg[.\s-]?Nr[.:\s]+([A-Z0-9\-/_.]{3,30})/i,
    /Invoice[:\s#]+([A-Z0-9\-/_.]{3,30})/i,
    /Nr[.:\s]+([A-Z0-9\-/_.]{4,30})/i,
  ];
  for (const p of rgNrPatterns) {
    const m = fullText.match(p);
    if (m) { result.externalNumber = m[1].trim(); break; }
  }

  // ── UID / MwSt-Nummer ────────────────────────────────────────────────────
  const uidMatch = fullText.match(/CHE[-\s]?(\d{3})[.\s]?(\d{3})[.\s]?(\d{3})\s*(?:MWST)?/i);
  if (uidMatch) {
    result.vatNumber = `CHE-${uidMatch[1]}.${uidMatch[2]}.${uidMatch[3]} MWST`;
  }

  // ── Absender / Lieferantenname ────────────────────────────────────────────
  // Der Absender steht ganz OBEN im Dokument (höchster y-Wert = erste Zeile).
  // Empfänger steht DANACH. Wir nehmen die erste inhaltlich sinnvolle Zeile.
  const topLines = lines
    .slice(0, 10)
    .map(l => l.text.trim())
    .filter(t => t.length > 2 && !/^\d+$/.test(t) && !/^(Tel|Fax|www|http|info|mail|@)/i.test(t));
  if (topLines.length > 0) {
    result.supplierName = topLines[0];
  }

  // ── Rechnungsdatum ───────────────────────────────────────────────────────
  // Priorität: "RG-Datum", "Rechnungsdatum", "Datum"
  const dateKeywordPattern = /(?:RG[.\s-]?Datum|Rechnungsdatum|Datum)[:\s]*(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4})/i;
  const dateKW = fullText.match(dateKeywordPattern);
  if (dateKW) {
    result.invoiceDate = parseDateString(dateKW[1]);
  }

  // Fälligkeitsdatum
  const dueKW = fullText.match(/(?:Zahlbar bis|F[äa]llig(?:keitsdatum)?|Due(?:\s*Date)?)[:\s]*(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4})/i);
  if (dueKW) {
    result.dueDate = parseDateString(dueKW[1]);
  }

  // Fallback: alle DD.MM.YYYY Daten
  if (!result.invoiceDate) {
    const allDates = extractAllDates(fullText).filter(d => d >= '2020-01-01');
    if (allDates.length > 0) result.invoiceDate = allDates[0];
    if (allDates.length > 1 && !result.dueDate) result.dueDate = allDates[allDates.length - 1];
  }

  // ── MwSt-Satz ────────────────────────────────────────────────────────────
  if (/keine\s*MwSt/i.test(fullText) || /MwSt-befreit|0\s*%\s*MwSt/i.test(fullText)) {
    result.vatRate = '0';
  } else {
    const vatRateMatch = fullText.match(/(\d+[.,]\d+)\s*%\s*(?:MwSt|MWST|VAT)/i)
      || fullText.match(/(?:MwSt|MWST|VAT)[^%\d]*(\d+[.,]\d+)\s*%/i);
    if (vatRateMatch) result.vatRate = vatRateMatch[1].replace(',', '.');
    else result.vatRate = '8.1'; // Schweizer Normalsatz
  }

  // ── Betrag (Zahlungsbetrag / Brutto) ─────────────────────────────────────
  // Priorität: "Total CHF X" → explizites Total
  const totalMatch = fullText.match(/Total\s+CHF\s+([\d'.,]+)/i)
    || fullText.match(/Gesamtbetrag\s+CHF\s+([\d'.,]+)/i)
    || fullText.match(/Rechnungsbetrag\s+CHF\s+([\d'.,]+)/i);
  if (totalMatch) {
    result.grossAmount = parseAmount(totalMatch[1]);
  }

  // Fallback: QR-Zahlschein "Betrag\nCHF X" (im unteren Seitenbereich, y klein)
  if (!result.grossAmount) {
    const qrLines = lines.filter(l => l.y < 200); // Untere 200pt = Zahlschein
    const qrText = qrLines.map(l => l.text).join('\n');
    const qrAmt = qrText.match(/CHF\s+([\d'.,]+)/i);
    if (qrAmt) result.grossAmount = parseAmount(qrAmt[1]);
  }

  // Nettobetrag = Brutto / (1 + vatRate/100)
  if (result.grossAmount) {
    const gross = parseFloat(result.grossAmount);
    const rate = parseFloat(result.vatRate || '0') / 100;
    if (rate === 0) {
      result.netAmount = result.grossAmount;
      result.vatAmount = '0.00';
    } else {
      const net = gross / (1 + rate);
      result.netAmount = net.toFixed(2);
      result.vatAmount = (gross - net).toFixed(2);
    }
  }

  // ── IBAN ─────────────────────────────────────────────────────────────────
  const ibanMatch = fullText.match(/([A-Z]{2}\d{2}[\d\s]{10,34})/);
  if (ibanMatch) result.iban = ibanMatch[1].replace(/\s/g, '');

  // ── Positionen aus Tabelle ────────────────────────────────────────────────
  result.positions = parsePositions(lines, fullText);

  result.rawText = fullText;
  return result;
}

// ──────────────────────────────────────────────────────────────────────────────
// Positionen: Tabellen-Zeilen parsen
// Typisches Format: "Beschreibung  Anzahl  Einheit  Preis  Rabatt  MwSt  Total"
// ──────────────────────────────────────────────────────────────────────────────
function parsePositions(lines: TextLine[], fullText: string): ExtractedPosition[] {
  const positions: ExtractedPosition[] = [];

  // Suche Header-Zeile: "Position Anzahl Einheit Preis ... Total"
  const headerPattern = /Position|Anzahl|Einheit|Preis|Menge|Beschreibung/i;
  const totalPattern = /^Total|^Gesamt|^Zwischensumme/i;

  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const text = lines[i].text;

    if (!inTable && headerPattern.test(text) && /Total|Preis/i.test(text)) {
      inTable = true;
      continue;
    }
    if (inTable && totalPattern.test(text)) {
      break; // Ende der Tabelle
    }

    if (!inTable) continue;

    // Zeile enthält CHF-Betrag → wahrscheinlich Position
    const amtMatch = text.match(/(\d[\d'.,]+)\s*$/);
    if (!amtMatch) continue;

    const total = parseFloat(amtMatch[1].replace(/'/g, '').replace(',', '.'));
    if (isNaN(total) || total <= 0) continue;

    // Versuche, Menge und Einzelpreis zu parsen
    // Format: "Beschreibung  [Anzahl]  [Einheit]  [Preis]  [Rabatt]  [MwSt]  Total"
    const numbers = [...text.matchAll(/(\d[\d'.,]*)/g)].map(m => parseFloat(m[1].replace(/'/g, '').replace(',', '.')));

    let description = text;
    let quantity = 1;
    let unitPrice = total;
    let unit = 'Stk';

    // Einheit erkennen
    const unitMatch = text.match(/\b(\d+)\s+(Anzahl|Stück|Stk|St|h|Std|Stunden|Tag|Mt|Monat|Pauschal|Psch|L|kg|m|m2)\b/i);
    if (unitMatch) {
      quantity = parseFloat(unitMatch[1]);
      unit = unitMatch[2];
    } else if (numbers.length >= 2) {
      quantity = numbers[0];
      unitPrice = numbers[numbers.length - 2] || total;
    }

    // Beschreibung = alles vor den Zahlen
    const descMatch = text.match(/^([^\d]+)/);
    if (descMatch) description = descMatch[1].trim().replace(/\s+/g, ' ');
    if (!description) description = text.substring(0, 60);

    positions.push({ description, quantity, unit, unitPrice, total });
  }

  // Fallback: wenn keine Tabelle gefunden, eine Position aus dem Gesamtbetrag
  if (positions.length === 0 && fullText.includes('CHF')) {
    const grossAmt = fullText.match(/Total\s+CHF\s+([\d'.,]+)/i);
    if (grossAmt) {
      positions.push({
        description: 'Leistung gemäss Rechnung',
        quantity: 1,
        unit: 'Pauschal',
        unitPrice: parseFloat(grossAmt[1].replace(/'/g, '').replace(',', '.')),
        total: parseFloat(grossAmt[1].replace(/'/g, '').replace(',', '.')),
      });
    }
  }

  return positions;
}

// ──────────────────────────────────────────────────────────────────────────────
// Hilfsfunktionen
// ──────────────────────────────────────────────────────────────────────────────
function parseDateString(s: string): string | undefined {
  const m = s.match(/(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})/);
  if (!m) return undefined;
  let [, d, mo, y] = m;
  if (y.length === 2) y = '20' + y;
  const day = parseInt(d), month = parseInt(mo), year = parseInt(y);
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2000 || year > 2040) return undefined;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function extractAllDates(text: string): string[] {
  const out: string[] = [];
  const re = /(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const d = parseDateString(m[0]);
    if (d) out.push(d);
  }
  return [...new Set(out)].sort();
}

function parseAmount(s: string): string {
  return parseFloat(s.replace(/'/g, '').replace(',', '.')).toFixed(2);
}

// ──────────────────────────────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────────────────────────────
export async function extractInvoiceFromPDF(file: File): Promise<ExtractedInvoiceData> {
  const lines = await extractLines(file);
  return parseLines(lines);
}
