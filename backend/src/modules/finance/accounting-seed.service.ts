import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * AccountingSeedService
 * Erstellt für eine neue Firma:
 * 1. Schweizer KMU-Kontenplan (OR 957a / Käfer)
 * 2. Standard-Kostenstelle "Allgemein"
 * 3. Standard-Kasse (Kassenbuch)
 */
@Injectable()
export class AccountingSeedService {
  constructor(private prisma: PrismaService) {}

  async seedCompany(companyId: string): Promise<void> {
    await Promise.all([
      this.seedChartOfAccounts(companyId),
      this.seedDefaultCashRegister(companyId),
    ]);
  }

  async seedDefaultCashRegister(companyId: string): Promise<void> {
    const existing = await this.prisma.cashRegister.findFirst({
      where: { companyId },
    });
    if (existing) return;

    await this.prisma.cashRegister.create({
      data: {
        companyId,
        name: 'Hauptkasse',
        location: 'Büro',
        currentBalance: 0,
        isDefault: true,
      },
    });
  }

  async seedChartOfAccounts(companyId: string): Promise<void> {
    const existing = await this.prisma.chartOfAccount.count({ where: { companyId } });
    if (existing > 0) return;

    // Schweizer KMU-Kontenrahmen nach OR 957a (Käfer-Schema)
    const accounts = [
      // ============================================================
      // KLASSE 1: AKTIVEN (Umlaufvermögen)
      // ============================================================
      { number: '1000', name: 'Kasse', type: 'ASSET', parentNumber: null },
      { number: '1010', name: 'Postcheck', type: 'ASSET', parentNumber: null },
      { number: '1020', name: 'Bank', type: 'ASSET', parentNumber: null },
      { number: '1030', name: 'Kurzfristige Geldanlagen', type: 'ASSET', parentNumber: null },
      { number: '1060', name: 'Wertschriften (kurzfristig)', type: 'ASSET', parentNumber: null },
      { number: '1100', name: 'Debitoren (Forderungen aus L+L)', type: 'ASSET', parentNumber: null },
      { number: '1109', name: 'Delkredere', type: 'ASSET', parentNumber: null },
      { number: '1120', name: 'Forderungen gegenüber Beteiligten', type: 'ASSET', parentNumber: null },
      { number: '1140', name: 'Sonstige kurzfristige Forderungen', type: 'ASSET', parentNumber: null },
      { number: '1170', name: 'Vorsteuer MWST', type: 'ASSET', parentNumber: null },
      { number: '1176', name: 'Verrechnungssteuer', type: 'ASSET', parentNumber: null },
      { number: '1180', name: 'Aktivierte Steuern', type: 'ASSET', parentNumber: null },
      { number: '1200', name: 'Handelswaren', type: 'ASSET', parentNumber: null },
      { number: '1210', name: 'Rohstoffe', type: 'ASSET', parentNumber: null },
      { number: '1220', name: 'Hilfsstoffe', type: 'ASSET', parentNumber: null },
      { number: '1260', name: 'Fertigfabrikate', type: 'ASSET', parentNumber: null },
      { number: '1270', name: 'Unfertige Erzeugnisse', type: 'ASSET', parentNumber: null },
      { number: '1280', name: 'Nicht fakturierte Dienstleistungen', type: 'ASSET', parentNumber: null },
      { number: '1300', name: 'Aktive Rechnungsabgrenzung', type: 'ASSET', parentNumber: null },
      { number: '1310', name: 'Vorauszahlungen', type: 'ASSET', parentNumber: null },
      // Anlagevermögen
      { number: '1440', name: 'Finanzanlagen (langfristig)', type: 'ASSET', parentNumber: null },
      { number: '1480', name: 'Aktive latente Steuern', type: 'ASSET', parentNumber: null },
      { number: '1500', name: 'Maschinen und Apparate', type: 'ASSET', parentNumber: null },
      { number: '1509', name: 'WB Maschinen und Apparate', type: 'ASSET', parentNumber: null },
      { number: '1520', name: 'Fahrzeuge', type: 'ASSET', parentNumber: null },
      { number: '1529', name: 'WB Fahrzeuge', type: 'ASSET', parentNumber: null },
      { number: '1530', name: 'Büromobiliar und -einrichtung', type: 'ASSET', parentNumber: null },
      { number: '1539', name: 'WB Büromobiliar', type: 'ASSET', parentNumber: null },
      { number: '1540', name: 'Büromaschinen und EDV', type: 'ASSET', parentNumber: null },
      { number: '1549', name: 'WB Büromaschinen und EDV', type: 'ASSET', parentNumber: null },
      { number: '1600', name: 'Immobilien (Grundstücke und Gebäude)', type: 'ASSET', parentNumber: null },
      { number: '1609', name: 'WB Immobilien', type: 'ASSET', parentNumber: null },
      { number: '1700', name: 'Immaterielle Werte', type: 'ASSET', parentNumber: null },
      { number: '1709', name: 'WB Immaterielle Werte', type: 'ASSET', parentNumber: null },
      { number: '1800', name: 'Gründungskosten', type: 'ASSET', parentNumber: null },

      // ============================================================
      // KLASSE 2: PASSIVEN (Fremdkapital + Eigenkapital)
      // ============================================================
      { number: '2000', name: 'Kreditoren (Verbindlichkeiten aus L+L)', type: 'LIABILITY', parentNumber: null },
      { number: '2010', name: 'Verbindlichkeiten gegenüber Beteiligten', type: 'LIABILITY', parentNumber: null },
      { number: '2030', name: 'Kontokorrent AHV/IV/EO/ALV', type: 'LIABILITY', parentNumber: null },
      { number: '2050', name: 'Kontokorrent Quellensteuer', type: 'LIABILITY', parentNumber: null },
      { number: '2100', name: 'Bankverbindlichkeiten (kurzfristig)', type: 'LIABILITY', parentNumber: null },
      { number: '2120', name: 'Verbindlichkeiten aus Finanzierungsleasing', type: 'LIABILITY', parentNumber: null },
      { number: '2200', name: 'MWST-Schuld', type: 'LIABILITY', parentNumber: null },
      { number: '2201', name: 'Abrechnungskonto MWST', type: 'LIABILITY', parentNumber: null },
      { number: '2210', name: 'Direkte Steuern', type: 'LIABILITY', parentNumber: null },
      { number: '2300', name: 'Passive Rechnungsabgrenzung', type: 'LIABILITY', parentNumber: null },
      { number: '2310', name: 'Erhaltene Vorauszahlungen', type: 'LIABILITY', parentNumber: null },
      { number: '2330', name: 'Kurzfristige Rückstellungen', type: 'LIABILITY', parentNumber: null },
      { number: '2400', name: 'Bankdarlehen (langfristig)', type: 'LIABILITY', parentNumber: null },
      { number: '2420', name: 'Hypotheken', type: 'LIABILITY', parentNumber: null },
      { number: '2450', name: 'Anleihen und Obligationen', type: 'LIABILITY', parentNumber: null },
      { number: '2500', name: 'Langfristige Rückstellungen', type: 'LIABILITY', parentNumber: null },
      // Eigenkapital
      { number: '2800', name: 'Aktienkapital / Stammkapital', type: 'EQUITY', parentNumber: null },
      { number: '2810', name: 'Partizipationskapital', type: 'EQUITY', parentNumber: null },
      { number: '2820', name: 'Eigene Aktien / Anteile (Minusposten)', type: 'EQUITY', parentNumber: null },
      { number: '2900', name: 'Gesetzliche Kapitalreserven', type: 'EQUITY', parentNumber: null },
      { number: '2950', name: 'Gesetzliche Gewinnreserven', type: 'EQUITY', parentNumber: null },
      { number: '2960', name: 'Freiwillige Gewinnreserven', type: 'EQUITY', parentNumber: null },
      { number: '2970', name: 'Gewinnvortrag / Verlustvortrag', type: 'EQUITY', parentNumber: null },
      { number: '2979', name: 'Jahresgewinn / Jahresverlust', type: 'EQUITY', parentNumber: null },

      // ============================================================
      // KLASSE 3: ERTRAG
      // ============================================================
      { number: '3000', name: 'Produktionserlöse', type: 'REVENUE', parentNumber: null },
      { number: '3200', name: 'Handelserlöse', type: 'REVENUE', parentNumber: null },
      { number: '3400', name: 'Dienstleistungserlöse', type: 'REVENUE', parentNumber: null },
      { number: '3600', name: 'Übrige Betriebserträge', type: 'REVENUE', parentNumber: null },
      { number: '3700', name: 'Eigenleistungen', type: 'REVENUE', parentNumber: null },
      { number: '3710', name: 'Bestandesänderungen', type: 'REVENUE', parentNumber: null },
      { number: '3800', name: 'Erlösminderungen', type: 'REVENUE', parentNumber: null },
      { number: '3900', name: 'Betrieblicher Nebenertrag', type: 'REVENUE', parentNumber: null },
      { number: '3950', name: 'Finanzerträge', type: 'REVENUE', parentNumber: null },
      { number: '3960', name: 'Ausserordentliche Erträge', type: 'REVENUE', parentNumber: null },

      // ============================================================
      // KLASSE 4: MATERIALAUFWAND
      // ============================================================
      { number: '4000', name: 'Materialaufwand', type: 'EXPENSE', parentNumber: null },
      { number: '4200', name: 'Handelswarenaufwand', type: 'EXPENSE', parentNumber: null },
      { number: '4400', name: 'Aufwand für bezogene Dienstleistungen', type: 'EXPENSE', parentNumber: null },
      { number: '4500', name: 'Übriger Betriebsaufwand (Material)', type: 'EXPENSE', parentNumber: null },

      // ============================================================
      // KLASSE 5: PERSONALAUFWAND
      // ============================================================
      { number: '5000', name: 'Löhne und Gehälter', type: 'EXPENSE', parentNumber: null },
      { number: '5100', name: 'Temporäre Arbeitnehmer', type: 'EXPENSE', parentNumber: null },
      { number: '5700', name: 'AHV/IV/EO/ALV Arbeitgeber', type: 'EXPENSE', parentNumber: null },
      { number: '5710', name: 'BVG (Pensionskasse) Arbeitgeber', type: 'EXPENSE', parentNumber: null },
      { number: '5720', name: 'UVG/NBU Prämien', type: 'EXPENSE', parentNumber: null },
      { number: '5730', name: 'KTG Prämien', type: 'EXPENSE', parentNumber: null },
      { number: '5740', name: 'Quellensteuer (Abzug Arbeitnehmer)', type: 'EXPENSE', parentNumber: null },
      { number: '5800', name: 'Übriger Personalaufwand', type: 'EXPENSE', parentNumber: null },
      { number: '5810', name: 'Aus- und Weiterbildung', type: 'EXPENSE', parentNumber: null },
      { number: '5820', name: 'Personalnebenkosten', type: 'EXPENSE', parentNumber: null },
      { number: '5900', name: 'Sozialleistungen', type: 'EXPENSE', parentNumber: null },

      // ============================================================
      // KLASSE 6: ÜBRIGER BETRIEBSAUFWAND
      // ============================================================
      { number: '6000', name: 'Raumaufwand (Miete)', type: 'EXPENSE', parentNumber: null },
      { number: '6100', name: 'Unterhalt und Reparaturen', type: 'EXPENSE', parentNumber: null },
      { number: '6110', name: 'Fahrzeugaufwand', type: 'EXPENSE', parentNumber: null },
      { number: '6120', name: 'Leasing', type: 'EXPENSE', parentNumber: null },
      { number: '6200', name: 'Fahrzeug- und Transportaufwand', type: 'EXPENSE', parentNumber: null },
      { number: '6210', name: 'Reise- und Repräsentationsaufwand', type: 'EXPENSE', parentNumber: null },
      { number: '6300', name: 'Sachversicherungen und Gebühren', type: 'EXPENSE', parentNumber: null },
      { number: '6400', name: 'Energie und Entsorgung', type: 'EXPENSE', parentNumber: null },
      { number: '6500', name: 'Verwaltungsaufwand', type: 'EXPENSE', parentNumber: null },
      { number: '6510', name: 'Büromaterial und Drucksachen', type: 'EXPENSE', parentNumber: null },
      { number: '6520', name: 'Telefon und Porto', type: 'EXPENSE', parentNumber: null },
      { number: '6530', name: 'Beratungs- und Rechtskosten', type: 'EXPENSE', parentNumber: null },
      { number: '6540', name: 'Revisionskosten', type: 'EXPENSE', parentNumber: null },
      { number: '6570', name: 'Informatikaufwand (IT)', type: 'EXPENSE', parentNumber: null },
      { number: '6600', name: 'Werbeaufwand / Marketing', type: 'EXPENSE', parentNumber: null },
      { number: '6640', name: 'Fachliteratur und Abonnemente', type: 'EXPENSE', parentNumber: null },
      { number: '6700', name: 'Abschreibungen', type: 'EXPENSE', parentNumber: null },
      { number: '6800', name: 'Finanzaufwand', type: 'EXPENSE', parentNumber: null },
      { number: '6801', name: 'Zinsen und Bankspesen', type: 'EXPENSE', parentNumber: null },
      { number: '6900', name: 'Steuern', type: 'EXPENSE', parentNumber: null },
      { number: '6950', name: 'Ausserordentlicher Aufwand', type: 'EXPENSE', parentNumber: null },
    ];

    // Insert all accounts in bulk
    await this.prisma.chartOfAccount.createMany({
      data: accounts.map(acc => ({
        companyId,
        number: acc.number,
        name: acc.name,
        type: acc.type,
        isActive: true,
      })),
      skipDuplicates: true,
    });
  }
}
