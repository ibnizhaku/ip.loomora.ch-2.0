// Mock Data für Frontend-Entwicklung ohne Backend
// Diese Daten werden verwendet, wenn der API-Server nicht erreichbar ist

export const mockCustomers = {
  data: [
    {
      id: "c1",
      number: "K-001",
      companyName: "Müller Stahlbau AG",
      name: "Müller Stahlbau AG",
      firstName: "Hans",
      lastName: "Müller",
      email: "info@mueller-stahlbau.ch",
      phone: "+41 44 123 45 67",
      website: "www.mueller-stahlbau.ch",
      street: "Industriestrasse 42",
      city: "Zürich",
      zip: "8001",
      country: "Schweiz",
      vatNumber: "CHE-123.456.789",
      isActive: true,
      customerType: "COMPANY",
      totalRevenue: 245000,
      openInvoices: 2,
      lastOrderDate: "2024-01-15",
      createdAt: "2023-01-10",
    },
    {
      id: "c2",
      number: "K-002",
      companyName: "Weber Metallbau GmbH",
      name: "Weber Metallbau GmbH",
      firstName: "Peter",
      lastName: "Weber",
      email: "kontakt@weber-metall.ch",
      phone: "+41 31 987 65 43",
      street: "Werkstrasse 15",
      city: "Bern",
      zip: "3001",
      country: "Schweiz",
      isActive: true,
      customerType: "COMPANY",
      totalRevenue: 189500,
      openInvoices: 1,
      lastOrderDate: "2024-01-20",
      createdAt: "2023-02-15",
    },
    {
      id: "c3",
      number: "K-003",
      companyName: "Schmidt Bau AG",
      name: "Schmidt Bau AG",
      firstName: "Klaus",
      lastName: "Schmidt",
      email: "info@schmidt-bau.ch",
      phone: "+41 61 222 33 44",
      street: "Bauweg 8",
      city: "Basel",
      zip: "4001",
      country: "Schweiz",
      isActive: true,
      customerType: "COMPANY",
      totalRevenue: 312000,
      openInvoices: 0,
      lastOrderDate: "2024-01-25",
      createdAt: "2023-03-01",
    },
    {
      id: "c4",
      number: "K-004",
      companyName: "Huber Konstruktion",
      name: "Huber Konstruktion",
      firstName: "Maria",
      lastName: "Huber",
      email: "maria@huber-konstruktion.ch",
      phone: "+41 71 555 66 77",
      street: "Technikstrasse 23",
      city: "St. Gallen",
      zip: "9000",
      country: "Schweiz",
      isActive: true,
      customerType: "COMPANY",
      totalRevenue: 156800,
      openInvoices: 3,
      lastOrderDate: "2024-01-18",
      createdAt: "2023-04-10",
    },
    {
      id: "c5",
      number: "K-005",
      companyName: "Keller Engineering",
      name: "Keller Engineering",
      firstName: "Thomas",
      lastName: "Keller",
      email: "t.keller@keller-eng.ch",
      phone: "+41 41 888 99 00",
      street: "Ingenieurplatz 5",
      city: "Luzern",
      zip: "6000",
      country: "Schweiz",
      isActive: false,
      customerType: "COMPANY",
      totalRevenue: 78500,
      openInvoices: 0,
      lastOrderDate: "2023-12-01",
      createdAt: "2023-05-20",
    },
  ],
  total: 5,
  page: 1,
  pageSize: 100,
};

