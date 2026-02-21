/**
 * Swiss QR Reference (QRR) Utility
 * Konform mit SIX Swiss Payment Standard (Swiss Payment Standards 2.0)
 */

/**
 * Rekursiver Mod10-Algorithmus nach SIX Swiss Payment Standard.
 * Tabelle: [0, 9, 4, 6, 8, 2, 7, 1, 3, 5]
 */
export function calculateMod10Recursive(numericString: string): number {
  const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
  let carry = 0;
  for (const char of numericString) {
    carry = table[(carry + parseInt(char, 10)) % 10];
  }
  return (10 - carry) % 10;
}

/**
 * Generiert eine 27-stellige QRR aus einem fortlaufenden Rechnungszähler.
 *
 * Struktur: [optionales Präfix (bis 10 Stellen)] + [Zähler] auf 26 Stellen aufgefüllt + 1 Prüfziffer
 *
 * @param invoiceCounter - Fortlaufende Rechnungsnummer (z.B. 156)
 * @param prefix - Optionale numerische Serie (max. 10 Stellen)
 */
export function generateSwissQrReference(invoiceCounter: number, prefix = ''): string {
  const prefixClean = prefix.replace(/\D/g, '').substring(0, 10);
  const counterStr = invoiceCounter.toString();
  const combined = prefixClean + counterStr;

  // Exakt 26 Stellen (führende Nullen), dann Prüfziffer anhängen
  const base = combined.padStart(26, '0').substring(0, 26);
  const checkDigit = calculateMod10Recursive(base);

  return base + checkDigit.toString();
}

/**
 * Validiert eine QRR: exakt 27 numerische Zeichen, korrekte Mod10-Prüfziffer.
 */
export function validateQrReference(reference: string): boolean {
  const clean = reference.replace(/\s/g, '');
  if (clean.length !== 27 || !/^\d{27}$/.test(clean)) return false;

  const base = clean.substring(0, 26);
  const expected = calculateMod10Recursive(base);
  return expected === parseInt(clean[26], 10);
}

/**
 * Generiert eine ISO 11649 Creditor Reference (SCOR) aus einer Rechnungsnummer.
 *
 * Format: RF + 2 Prüfziffern (MOD97-10) + Referenz (max 21 alphanumerische Zeichen)
 * Kompatibel mit regulärer IBAN (kein QR-IBAN erforderlich).
 */
export function generateScorReference(invoiceNumber: string): string {
  // Nur alphanumerische Zeichen, max 21 Stellen, Grossbuchstaben
  const ref = invoiceNumber.replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 21);
  if (!ref) throw new Error('Rechnungsnummer muss mindestens ein alphanumerisches Zeichen enthalten');

  // ISO 11649: ref + "RF00" → Buchstaben in Zahlen umwandeln (A=10 … Z=35)
  const toCheck = ref + 'RF00';
  const numericStr = toCheck
    .split('')
    .map((c) => {
      const code = c.charCodeAt(0);
      return code >= 65 && code <= 90 ? (code - 55).toString() : c;
    })
    .join('');

  // MOD 97 iterativ berechnen
  let remainder = 0;
  for (const char of numericStr) {
    remainder = (remainder * 10 + parseInt(char, 10)) % 97;
  }

  const checkDigits = (98 - remainder).toString().padStart(2, '0');
  return `RF${checkDigits}${ref}`;
}

/**
 * Wählt automatisch die beste Referenzart:
 * - Mit QR-IBAN → QRR (27-stellig, MOD10 rekursiv)
 * - Ohne QR-IBAN → SCOR (ISO 11649, RF-Prefix)
 */
export function generateInvoiceReference(
  invoiceCounter: number,
  invoiceNumber: string,
  companyQrIban?: string | null,
): string {
  if (companyQrIban && isQrIban(companyQrIban)) {
    return generateSwissQrReference(invoiceCounter);
  }
  return generateScorReference(invoiceNumber);
}

/**
 * Prüft ob eine IBAN eine gültige QR-IBAN ist (IID 30000-31999, Schweiz/Liechtenstein).
 */
export function isQrIban(iban: string): boolean {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  if (!clean.startsWith('CH') && !clean.startsWith('LI')) return false;
  const iid = parseInt(clean.substring(4, 9), 10);
  return iid >= 30000 && iid <= 31999;
}
