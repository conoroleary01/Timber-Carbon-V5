import {
  CalculationCheck,
  CalculationResult,
  MaterialLineInput,
  MaterialLineResult,
  ModuleDefaultsInput,
  ProjectInput,
} from "@/lib/types";

import {
  deriveConversionFactorToDeclaredUnit,
  deriveMassTonnesPerDeclaredUnit,
} from "@/lib/conversion";

const EPSILON = 1e-9;
const BIOGENIC_STORAGE_FACTOR_KGCO2E_PER_KG_TIMBER = -1.64;

const FALLBACK_MODULE_DEFAULTS: ModuleDefaultsInput = {
  a4TransportFactorKgCO2ePerTkm: 0.1211,
  a5DemolitionKgCO2ePerM2: 17.5,
  a5ConstructionConstantKgCO2e: 536.385,
  a5PercentOfA1A4: 0.01,
  b2FractionOfA1A5: 0.01,
  b3FractionOfB2: 0.25,
  c1KgCO2ePerM2: 5,
  c2KgCO2ePerKg: 0.009,
};

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

function assertFiniteNumber(name: string, value: number) {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }
}

function assertNonNegative(name: string, value: number) {
  assertFiniteNumber(name, value);
  if (value < 0) {
    throw new Error(`${name} must be >= 0`);
  }
}

function assertRate(name: string, value: number) {
  assertFiniteNumber(name, value);
  if (value < 0 || value >= 1) {
    throw new Error(`${name} must be between 0 and less than 1`);
  }
}

function check(name: string, expected: number, actual: number): CalculationCheck {
  const difference = actual - expected;
  return {
    name,
    pass: Math.abs(difference) < EPSILON,
    expected,
    actual,
    difference,
  };
}

function getModuleDefaults(input: ProjectInput): ModuleDefaultsInput {
  return {
    ...FALLBACK_MODULE_DEFAULTS,
    ...(input.moduleDefaults ?? {}),
  };
}

function deriveInstalledMassKg(
  declaredInstalledQty: number,
  massTonnesPerDeclaredUnit: number,
): number {
  return declaredInstalledQty * massTonnesPerDeclaredUnit * 1000;
}

function deriveStoredBiogenicCarbonKgCO2e(
  line: MaterialLineInput,
  declaredInstalledQty: number,
  installedMassKg: number,
): number {
  const biogenicMethod = line.biogenicMethod ?? "none";

  if (biogenicMethod === "none") {
    return 0;
  }

  if (biogenicMethod === "epd") {
    if (line.epdStoredBiogenicCarbonKgCO2ePerDeclaredUnit == null) {
      throw new Error(
        `${line.name}: epdStoredBiogenicCarbonKgCO2ePerDeclaredUnit is required when biogenicMethod is "epd"`,
      );
    }

    return (
      declaredInstalledQty *
      line.epdStoredBiogenicCarbonKgCO2ePerDeclaredUnit
    );
  }

  if (biogenicMethod === "fallback_1_64") {
    const woodMassFraction = line.woodMassFraction ?? 1;

    return (
      installedMassKg *
      woodMassFraction *
      BIOGENIC_STORAGE_FACTOR_KGCO2E_PER_KG_TIMBER
    );
  }

  throw new Error(`${line.name}: unsupported biogenicMethod "${biogenicMethod}"`);
}

function deriveA5BiogenicKgCO2e(
  storedBiogenicCarbonKgCO2e: number,
  siteWasteRate: number,
): number {
  return Math.abs(storedBiogenicCarbonKgCO2e) * siteWasteRate;
}

