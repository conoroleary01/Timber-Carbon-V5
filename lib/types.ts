export type ConversionMode =
  | "manual"
  | "identity"
  | "thickness"
  | "thickness_density"
  | "density_only"
  | "mass_per_item";

export type MaterialLineInput = {
  id: string;
  name: string;

  boqQty: number;
  boqUnit: string;
  declaredUnit: string;

  // legacy UI hint only - engine now resolves conversion automatically
  conversionMode?: ConversionMode;

  // manual fallback only when auto resolution is not possible
  conversionFactorToDeclaredUnit: number;

  // optional physical properties for auto conversion
  thicknessM?: number;
  densityKgPerM3?: number;
  surfaceMassKgPerM2?: number;
  massKgPerItem?: number;
  itemsPerBoqUnit?: number;

  factoryWasteRate: number;
  siteWasteRate: number;

  epdA1A3KgCO2ePerDeclaredUnit: number;

  biogenicMethod?: "none" | "fallback_1_64" | "epd";
  woodMassFraction?: number;
  epdStoredBiogenicCarbonKgCO2ePerDeclaredUnit?: number;

  // manual fallback only when auto mass derivation is not possible
  massTonnesPerDeclaredUnit: number;

  inboundDistanceKm: number;
  inboundTransportKgCO2ePerTkm: number;

  factoryWasteTransportDistanceKm: number;
  factoryWasteTransportKgCO2ePerTkm: number;
  factoryWasteTreatmentKgCO2ePerDeclaredUnit: number;

  siteWasteUpstreamKgCO2ePerDeclaredUnit?: number;
  siteWasteTransportDistanceKm: number;
  siteWasteTransportKgCO2ePerTkm: number;
  siteWasteTreatmentKgCO2ePerDeclaredUnit: number;

  // new methodology support
  materialFamily?: string;
  c2KgCO2ePerKg?: number;
  c3c4KgCO2ePerKg?: number;
};

export type EndOfLifeRouteInput = {
  id: string;
  name: string;
  massTonnes: number;
  distanceKm: number;
  transportKgCO2ePerTkm: number;
  processingKgCO2ePerTonne: number;
  disposedMassTonnes: number;
  disposalKgCO2ePerTonne: number;
};

export type ModuleDefaultsInput = {
  a4TransportFactorKgCO2ePerTkm: number;
  a5DemolitionKgCO2ePerM2: number;
  a5ConstructionConstantKgCO2e: number;
  a5PercentOfA1A4: number;
  b2FractionOfA1A5: number;
  b3FractionOfB2: number;
  c1KgCO2ePerM2: number;
  c2KgCO2ePerKg: number;
};

export type ProjectInput = {
  projectName: string;
  reportingAreaM2: number;
  giaDemolishedM2: number;
  referenceStudyPeriodYears: number;

  materials: MaterialLineInput[];

  factory: {
    allocatedManufacturingKgCO2e: number;
    a4DistanceKm: number;
  };

  // keep for compatibility while refactoring calc.ts
  endOfLife: {
    c1KgCO2e: number;
    routes: EndOfLifeRouteInput[];
  };

  // new methodology defaults from Supabase
  moduleDefaults?: ModuleDefaultsInput;

  assumptions?: string[];
};

export type MaterialLineResult = {
  id: string;
  name: string;
  boqQty: number;
  boqUnit: string;
  declaredInstalledQty: number;
  declaredUnit: string;

  grossFactoryInputQty: number;
  factoryWasteQty: number;

  supplierA1A3NetKgCO2e: number;
  factoryWasteUpstreamKgCO2e: number;
  supplierA1A3GrossKgCO2e: number;

  grossInputMassTonnes: number;
  deliveredToSiteMassTonnes: number;
  inboundTransportKgCO2e: number;

  factoryWasteTransportKgCO2e: number;
  factoryWasteTreatmentKgCO2e: number;

  siteInputQty: number;
  siteWasteQty: number;
  siteWasteUpstreamKgCO2e: number;
  siteWasteTransportKgCO2e: number;
  siteWasteTreatmentKgCO2e: number;

  installedMassKg: number;

  storedBiogenicCarbonKgCO2e: number;
  a5BiogenicKgCO2e: number;
  netStoredBiogenicCarbonKgCO2e: number;
};

export type ReplacementResult = {
  id: string;
  name: string;
  serviceLifeYears: number;
  replacementBurdenKgCO2e: number;
  replacementCount: number;
  totalKgCO2e: number;
};

export type CalculationCheck = {
  name: string;
  pass: boolean;
  expected: number;
  actual: number;
  difference: number;
};

export type CalculationResult = {
  materials: MaterialLineResult[];
  checks: CalculationCheck[];

  modules: {
    purchasedProductsA1A3KgCO2e: number;
    inboundTransportKgCO2e: number;
    factoryManufacturingKgCO2e: number;
    factoryWasteEndProcessingKgCO2e: number;
    finishedProductA1A3KgCO2e: number;

    A4DeliveredMassTonnes: number;
    A4KgCO2e: number;

    A5DemolitionKgCO2e: number;
    A5ConstructionKgCO2e: number;
    A5PercentOfA1A4KgCO2e: number;
    A5FossilKgCO2e: number;

    storedBiogenicCarbonKgCO2e: number;
    A5BiogenicKgCO2e: number;
    netStoredBiogenicCarbonKgCO2e: number;

    A5KgCO2e: number;
    upfrontCarbonKgCO2e: number;

    B2KgCO2e: number;
    B3KgCO2e: number;

    C1KgCO2e: number;
    C2KgCO2e: number;
    C3KgCO2e: number;
    C4KgCO2e: number;
    C3C4KgCO2e: number;

    embodiedCarbonTotalKgCO2e: number;

    upfrontCarbonPerM2KgCO2e: number | null;
    embodiedCarbonPerM2KgCO2e: number | null;
  };
};