export const mockProjects = {
  data: [
    {
      id: "p1",
      number: "PRJ-2024-001",
      name: "Stahltreppe Bürogebäude",
      description: "Konstruktion und Montage einer Stahltreppe für das neue Bürogebäude",
      customerId: "c1",
      customer: { id: "c1", name: "Müller Stahlbau AG", companyName: "Müller Stahlbau AG" },
      managerId: "1",
      manager: { id: "1", firstName: "Max", lastName: "Müller" },
      status: "ACTIVE",
      priority: "HIGH",
      progress: 65,
      startDate: "2024-01-15",
      endDate: "2024-03-30",
      budget: 85000,
      spent: 52000,
      team: ["Max Müller", "Anna Schmidt"],
      tasks: [
        { id: "t1", title: "Planung abschliessen", status: "DONE" },
        { id: "t2", title: "Material bestellen", status: "DONE" },
        { id: "t3", title: "Fertigung", status: "IN_PROGRESS" },
        { id: "t4", title: "Montage", status: "PENDING" },
      ],
      createdAt: "2024-01-10",
    },
    {
      id: "p2",
      number: "PRJ-2024-002",
      name: "Geländer Einkaufszentrum",
      description: "Sicherheitsgeländer für das Parkhaus",
      customerId: "c2",
      customer: { id: "c2", name: "Weber Metallbau GmbH", companyName: "Weber Metallbau GmbH" },
      managerId: "2",
      manager: { id: "2", firstName: "Anna", lastName: "Schmidt" },
      status: "ACTIVE",
      priority: "MEDIUM",
      progress: 30,
      startDate: "2024-02-01",
      endDate: "2024-04-15",
      budget: 42000,
      spent: 12500,
      team: ["Peter Fischer"],
      tasks: [
        { id: "t5", title: "Aufmass vor Ort", status: "DONE" },
        { id: "t6", title: "Zeichnungen erstellen", status: "IN_PROGRESS" },
        { id: "t7", title: "Produktion", status: "PENDING" },
      ],
      createdAt: "2024-01-25",
    },
    {
      id: "p3",
      number: "PRJ-2024-003",
      name: "Industrietor Lagerhalle",
      description: "Grosses Industrietor mit elektrischem Antrieb",
      customerId: "c3",
      customer: { id: "c3", name: "Schmidt Bau AG", companyName: "Schmidt Bau AG" },
      managerId: "1",
      manager: { id: "1", firstName: "Max", lastName: "Müller" },
      status: "PLANNING",
      priority: "LOW",
      progress: 10,
      startDate: "2024-03-01",
      endDate: "2024-05-30",
      budget: 28000,
      spent: 2800,
      team: ["Max Müller"],
      tasks: [
        { id: "t8", title: "Anforderungsanalyse", status: "IN_PROGRESS" },
      ],
      createdAt: "2024-02-01",
    },
    {
      id: "p4",
      number: "PRJ-2024-004",
      name: "Balkongeländer Wohnüberbauung",
      description: "120 Meter Balkongeländer in Edelstahl",
      customerId: "c4",
      customer: { id: "c4", name: "Huber Konstruktion", companyName: "Huber Konstruktion" },
      managerId: "1",
      manager: { id: "1", firstName: "Max", lastName: "Müller" },
      status: "COMPLETED",
      priority: "HIGH",
      progress: 100,
      startDate: "2023-10-01",
      endDate: "2024-01-15",
      budget: 156000,
      spent: 148500,
      team: ["Anna Schmidt", "Peter Fischer", "Max Müller"],
      tasks: [
        { id: "t9", title: "Alle Aufgaben erledigt", status: "DONE" },
      ],
      createdAt: "2023-09-15",
    },
    {
      id: "p5",
      number: "PRJ-2024-005",
      name: "Fassadenverkleidung Hotel",
      description: "Aluminium-Fassadenelemente für Hotelneubau",
      customerId: "c1",
      customer: { id: "c1", name: "Müller Stahlbau AG", companyName: "Müller Stahlbau AG" },
      managerId: "1",
      manager: { id: "1", firstName: "Max", lastName: "Müller" },
      status: "ACTIVE",
      priority: "HIGH",
      progress: 45,
      startDate: "2024-01-20",
      endDate: "2024-06-30",
      budget: 220000,
      spent: 98000,
      team: ["Max Müller", "Lisa Weber"],
      tasks: [
        { id: "t10", title: "Materialbestellung", status: "DONE" },
        { id: "t11", title: "Zuschnitt", status: "IN_PROGRESS" },
        { id: "t12", title: "Oberflächenbehandlung", status: "PENDING" },
      ],
      createdAt: "2024-01-15",
    },
    {
      id: "p6",
      number: "PRJ-2024-006",
      name: "Carport Überdachung",
      description: "Stahlkonstruktion für 10 Stellplätze",
      customerId: "c5",
      customer: { id: "c5", name: "Keller Engineering", companyName: "Keller Engineering" },
      managerId: "3",
      manager: { id: "3", firstName: "Peter", lastName: "Fischer" },
      status: "PAUSED",
      priority: "LOW",
      progress: 20,
      startDate: "2024-02-15",
      endDate: "2024-05-15",
      budget: 35000,
      spent: 7000,
      team: ["Peter Fischer"],
      tasks: [
        { id: "t13", title: "Statikberechnung", status: "DONE" },
        { id: "t14", title: "Bewilligung einholen", status: "IN_PROGRESS" },
      ],
      createdAt: "2024-02-10",
    },
  ],
  total: 6,
  page: 1,
  pageSize: 50,
};