function validateMaterial(line: MaterialLineInput) {
  assertNonNegative(`${line.name} boqQty`, line.boqQty);
  assertNonNegative(
    `${line.name} conversionFactorToDeclaredUnit`,
    line.conversionFactorToDeclaredUnit,
  );
  assertRate(`${line.name} factoryWasteRate`, line.factoryWasteRate);
  assertRate(`${line.name} siteWasteRate`, line.siteWasteRate);

  assertFiniteNumber(
    `${line.name} epdA1A3KgCO2ePerDeclaredUnit`,
    line.epdA1A3KgCO2ePerDeclaredUnit,
  );

  if (line.biogenicMethod !== undefined) {
    const allowedBiogenicMethods = ["none", "fallback_1_64", "epd"];
    if (!allowedBiogenicMethods.includes(line.biogenicMethod)) {
      throw new Error(
        `${line.name} biogenicMethod must be one of ${allowedBiogenicMethods.join(", ")}`,
      );
    }
  }

  if (line.woodMassFraction != null) {
    assertFiniteNumber(`${line.name} woodMassFraction`, line.woodMassFraction);
    if (line.woodMassFraction < 0 || line.woodMassFraction > 1) {
      throw new Error(`${line.name} woodMassFraction must be between 0 and 1`);
    }
  }

  if (line.epdStoredBiogenicCarbonKgCO2ePerDeclaredUnit != null) {
    assertFiniteNumber(
      `${line.name} epdStoredBiogenicCarbonKgCO2ePerDeclaredUnit`,
      line.epdStoredBiogenicCarbonKgCO2ePerDeclaredUnit,
    );
  }

  assertNonNegative(
    `${line.name} massTonnesPerDeclaredUnit`,
    line.massTonnesPerDeclaredUnit,
  );

  if (line.thicknessM != null) {
    assertNonNegative(`${line.name} thicknessM`, line.thicknessM);
  }

  if (line.densityKgPerM3 != null) {
    assertNonNegative(`${line.name} densityKgPerM3`, line.densityKgPerM3);
  }

  if (line.surfaceMassKgPerM2 != null) {
    assertNonNegative(
      `${line.name} surfaceMassKgPerM2`,
      line.surfaceMassKgPerM2,
    );
  }

  if (line.massKgPerItem != null) {
    assertNonNegative(`${line.name} massKgPerItem`, line.massKgPerItem);
  }

  if (line.itemsPerBoqUnit != null) {
    assertNonNegative(`${line.name} itemsPerBoqUnit`, line.itemsPerBoqUnit);
  }

  deriveConversionFactorToDeclaredUnit(line);
  deriveMassTonnesPerDeclaredUnit(line);

  assertNonNegative(`${line.name} inboundDistanceKm`, line.inboundDistanceKm);
  assertNonNegative(
    `${line.name} inboundTransportKgCO2ePerTkm`,
    line.inboundTransportKgCO2ePerTkm,
  );
  assertNonNegative(
    `${line.name} factoryWasteTransportDistanceKm`,
    line.factoryWasteTransportDistanceKm,
  );
  assertNonNegative(
    `${line.name} factoryWasteTransportKgCO2ePerTkm`,
    line.factoryWasteTransportKgCO2ePerTkm,
  );
  assertNonNegative(
    `${line.name} factoryWasteTreatmentKgCO2ePerDeclaredUnit`,
    line.factoryWasteTreatmentKgCO2ePerDeclaredUnit,
  );
  assertNonNegative(
    `${line.name} siteWasteTransportDistanceKm`,
    line.siteWasteTransportDistanceKm,
  );
  assertNonNegative(
    `${line.name} siteWasteTransportKgCO2ePerTkm`,
    line.siteWasteTransportKgCO2ePerTkm,
  );
  assertNonNegative(
    `${line.name} siteWasteTreatmentKgCO2ePerDeclaredUnit`,
    line.siteWasteTreatmentKgCO2ePerDeclaredUnit,
  );

  if (line.siteWasteUpstreamKgCO2ePerDeclaredUnit !== undefined) {
    assertFiniteNumber(
      `${line.name} siteWasteUpstreamKgCO2ePerDeclaredUnit`,
      line.siteWasteUpstreamKgCO2ePerDeclaredUnit,
    );
  }

  if (line.c2KgCO2ePerKg != null) {
    assertNonNegative(`${line.name} c2KgCO2ePerKg`, line.c2KgCO2ePerKg);
  }

  if (line.c3c4KgCO2ePerKg != null) {
    assertNonNegative(`${line.name} c3c4KgCO2ePerKg`, line.c3c4KgCO2ePerKg);
  }
}

