/**
 * PDF-Textextraktion mit pdfjs-dist.
 * Liest einen Datei-Blob und gibt den Rohtext zurück.
 * Danach wird der Text mit Regex-Mustern nach Schweizer Rechnungsfeldern durchsucht.
 */

export interface ExtractedInvoiceData {
  externalNumber?: string;       // Rechnungsnummer des Lieferanten
  supplierName?: string;         // Lieferant
  vatNumber?: string;            // UID CHE-XXX.XXX.XXX MWST
  invoiceDate?: string;          // ISO-Datum
  dueDate?: string;              // ISO-Datum
  netAmount?: string;            // Nettobetrag (String für Input)
  grossAmount?: string;          // Bruttobetrag
  vatAmount?: string;            // MwSt-Betrag
  vatRate?: string;              // MwSt-Satz (z.B. "8.1")
  iban?: string;                 // IBAN des Lieferanten
  rawText?: string;
}

async function extractTextFromPDF(file: File): Promise<string> {
  // Dynamic import – pdfjs-dist ist sehr gross, deswegen lazy
  const pdfjsLib = await import('pdfjs-dist');
  // Worker aus dem Bundle
  const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];
  for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(pageText);
  }
  return pages.join('\n');
}

/**
 * Parst den Rohtext einer Schweizer Rechnung.
 * Alle Muster basieren auf Art. 26 MWSTG Pflichtangaben.
 */
function parseSwissInvoice(text: string): ExtractedInvoiceData {
  const result: ExtractedInvoiceData = { rawText: text };

  // ── Rechnungsnummer ─────────────────────────────────────────────
  const rgNrPatterns = [
    /Rechnung(?:snummer)?[:\s#]+([A-Z0-9\-/_.]{3,30})/i,
    /Rg[.\s-]?Nr[.:\s]+([A-Z0-9\-/_.]{3,30})/i,
    /Invoice[:\s#]+([A-Z0-9\-/_.]{3,30})/i,
    /Nr[.:\s]+([A-Z0-9\-/_.]{4,30})/i,
  ];
  for (const p of rgNrPatterns) {
    const m = text.match(p);
    if (m) { result.externalNumber = m[1].trim(); break; }
  }

  // ── UID / MwSt-Nummer (CHE-XXX.XXX.XXX MWST) ───────────────────
  const uidMatch = text.match(/CHE[-\s]?(\d{3})[.\s]?(\d{3})[.\s]?(\d{3})\s*(?:MWST)?/i);
  if (uidMatch) {
    result.vatNumber = `CHE-${uidMatch[1]}.${uidMatch[2]}.${uidMatch[3]} MWST`;
  }

  // ── Firmenname: Zeile vor der UID, oder "Von:" / "Von Firma:" ────
  if (uidMatch) {
    const uidPos = text.indexOf(uidMatch[0]);
    const beforeUid = text.substring(Math.max(0, uidPos - 200), uidPos);
    const lines = beforeUid.split(/[\n\r]+/).filter(l => l.trim().length > 2);
    if (lines.length > 0) {
      const candidate = lines[lines.length - 1].trim();
      if (candidate.length > 2 && candidate.length < 80) result.supplierName = candidate;
    }
  }
  if (!result.supplierName) {
    const vonMatch = text.match(/(?:Von|From|Lieferant|Supplier)[:\s]+([^\n\r,]{3,60})/i);
    if (vonMatch) result.supplierName = vonMatch[1].trim();
  }

  // ── Datum ────────────────────────────────────────────────────────
  // DD.MM.YYYY / YYYY-MM-DD
  const datePattern = /(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})/g;
  const dates: string[] = [];
  let dm: RegExpExecArray | null;
  while ((dm = datePattern.exec(text)) !== null) {
    let [, d, mo, y] = dm;
    if (y.length === 2) y = '20' + y;
    // Validate
    const day = parseInt(d), month = parseInt(mo), year = parseInt(y);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2000 && year <= 2040) {
      dates.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }
  }
  // ISO dates YYYY-MM-DD
  const isoPattern = /(\d{4})-(\d{2})-(\d{2})/g;
  let im: RegExpExecArray | null;
  while ((im = isoPattern.exec(text)) !== null) {
    dates.push(`${im[1]}-${im[2]}-${im[3]}`);
  }

  // Erste plausible Datumsnennung = Rechnungsdatum, zweite = Fälligkeit
  const uniqueDates = [...new Set(dates)].sort();
  if (uniqueDates.length > 0) result.invoiceDate = uniqueDates[0];
  if (uniqueDates.length > 1) result.dueDate = uniqueDates[1];

  // Gezielte Suche nach "Fällig", "Due", "Zahlbar bis"
  const dueMatch = text.match(/(?:F[äa]llig(?:keitsdatum)?|Due(?:\s*Date)?|Zahlbar\s*bis)[:\s]+(\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2,4})/i);
  if (dueMatch) {
    const [, d, mo, y] = dueMatch[1].match(/(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})/) || [];
    if (d && mo && y) {
      const year = y.length === 2 ? '20' + y : y;
      result.dueDate = `${year}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }

  // ── Beträge ──────────────────────────────────────────────────────
  // CHF 1'234.56 / CHF 1234.56
  const amtPattern = /CHF\s*(\d[\d'.,]*\d|\d+)/gi;
  const amounts: number[] = [];
  let am: RegExpExecArray | null;
  while ((am = amtPattern.exec(text)) !== null) {
    const raw = am[1].replace(/'/g, '').replace(',', '.');
    const val = parseFloat(raw);
    if (!isNaN(val) && val > 0) amounts.push(val);
  }

  if (amounts.length > 0) {
    const maxAmount = Math.max(...amounts);
    result.grossAmount = maxAmount.toFixed(2);

    // MwSt-Satz erkennen
    const vatRateMatch = text.match(/(\d+[.,]\d+)\s*%\s*(?:MwSt|MWST|Mehrwertsteuer|VAT)/i)
      || text.match(/(?:MwSt|MWST|VAT)[^%]*(\d+[.,]\d+)\s*%/i);
    if (vatRateMatch) {
      result.vatRate = vatRateMatch[1].replace(',', '.');
      const rate = parseFloat(result.vatRate) / 100;
      const net = maxAmount / (1 + rate);
      result.netAmount = net.toFixed(2);
      result.vatAmount = (maxAmount - net).toFixed(2);
    } else {
      // Fallback: 8.1% Normalsatz
      result.vatRate = '8.1';
      const net = maxAmount / 1.081;
      result.netAmount = net.toFixed(2);
      result.vatAmount = (maxAmount - net).toFixed(2);
    }

    // Netto direkt suchen
    const netMatch = text.match(/(?:Netto|Exkl|Subtotal|Betrag\s*exkl)[^\d]*(\d[\d'.,]*\d)/i);
    if (netMatch) {
      const raw = netMatch[1].replace(/'/g, '').replace(',', '.');
      result.netAmount = parseFloat(raw).toFixed(2);
    }
  }

  // ── IBAN ─────────────────────────────────────────────────────────
  const ibanMatch = text.match(/(?:IBAN)[:\s]*([A-Z]{2}\d{2}[\d\s]{10,30})/i);
  if (ibanMatch) {
    result.iban = ibanMatch[1].replace(/\s/g, '');
  }

  return result;
}

export async function extractInvoiceFromPDF(file: File): Promise<ExtractedInvoiceData> {
  const text = await extractTextFromPDF(file);
  return parseSwissInvoice(text);
}