export const mockProjectStats = {
  total: 4,
  active: 2,
  completed: 1,
  paused: 0,
};

export const mockCostCenters = {
  data: [
    { id: "cc1", code: "100", number: "100", name: "Fertigung", description: "Werkstattfertigung", isActive: true, budget: 500000, actualCost: 320000 },
    { id: "cc2", code: "200", number: "200", name: "Montage", description: "Baustellenmontage", isActive: true, budget: 300000, actualCost: 180000 },
    { id: "cc3", code: "300", number: "300", name: "Planung", description: "Konstruktion und Planung", isActive: true, budget: 150000, actualCost: 95000 },
    { id: "cc4", code: "400", number: "400", name: "Verwaltung", description: "Administration", isActive: true, budget: 100000, actualCost: 72000 },
    { id: "cc5", code: "500", number: "500", name: "Lager", description: "Lagerhaltung", isActive: true, budget: 80000, actualCost: 45000 },
  ],
  total: 5,
  page: 1,
  pageSize: 100,
};

export const mockEmployees = {
  data: [
    {
      id: "e1",
      employeeNumber: "MA-001",
      firstName: "Max",
      lastName: "Müller",
      email: "m.mueller@loomora.ch",
      phone: "+41 79 123 45 67",
      position: "Projektleiter",
      department: "Fertigung",
      status: "ACTIVE",
      startDate: "2020-03-01",
      hourlyRate: 85,
    },
    {
      id: "e2",
      employeeNumber: "MA-002",
      firstName: "Anna",
      lastName: "Schmidt",
      email: "a.schmidt@loomora.ch",
      phone: "+41 79 234 56 78",
      position: "Metallbauer",
      department: "Fertigung",
      status: "ACTIVE",
      startDate: "2021-06-15",
      hourlyRate: 72,
    },
    {
      id: "e3",
      employeeNumber: "MA-003",
      firstName: "Peter",
      lastName: "Fischer",
      email: "p.fischer@loomora.ch",
      phone: "+41 79 345 67 89",
      position: "Monteur",
      department: "Montage",
      status: "ACTIVE",
      startDate: "2019-09-01",
      hourlyRate: 78,
    },
    {
      id: "e4",
      employeeNumber: "MA-004",
      firstName: "Lisa",
      lastName: "Weber",
      email: "l.weber@loomora.ch",
      phone: "+41 79 456 78 90",
      position: "Konstrukteur",
      department: "Planung",
      status: "ACTIVE",
      startDate: "2022-01-10",
      hourlyRate: 82,
    },
  ],
  total: 4,
  page: 1,
  pageSize: 100,
};

export const mockTimeTypes = [
  { id: "tt1", code: "PROJECT", name: "Projektzeit", description: "Direkte Projektarbeit", isProjectRelevant: true, isBillable: true, affectsCapacity: true },
  { id: "tt2", code: "ORDER", name: "Auftragszeit", description: "Interne Aufträge", isProjectRelevant: true, isBillable: true, affectsCapacity: true },
  { id: "tt3", code: "GENERAL", name: "Allgemeine Tätigkeit", description: "Nicht projektbezogen", isProjectRelevant: false, isBillable: false, affectsCapacity: true },
  { id: "tt4", code: "ADMIN", name: "Administration", description: "Verwaltungsaufgaben", isProjectRelevant: false, isBillable: false, affectsCapacity: true },
  { id: "tt5", code: "TRAINING", name: "Weiterbildung", description: "Schulungen und Kurse", isProjectRelevant: false, isBillable: false, affectsCapacity: true },
  { id: "tt6", code: "ABSENCE", name: "Abwesenheit", description: "Ferien, Krankheit etc.", isProjectRelevant: false, isBillable: false, affectsCapacity: false },
];