function calculateMaterialLine(line: MaterialLineInput): MaterialLineResult {
  validateMaterial(line);

  const conversionFactorToDeclaredUnit =
    deriveConversionFactorToDeclaredUnit(line);

  const massTonnesPerDeclaredUnit =
    deriveMassTonnesPerDeclaredUnit(line);

  const declaredInstalledQty =
    line.boqQty * conversionFactorToDeclaredUnit;

  const grossFactoryInputQty =
    declaredInstalledQty / (1 - line.factoryWasteRate);

  const factoryWasteQty =
    grossFactoryInputQty - declaredInstalledQty;

  const supplierA1A3NetKgCO2e =
    declaredInstalledQty * line.epdA1A3KgCO2ePerDeclaredUnit;

  const factoryWasteUpstreamKgCO2e =
    factoryWasteQty * line.epdA1A3KgCO2ePerDeclaredUnit;

  const supplierA1A3GrossKgCO2e =
    grossFactoryInputQty * line.epdA1A3KgCO2ePerDeclaredUnit;

  const grossInputMassTonnes =
    grossFactoryInputQty * massTonnesPerDeclaredUnit;

  const inboundTransportKgCO2e =
    grossInputMassTonnes *
    line.inboundDistanceKm *
    line.inboundTransportKgCO2ePerTkm;

  const factoryWasteMassTonnes =
    factoryWasteQty * massTonnesPerDeclaredUnit;

  const factoryWasteTransportKgCO2e =
    factoryWasteMassTonnes *
    line.factoryWasteTransportDistanceKm *
    line.factoryWasteTransportKgCO2ePerTkm;

  const factoryWasteTreatmentKgCO2e =
    factoryWasteQty * line.factoryWasteTreatmentKgCO2ePerDeclaredUnit;

  const siteInputQty =
    declaredInstalledQty / (1 - line.siteWasteRate);

  const siteWasteQty =
    siteInputQty - declaredInstalledQty;

  const siteWasteUpstreamFactor =
    line.siteWasteUpstreamKgCO2ePerDeclaredUnit ??
    line.epdA1A3KgCO2ePerDeclaredUnit;

  const siteWasteUpstreamKgCO2e =
    siteWasteQty * siteWasteUpstreamFactor;

  const siteWasteMassTonnes =
    siteWasteQty * massTonnesPerDeclaredUnit;

  const siteWasteTransportKgCO2e =
    siteWasteMassTonnes *
    line.siteWasteTransportDistanceKm *
    line.siteWasteTransportKgCO2ePerTkm;

  const siteWasteTreatmentKgCO2e =
    siteWasteQty * line.siteWasteTreatmentKgCO2ePerDeclaredUnit;

  const deliveredToSiteMassTonnes =
    siteInputQty * massTonnesPerDeclaredUnit;

  const installedMassKg = deriveInstalledMassKg(
    declaredInstalledQty,
    massTonnesPerDeclaredUnit,
  );

  const storedBiogenicCarbonKgCO2e = deriveStoredBiogenicCarbonKgCO2e(
    line,
    declaredInstalledQty,
    installedMassKg,
  );

  const a5BiogenicKgCO2e = deriveA5BiogenicKgCO2e(
    storedBiogenicCarbonKgCO2e,
    line.siteWasteRate,
  );

  const netStoredBiogenicCarbonKgCO2e =
    storedBiogenicCarbonKgCO2e + a5BiogenicKgCO2e;

  return {
    id: line.id,
    name: line.name,
    boqQty: line.boqQty,
    boqUnit: line.boqUnit,
    declaredInstalledQty,
    declaredUnit: line.declaredUnit,

    grossFactoryInputQty,
    factoryWasteQty,

    supplierA1A3NetKgCO2e,
    factoryWasteUpstreamKgCO2e,
    supplierA1A3GrossKgCO2e,

    grossInputMassTonnes,
    deliveredToSiteMassTonnes,
    inboundTransportKgCO2e,

    factoryWasteTransportKgCO2e,
    factoryWasteTreatmentKgCO2e,

    siteInputQty,
    siteWasteQty,
    siteWasteUpstreamKgCO2e,
    siteWasteTransportKgCO2e,
    siteWasteTreatmentKgCO2e,

    installedMassKg,

    storedBiogenicCarbonKgCO2e,
    a5BiogenicKgCO2e,
    netStoredBiogenicCarbonKgCO2e,
  };
}

