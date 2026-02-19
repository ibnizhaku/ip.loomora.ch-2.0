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
 * Prüft ob eine IBAN eine gültige QR-IBAN ist (IID 30000-31999, Schweiz/Liechtenstein).
 */
export function isQrIban(iban: string): boolean {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  if (!clean.startsWith('CH') && !clean.startsWith('LI')) return false;
  const iid = parseInt(clean.substring(4, 9), 10);
  return iid >= 30000 && iid <= 31999;
}