export const mockActivityTypes = [
  { id: "at1", code: "SCHWEISSEN", name: "Schweissen", category: "Fertigung", description: "Schweissarbeiten" },
  { id: "at2", code: "SCHNEIDEN", name: "Schneiden", category: "Fertigung", description: "Laser-/Plasma-Schneiden" },
  { id: "at3", code: "BIEGEN", name: "Biegen", category: "Fertigung", description: "Biegearbeiten" },
  { id: "at4", code: "MONTAGE", name: "Montage", category: "Montage", description: "Baustellenmontage" },
  { id: "at5", code: "PLANUNG", name: "Planung", category: "Büro", description: "Konstruktion und Planung" },
  { id: "at6", code: "QUALITAET", name: "Qualitätskontrolle", category: "QS", description: "Prüfungen und Tests" },
];

export const mockMachines = {
  data: [
    { id: "m1", name: "Laserschneider TruLaser 3030", machineType: "LASER", hourlyRate: 145, status: "ACTIVE", costCenter: { id: "cc1", name: "Fertigung", number: "100" } },
    { id: "m2", name: "Plasmaschneider HD3070", machineType: "PLASMA", hourlyRate: 95, status: "ACTIVE", costCenter: { id: "cc1", name: "Fertigung", number: "100" } },
    { id: "m3", name: "Abkantpresse TruBend 5130", machineType: "BIEGE", hourlyRate: 85, status: "ACTIVE", costCenter: { id: "cc1", name: "Fertigung", number: "100" } },
    { id: "m4", name: "CNC-Fräse DMG MORI", machineType: "CNC", hourlyRate: 120, status: "MAINTENANCE", costCenter: { id: "cc1", name: "Fertigung", number: "100" } },
    { id: "m5", name: "Bandsäge Behringer", machineType: "SAEGE", hourlyRate: 45, status: "ACTIVE", costCenter: { id: "cc1", name: "Fertigung", number: "100" } },
  ],
  total: 5,
  page: 1,
  pageSize: 100,
};

export const mockProjectPhases: Record<string, any[]> = {
  p1: [
    { id: "ph1", projectId: "p1", name: "Planung", phaseType: "PLANUNG", sequence: 1, budgetAmount: 8500, actualAmount: 8200, isCompleted: true },
    { id: "ph2", projectId: "p1", name: "Fertigung", phaseType: "FERTIGUNG", sequence: 2, budgetAmount: 51000, actualAmount: 32000, isCompleted: false },
    { id: "ph3", projectId: "p1", name: "Montage", phaseType: "MONTAGE", sequence: 3, budgetAmount: 17000, actualAmount: 8500, isCompleted: false },
    { id: "ph4", projectId: "p1", name: "Abschluss", phaseType: "ABSCHLUSS", sequence: 4, budgetAmount: 8500, actualAmount: 0, isCompleted: false },
  ],
  p2: [
    { id: "ph5", projectId: "p2", name: "Planung", phaseType: "PLANUNG", sequence: 1, budgetAmount: 4200, actualAmount: 3800, isCompleted: true },
    { id: "ph6", projectId: "p2", name: "Fertigung", phaseType: "FERTIGUNG", sequence: 2, budgetAmount: 25200, actualAmount: 8700, isCompleted: false },
    { id: "ph7", projectId: "p2", name: "Montage", phaseType: "MONTAGE", sequence: 3, budgetAmount: 12600, actualAmount: 0, isCompleted: false },
  ],
};