export function calculateProject(input: ProjectInput): CalculationResult {
  const moduleDefaults = getModuleDefaults(input);

  assertNonNegative("reportingAreaM2", input.reportingAreaM2);
  assertNonNegative(
    "factory.allocatedManufacturingKgCO2e",
    input.factory.allocatedManufacturingKgCO2e,
  );
  assertNonNegative("giaDemolishedM2", input.giaDemolishedM2);
  assertNonNegative("factory.a4DistanceKm", input.factory.a4DistanceKm);

  assertNonNegative(
    "moduleDefaults.a4TransportFactorKgCO2ePerTkm",
    moduleDefaults.a4TransportFactorKgCO2ePerTkm,
  );
  assertNonNegative(
    "moduleDefaults.a5DemolitionKgCO2ePerM2",
    moduleDefaults.a5DemolitionKgCO2ePerM2,
  );
  assertNonNegative(
    "moduleDefaults.a5ConstructionConstantKgCO2e",
    moduleDefaults.a5ConstructionConstantKgCO2e,
  );
  assertRate(
    "moduleDefaults.a5PercentOfA1A4",
    moduleDefaults.a5PercentOfA1A4,
  );
  assertRate(
    "moduleDefaults.b2FractionOfA1A5",
    moduleDefaults.b2FractionOfA1A5,
  );
  assertRate(
    "moduleDefaults.b3FractionOfB2",
    moduleDefaults.b3FractionOfB2,
  );
  assertNonNegative(
    "moduleDefaults.c1KgCO2ePerM2",
    moduleDefaults.c1KgCO2ePerM2,
  );
  assertNonNegative(
    "moduleDefaults.c2KgCO2ePerKg",
    moduleDefaults.c2KgCO2ePerKg,
  );

  const materials = input.materials.map(calculateMaterialLine);
  const materialInputById = new Map(input.materials.map((m) => [m.id, m]));

  const purchasedProductsA1A3KgCO2e = sum(
    materials.map((m) => m.supplierA1A3GrossKgCO2e),
  );

  const inboundTransportKgCO2e = sum(
    materials.map((m) => m.inboundTransportKgCO2e),
  );

  const factoryWasteEndProcessingKgCO2e = sum(
    materials.map(
      (m) => m.factoryWasteTransportKgCO2e + m.factoryWasteTreatmentKgCO2e,
    ),
  );

  const finishedProductA1A3KgCO2e =
    purchasedProductsA1A3KgCO2e +
    inboundTransportKgCO2e +
    input.factory.allocatedManufacturingKgCO2e +
    factoryWasteEndProcessingKgCO2e;

  const A4DeliveredMassTonnes = sum(
    materials.map((m) => m.deliveredToSiteMassTonnes),
  );

  const A4KgCO2e =
    A4DeliveredMassTonnes *
    input.factory.a4DistanceKm *
    moduleDefaults.a4TransportFactorKgCO2ePerTkm;

  const totalA1ToA4KgCO2e =
    finishedProductA1A3KgCO2e + A4KgCO2e;

  const A5DemolitionKgCO2e =
    moduleDefaults.a5DemolitionKgCO2ePerM2 * input.giaDemolishedM2;

  const A5ConstructionKgCO2e =
    moduleDefaults.a5ConstructionConstantKgCO2e;

  const A5PercentOfA1A4KgCO2e =
    totalA1ToA4KgCO2e * moduleDefaults.a5PercentOfA1A4;

  const A5FossilKgCO2e =
    A5DemolitionKgCO2e +
    A5ConstructionKgCO2e +
    A5PercentOfA1A4KgCO2e;

  const storedBiogenicCarbonKgCO2e = sum(
    materials.map((m) => m.storedBiogenicCarbonKgCO2e),
  );

  const A5BiogenicKgCO2e = sum(
    materials.map((m) => m.a5BiogenicKgCO2e),
  );

  const netStoredBiogenicCarbonKgCO2e = sum(
    materials.map((m) => m.netStoredBiogenicCarbonKgCO2e),
  );

  const A5KgCO2e = A5FossilKgCO2e + A5BiogenicKgCO2e;

  const upfrontCarbonKgCO2e =
    finishedProductA1A3KgCO2e + A4KgCO2e + A5KgCO2e;

  const B2KgCO2e =
    upfrontCarbonKgCO2e * moduleDefaults.b2FractionOfA1A5;

  const B3KgCO2e =
    B2KgCO2e * moduleDefaults.b3FractionOfB2;

  const C1KgCO2e =
    input.reportingAreaM2 * moduleDefaults.c1KgCO2ePerM2;

  const C2KgCO2e = sum(
    materials.map((material) => {
      const line = materialInputById.get(material.id);
      const factor =
        line?.c2KgCO2ePerKg ?? moduleDefaults.c2KgCO2ePerKg;

      return material.installedMassKg * factor;
    }),
  );

  const C3C4KgCO2e = sum(
    materials.map((material) => {
      const line = materialInputById.get(material.id);
      const factor = line?.c3c4KgCO2ePerKg ?? 0;

      return material.installedMassKg * factor;
    }),
  );

  // keep legacy module fields alive for the current UI.
  // for now, combined C3-C4 is reported through C3 and C4 is set to zero.
  const C3KgCO2e = C3C4KgCO2e;
  const C4KgCO2e = 0;

  const embodiedCarbonTotalKgCO2e =
    upfrontCarbonKgCO2e +
    B2KgCO2e +
    B3KgCO2e +
    C1KgCO2e +
    C2KgCO2e +
    C3C4KgCO2e;

  const checks: CalculationCheck[] = [
    ...materials.map((m) =>
      check(
        `${m.name}: supplier gross = net + factory waste upstream`,
        m.supplierA1A3NetKgCO2e + m.factoryWasteUpstreamKgCO2e,
        m.supplierA1A3GrossKgCO2e,
      ),
    ),
    check(
      "Finished product A1-A3 stack",
      purchasedProductsA1A3KgCO2e +
        inboundTransportKgCO2e +
        input.factory.allocatedManufacturingKgCO2e +
        factoryWasteEndProcessingKgCO2e,
      finishedProductA1A3KgCO2e,
    ),
    check(
      "A5 stack",
      A5FossilKgCO2e + A5BiogenicKgCO2e,
      A5KgCO2e,
    ),
    check(
      "Embodied carbon total stack",
      upfrontCarbonKgCO2e +
        B2KgCO2e +
        B3KgCO2e +
        C1KgCO2e +
        C2KgCO2e +
        C3C4KgCO2e,
      embodiedCarbonTotalKgCO2e,
    ),
  ];

  return {
    materials,
    checks,
    modules: {
      purchasedProductsA1A3KgCO2e,
      inboundTransportKgCO2e,
      factoryManufacturingKgCO2e: input.factory.allocatedManufacturingKgCO2e,
      factoryWasteEndProcessingKgCO2e,
      finishedProductA1A3KgCO2e,

      A4DeliveredMassTonnes,
      A4KgCO2e,

      A5DemolitionKgCO2e,
      A5ConstructionKgCO2e,
      A5PercentOfA1A4KgCO2e,
      A5FossilKgCO2e,

      storedBiogenicCarbonKgCO2e,
      A5BiogenicKgCO2e,
      netStoredBiogenicCarbonKgCO2e,

      A5KgCO2e,
      upfrontCarbonKgCO2e,

      B2KgCO2e,
      B3KgCO2e,

      C1KgCO2e,
      C2KgCO2e,
      C3KgCO2e,
      C4KgCO2e,
      C3C4KgCO2e,

      embodiedCarbonTotalKgCO2e,

      upfrontCarbonPerM2KgCO2e:
        input.reportingAreaM2 > 0
          ? upfrontCarbonKgCO2e / input.reportingAreaM2
          : null,
      embodiedCarbonPerM2KgCO2e:
        input.reportingAreaM2 > 0
          ? embodiedCarbonTotalKgCO2e / input.reportingAreaM2
          : null,
    },
  };
}