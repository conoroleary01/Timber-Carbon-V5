import type { MaterialLineInput } from "@/lib/types";

export type CanonicalUnit = "kg" | "t" | "m2" | "m3" | "item" | "unknown";

function isPositiveNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && value > 0;
}

export function normalizeUnit(value: string): CanonicalUnit {
  const normalized = value.trim().toLowerCase();

  if (["kg", "kilogram", "kilograms"].includes(normalized)) return "kg";
  if (["t", "tonne", "tonnes"].includes(normalized)) return "t";

  if (
    ["m2", "m²", "sqm", "sq m", "square metre", "square meter", "m^2"].includes(
      normalized,
    )
  ) {
    return "m2";
  }

  if (
    ["m3", "m³", "cbm", "cubic metre", "cubic meter", "m^3"].includes(
      normalized,
    )
  ) {
    return "m3";
  }

  if (
    [
      "nr",
      "no",
      "pcs",
      "pc",
      "piece",
      "pieces",
      "item",
      "items",
      "ea",
      "each",
      "unit",
      "units",
    ].includes(normalized)
  ) {
    return "item";
  }

  return "unknown";
}

function convertKgToDeclaredUnit(kg: number, declaredUnit: CanonicalUnit): number {
  if (declaredUnit === "kg") return kg;
  if (declaredUnit === "t") return kg / 1000;

  throw new Error(
    `Cannot convert kg into declared unit "${declaredUnit}". Use manual mode or align declared unit.`,
  );
}

export function deriveSurfaceMassKgPerM2(
  line: Pick<MaterialLineInput, "surfaceMassKgPerM2" | "thicknessM" | "densityKgPerM3">,
): number | null {
  if (line.surfaceMassKgPerM2 != null) {
    return line.surfaceMassKgPerM2;
  }

  if (line.thicknessM != null && line.densityKgPerM3 != null) {
    return line.thicknessM * line.densityKgPerM3;
  }

  return null;
}

export function tryGetAutoConversionFactorToDeclaredUnit(
  line: MaterialLineInput,
): number | null {
  const boqUnit = normalizeUnit(line.boqUnit);
  const declaredUnit = normalizeUnit(line.declaredUnit);

  if (boqUnit === declaredUnit && boqUnit !== "unknown") {
    return 1;
  }

  if ((boqUnit === "kg" || boqUnit === "t") && (declaredUnit === "kg" || declaredUnit === "t")) {
    const kgPerBoqUnit = boqUnit === "kg" ? 1 : 1000;
    return convertKgToDeclaredUnit(kgPerBoqUnit, declaredUnit);
  }

  if (boqUnit === "m2" && declaredUnit === "m3") {
    if (line.thicknessM == null) {
      throw new Error(`${line.name}: thicknessM is required for m2 to m3 conversion`);
    }

    return line.thicknessM;
  }

  if (boqUnit === "m3" && (declaredUnit === "kg" || declaredUnit === "t")) {
    if (line.densityKgPerM3 == null) {
      throw new Error(`${line.name}: densityKgPerM3 is required for m3 to mass conversion`);
    }

    return convertKgToDeclaredUnit(line.densityKgPerM3, declaredUnit);
  }

  if (boqUnit === "m2" && (declaredUnit === "kg" || declaredUnit === "t")) {
    const surfaceMassKgPerM2 = deriveSurfaceMassKgPerM2(line);

    if (surfaceMassKgPerM2 == null) {
      throw new Error(
        `${line.name}: surfaceMassKgPerM2 or thicknessM + densityKgPerM3 is required for m2 to mass conversion`,
      );
    }

    return convertKgToDeclaredUnit(surfaceMassKgPerM2, declaredUnit);
  }

  if (boqUnit === "item" && (declaredUnit === "kg" || declaredUnit === "t")) {
    if (line.massKgPerItem == null) {
      throw new Error(`${line.name}: massKgPerItem is required for item to mass conversion`);
    }

    const itemsPerBoqUnit = line.itemsPerBoqUnit ?? 1;

    return convertKgToDeclaredUnit(
      line.massKgPerItem * itemsPerBoqUnit,
      declaredUnit,
    );
  }

  return null;
}

export function deriveConversionFactorToDeclaredUnit(line: MaterialLineInput): number {
  if (isPositiveNumber(line.conversionFactorToDeclaredUnit)) {
    return line.conversionFactorToDeclaredUnit;
  }

  const autoDerived = tryGetAutoConversionFactorToDeclaredUnit(line);

  if (autoDerived != null) {
    return autoDerived;
  }

  throw new Error(
    `${line.name}: cannot derive conversionFactorToDeclaredUnit automatically from boqUnit "${line.boqUnit}" to declaredUnit "${line.declaredUnit}"`,
  );
}

export function getAutoMassTonnesPerDeclaredUnit(line: MaterialLineInput): number | null {
  const declaredUnit = normalizeUnit(line.declaredUnit);

  if (declaredUnit === "kg") return 0.001;
  if (declaredUnit === "t") return 1;

  if (declaredUnit === "m3") {
    if (line.densityKgPerM3 != null) {
      return line.densityKgPerM3 / 1000;
    }

    return null;
  }

  if (declaredUnit === "m2") {
    const surfaceMassKgPerM2 = deriveSurfaceMassKgPerM2(line);

    if (surfaceMassKgPerM2 != null) {
      return surfaceMassKgPerM2 / 1000;
    }

    return null;
  }

  if (declaredUnit === "item") {
    if (line.massKgPerItem != null) {
      return line.massKgPerItem / 1000;
    }

    return null;
  }

  return null;
}

export function deriveMassTonnesPerDeclaredUnit(line: MaterialLineInput): number {
  const autoDerived = getAutoMassTonnesPerDeclaredUnit(line);

  if (autoDerived != null) {
    return autoDerived;
  }

  if (isPositiveNumber(line.massTonnesPerDeclaredUnit)) {
    return line.massTonnesPerDeclaredUnit;
  }

  throw new Error(
    `${line.name}: cannot derive massTonnesPerDeclaredUnit automatically for declared unit "${line.declaredUnit}"`,
  );
}