export const mockProjectControlling: Record<string, any> = {
  p1: {
    projectId: "p1",
    projectName: "Stahltreppe Bürogebäude",
    projectNumber: "PRJ-2024-001",
    projectType: "KOMBINIERT",
    status: "ACTIVE",
    budgetTotal: 85000,
    actualCostTotal: 52000,
    budgetRemaining: 33000,
    budgetUsedPercent: 61.2,
    laborCosts: 28000,
    machineCosts: 12500,
    materialCosts: 9800,
    externalCosts: 1200,
    overheadCosts: 500,
    revenueTotal: 85000,
    deckungsbeitrag: 33000,
    margin: 33000,
    marginPercent: 38.8,
    status_color: "green",
    warnings: [],
    phases: [
      { id: "ph1", name: "Planung", phaseType: "PLANUNG", budgetAmount: 8500, actualAmount: 8200, isCompleted: true },
      { id: "ph2", name: "Fertigung", phaseType: "FERTIGUNG", budgetAmount: 51000, actualAmount: 32000, isCompleted: false },
      { id: "ph3", name: "Montage", phaseType: "MONTAGE", budgetAmount: 17000, actualAmount: 8500, isCompleted: false },
      { id: "ph4", name: "Abschluss", phaseType: "ABSCHLUSS", budgetAmount: 8500, actualAmount: 0, isCompleted: false },
    ],
  },
  p2: {
    projectId: "p2",
    projectName: "Geländer Einkaufszentrum",
    projectNumber: "PRJ-2024-002",
    projectType: "MONTAGE",
    status: "ACTIVE",
    budgetTotal: 42000,
    actualCostTotal: 12500,
    budgetRemaining: 29500,
    budgetUsedPercent: 29.8,
    laborCosts: 7200,
    machineCosts: 3100,
    materialCosts: 1800,
    externalCosts: 400,
    overheadCosts: 0,
    revenueTotal: 42000,
    deckungsbeitrag: 29500,
    margin: 29500,
    marginPercent: 70.2,
    status_color: "green",
    warnings: [],
    phases: [
      { id: "ph5", name: "Planung", phaseType: "PLANUNG", budgetAmount: 4200, actualAmount: 3800, isCompleted: true },
      { id: "ph6", name: "Fertigung", phaseType: "FERTIGUNG", budgetAmount: 25200, actualAmount: 8700, isCompleted: false },
      { id: "ph7", name: "Montage", phaseType: "MONTAGE", budgetAmount: 12600, actualAmount: 0, isCompleted: false },
    ],
  },
};

// Mock Products für Artikelstamm
export const mockProductCategories = [
  { id: "cat1", name: "Stahl", description: "Stahlprodukte und Halbzeuge", productCount: 12 },
  { id: "cat2", name: "Aluminium", description: "Aluminiumprodukte", productCount: 8 },
  { id: "cat3", name: "Edelstahl", description: "Rostfreie Stähle", productCount: 6 },
  { id: "cat4", name: "Zubehör", description: "Verbindungselemente und Kleinteile", productCount: 24 },
  { id: "cat5", name: "Dienstleistungen", description: "Arbeits- und Serviceleistungen", productCount: 5 },
];

export const mockProducts = {
  data: [
    {
      id: "prod1",
      sku: "ST-FL-10x100",
      name: "Stahlflachstahl 10x100mm",
      description: "Warmgewalzter Flachstahl S235JR",
      categoryId: "cat1",
      category: { id: "cat1", name: "Stahl" },
      unit: "m",
      purchasePrice: 12.50,
      salePrice: 18.75,
      vatRate: "STANDARD",
      stockQuantity: 250,
      minStock: 50,
      maxStock: 500,
      isActive: true,
      isService: false,
      createdAt: "2024-01-15",
    },
    {
      id: "prod2",
      sku: "ST-RR-40x40",
      name: "Stahlrohr quadratisch 40x40mm",
      description: "Quadratrohr S235JR, Wandstärke 3mm",
      categoryId: "cat1",
      category: { id: "cat1", name: "Stahl" },
      unit: "m",
      purchasePrice: 8.90,
      salePrice: 13.35,
      vatRate: "STANDARD",
      stockQuantity: 180,
      minStock: 40,
      maxStock: 300,
      isActive: true,
      isService: false,
      createdAt: "2024-01-15",
    },
    {
      id: "prod3",
      sku: "AL-PR-50x50",
      name: "Aluminium Profil 50x50mm",
      description: "Aluminium Vierkantprofil EN AW-6060",
      categoryId: "cat2",
      category: { id: "cat2", name: "Aluminium" },
      unit: "m",
      purchasePrice: 15.20,
      salePrice: 22.80,
      vatRate: "STANDARD",
      stockQuantity: 120,
      minStock: 30,
      maxStock: 200,
      isActive: true,
      isService: false,
      createdAt: "2024-01-20",
    },
    {
      id: "prod4",
      sku: "ES-BL-2x1000",
      name: "Edelstahlblech 2mm 1000x2000",
      description: "Edelstahlblech 1.4301, geschliffen K240",
      categoryId: "cat3",
      category: { id: "cat3", name: "Edelstahl" },
      unit: "Stk",
      purchasePrice: 185.00,
      salePrice: 259.00,
      vatRate: "STANDARD",
      stockQuantity: 25,
      minStock: 10,
      maxStock: 50,
      isActive: true,
      isService: false,
      createdAt: "2024-01-22",
    },
    {
      id: "prod5",
      sku: "ZUB-SCH-M10",
      name: "Sechskantschraube M10x30 verzinkt",
      description: "DIN 933, Festigkeitsklasse 8.8",
      categoryId: "cat4",
      category: { id: "cat4", name: "Zubehör" },
      unit: "Stk",
      purchasePrice: 0.25,
      salePrice: 0.45,
      vatRate: "STANDARD",
      stockQuantity: 2500,
      minStock: 500,
      maxStock: 5000,
      isActive: true,
      isService: false,
      createdAt: "2024-01-10",
    },
    {
      id: "prod6",
      sku: "DL-SCHW-STD",
      name: "Schweissarbeiten Standardstahl",
      description: "Schweissarbeiten MIG/MAG pro Stunde",
      categoryId: "cat5",
      category: { id: "cat5", name: "Dienstleistungen" },
      unit: "Std",
      purchasePrice: 0,
      salePrice: 95.00,
      vatRate: "STANDARD",
      stockQuantity: 0,
      minStock: 0,
      maxStock: 0,
      isActive: true,
      isService: true,
      createdAt: "2024-01-05",
    },
    {
      id: "prod7",
      sku: "DL-MONT-AUS",
      name: "Montage Ausseneinsatz",
      description: "Montagearbeiten vor Ort, pro Stunde",
      categoryId: "cat5",
      category: { id: "cat5", name: "Dienstleistungen" },
      unit: "Std",
      purchasePrice: 0,
      salePrice: 125.00,
      vatRate: "STANDARD",
      stockQuantity: 0,
      minStock: 0,
      maxStock: 0,
      isActive: true,
      isService: true,
      createdAt: "2024-01-05",
    },
    {
      id: "prod8",
      sku: "ST-WIN-60x60",
      name: "Winkelstahl 60x60x6mm",
      description: "Gleichschenkliger Winkelstahl S235JR",
      categoryId: "cat1",
      category: { id: "cat1", name: "Stahl" },
      unit: "m",
      purchasePrice: 9.80,
      salePrice: 14.70,
      vatRate: "STANDARD",
      stockQuantity: 85,
      minStock: 30,
      maxStock: 150,
      isActive: true,
      isService: false,
      createdAt: "2024-02-01",
    },
    {
      id: "prod9",
      sku: "ZUB-MUT-M10",
      name: "Sechskantmutter M10 verzinkt",
      description: "DIN 934, Festigkeitsklasse 8",
      categoryId: "cat4",
      category: { id: "cat4", name: "Zubehör" },
      unit: "Stk",
      purchasePrice: 0.08,
      salePrice: 0.15,
      vatRate: "STANDARD",
      stockQuantity: 3200,
      minStock: 1000,
      maxStock: 8000,
      isActive: true,
      isService: false,
      createdAt: "2024-01-10",
    },
    {
      id: "prod10",
      sku: "AL-RR-30x30",
      name: "Aluminium Rohr quadratisch 30x30mm",
      description: "Aluminiumrohr EN AW-6060, Wandstärke 2mm",
      categoryId: "cat2",
      category: { id: "cat2", name: "Aluminium" },
      unit: "m",
      purchasePrice: 6.50,
      salePrice: 9.75,
      vatRate: "STANDARD",
      stockQuantity: 15,
      minStock: 25,
      maxStock: 100,
      isActive: true,
      isService: false,
      createdAt: "2024-01-25",
    },
  ],
  total: 10,
  page: 1,
  pageSize: 100,
};

// Mock Data Router - gibt passende Mock-Daten für Endpunkte zurück
export function getMockData(endpoint: string): any {
  // Normalisiere den Endpunkt
  const normalizedEndpoint = endpoint.split('?')[0];
  
  // Customers
  if (normalizedEndpoint === '/customers' || normalizedEndpoint.startsWith('/customers?')) {
    return mockCustomers;
  }
  if (normalizedEndpoint.match(/^\/customers\/[^/]+$/)) {
    const id = normalizedEndpoint.split('/')[2];
    return mockCustomers.data.find(c => c.id === id) || null;
  }
  
  // Projects
  if (normalizedEndpoint === '/projects' || normalizedEndpoint.startsWith('/projects?')) {
    // Parse query parameters for filtering
    const queryString = endpoint.split('?')[1];
    const params = new URLSearchParams(queryString || '');
    const managerId = params.get('managerId');
    
    let filteredData = mockProjects.data;
    
    if (managerId) {
      filteredData = filteredData.filter(p => p.managerId === managerId);
    }
    
    return {
      data: filteredData,
      total: filteredData.length,
      page: 1,
      pageSize: 50,
    };
  }
  if (normalizedEndpoint === '/projects/stats') {
    return mockProjectStats;
  }
  if (normalizedEndpoint.match(/^\/projects\/[^/]+$/)) {
    const id = normalizedEndpoint.split('/')[2];
    return mockProjects.data.find(p => p.id === id) || null;
  }
  
  // Cost Centers
  if (normalizedEndpoint === '/cost-centers' || normalizedEndpoint.startsWith('/cost-centers?')) {
    return mockCostCenters;
  }
  
  // Products
  if (normalizedEndpoint === '/products/categories') {
    return mockProductCategories;
  }
  if (normalizedEndpoint === '/products' || normalizedEndpoint.startsWith('/products?')) {
    // Parse query parameters for filtering
    const queryString = endpoint.split('?')[1];
    const params = new URLSearchParams(queryString || '');
    const categoryId = params.get('categoryId');
    const isService = params.get('isService');
    const search = params.get('search');
    
    let filteredData = mockProducts.data;
    
    if (categoryId) {
      filteredData = filteredData.filter(p => p.categoryId === categoryId);
    }
    if (isService !== null && isService !== undefined) {
      filteredData = filteredData.filter(p => p.isService === (isService === 'true'));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.sku.toLowerCase().includes(searchLower)
      );
    }
    
    return {
      data: filteredData,
      total: filteredData.length,
      page: 1,
      pageSize: 100,
    };
  }
  if (normalizedEndpoint.match(/^\/products\/[^/]+$/)) {
    const id = normalizedEndpoint.split('/')[2];
    return mockProducts.data.find(p => p.id === id) || null;
  }
  
  // Employees
  if (normalizedEndpoint === '/employees' || normalizedEndpoint.startsWith('/employees?')) {
    return mockEmployees;
  }
  
  // Metallbau - Time Types
  if (normalizedEndpoint === '/metallbau/time-types') {
    return mockTimeTypes;
  }
  
  // Metallbau - Activity Types
  if (normalizedEndpoint === '/metallbau/activity-types') {
    return mockActivityTypes;
  }
  
  // Metallbau - Machines
  if (normalizedEndpoint === '/metallbau/machines' || normalizedEndpoint.startsWith('/metallbau/machines?')) {
    return mockMachines;
  }
  
  // Metallbau - Project Phases
  const phasesMatch = normalizedEndpoint.match(/^\/metallbau\/projects\/([^/]+)\/phases$/);
  if (phasesMatch) {
    return mockProjectPhases[phasesMatch[1]] || [];
  }
  
  // Metallbau - Project Controlling
  const controllingMatch = normalizedEndpoint.match(/^\/metallbau\/projects\/([^/]+)\/controlling$/);
  if (controllingMatch) {
    return mockProjectControlling[controllingMatch[1]] || null;
  }
  
  // Default: Leere Daten zurückgeben
  console.warn(`[MockData] Keine Mock-Daten für: ${endpoint}`);
  return { data: [], total: 0, page: 1, pageSize: 10 };
}
