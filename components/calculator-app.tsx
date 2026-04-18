"use client";

import { useMemo, useState, useTransition } from "react";
import type { CalculationResult, ProjectInput } from "@/lib/types";
import {
  deriveConversionFactorToDeclaredUnit,
  deriveMassTonnesPerDeclaredUnit,
  deriveSurfaceMassKgPerM2,
  getAutoMassTonnesPerDeclaredUnit,
  normalizeUnit,
} from "@/lib/conversion";
import SummaryCards from "@/components/summary-cards";
import ProjectControls from "@/components/project-controls";
import A5Trace from "@/components/a5-trace";
import AssumptionsScope from "@/components/assumptions-scope";

import EditableMaterialLines from "@/components/editable-material-lines";
import MaterialTraceSection from "@/components/material-trace-section";

type Props = {
  initialInput: ProjectInput;
  initialResult: CalculationResult;
};

function formatNumber(value: number | null, digits = 2) {
  if (value === null) return "—";

  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

async function postCalculation(payload: ProjectInput): Promise<CalculationResult> {
  const response = await fetch("/api/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Calculation failed");
  }

  return data as CalculationResult;
}



export default function CalculatorApp({
  initialInput,
  initialResult,
}: Props) {
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(initialInput, null, 2),
  );
  const [result, setResult] = useState<CalculationResult>(initialResult);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const projectName = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonInput) as ProjectInput;
      return parsed.projectName || "Untitled project";
    } catch {
      return "Invalid JSON";
    }
  }, [jsonInput]);

  const currentInput = useMemo(() => {
  try {
    return JSON.parse(jsonInput) as ProjectInput;
  } catch {
    return initialInput;
  }
}, [jsonInput, initialInput]);

  const handleCalculate = () => {
    setError(null);

    startTransition(async () => {
      try {
        const parsed = JSON.parse(jsonInput) as ProjectInput;
        const nextResult = await postCalculation(parsed);
        setResult(nextResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid input");
      }
    });
  };

const updateMaterialField = (
  materialId: string,
  field: string,
  value: string | number,
) => {
  setError(null);

  try {
    const parsed = JSON.parse(jsonInput) as ProjectInput;

    const next: ProjectInput = {
      ...parsed,
      materials: parsed.materials.map((material) => {
        if (material.id !== materialId) return material;

        const nextValue = value === "" ? undefined : value;

        // if the user changes either unit, clear old conversion assumptions
        if (field === "boqUnit" || field === "declaredUnit") {
          return {
            ...material,
            [field]: nextValue,
            conversionFactorToDeclaredUnit: 0,
            massTonnesPerDeclaredUnit: 0,
            thicknessM: undefined,
            densityKgPerM3: undefined,
            surfaceMassKgPerM2: undefined,
            massKgPerItem: undefined,
            itemsPerBoqUnit: undefined,
          };
        }

        return {
          ...material,
          [field]: nextValue,
        };
      }),
    };

    setJsonInput(JSON.stringify(next, null, 2));
  } catch {
    setError("Cannot update form because the JSON is currently invalid.");
  }
};

const getDerivedConversionPreview = (material: ProjectInput["materials"][number]) => {
  try {
    return deriveConversionFactorToDeclaredUnit(material);
  } catch {
    return null;
  }
};

const getAutoDerivedMassFactorPreview = (
  material: ProjectInput["materials"][number],
) => {
  return getAutoMassTonnesPerDeclaredUnit(material);
};

const getActiveMassFactorPreview = (
  material: ProjectInput["materials"][number],
) => {
  try {
    return deriveMassTonnesPerDeclaredUnit(material);
  } catch {
    return null;
  }
};

const getConversionTrace = (material: ProjectInput["materials"][number]) => {
  const preview = getDerivedConversionPreview(material);
  const boqUnit = normalizeUnit(material.boqUnit);
  const declaredUnit = normalizeUnit(material.declaredUnit);
  const surfaceMassKgPerM2 = deriveSurfaceMassKgPerM2(material);

  if (typeof material.conversionFactorToDeclaredUnit === "number" && material.conversionFactorToDeclaredUnit > 0) {
    return {
      mode: "manual",
      basis: "Manual conversion factor entered by user",
      equation: `${formatNumber(material.conversionFactorToDeclaredUnit, 6)} ${material.declaredUnit} per ${material.boqUnit}`,
      preview,
    };
  }

  if (boqUnit === declaredUnit && boqUnit !== "unknown") {
    return {
      mode: "identity",
      basis: "BoQ unit and declared unit are the same",
      equation: `1 ${material.declaredUnit} per ${material.boqUnit}`,
      preview,
    };
  }

  if (boqUnit === "m2" && declaredUnit === "m3") {
    return {
      mode: "area_to_volume_thickness",
      basis: "Area to volume using thickness",
      equation:
        material.thicknessM == null
          ? "Thickness missing"
          : `${formatNumber(material.thicknessM, 6)} m × 1 m² = ${formatNumber(material.thicknessM, 6)} m³ per m²`,
      preview,
    };
  }

  if (boqUnit === "m3" && (declaredUnit === "kg" || declaredUnit === "t")) {
    return {
      mode: "volume_to_mass_density",
      basis: "Volume to mass using density",
      equation:
        material.densityKgPerM3 == null
          ? "Density missing"
          : `${formatNumber(material.densityKgPerM3, 2)} kg/m³ = ${formatNumber(preview, 6)} ${material.declaredUnit} per ${material.boqUnit}`,
      preview,
    };
  }

  if (boqUnit === "m2" && (declaredUnit === "kg" || declaredUnit === "t")) {
    return {
      mode: "area_to_mass",
      basis:
        material.surfaceMassKgPerM2 != null
          ? "Area to mass using surface mass"
          : "Area to mass using thickness × density",
      equation:
        surfaceMassKgPerM2 == null
          ? "Surface mass or thickness + density missing"
          : material.surfaceMassKgPerM2 != null
            ? `${formatNumber(material.surfaceMassKgPerM2, 6)} kg/m² = ${formatNumber(preview, 6)} ${material.declaredUnit} per ${material.boqUnit}`
            : `${formatNumber(material.thicknessM ?? 0, 6)} m × ${formatNumber(material.densityKgPerM3 ?? 0, 2)} kg/m³ = ${formatNumber(preview, 6)} ${material.declaredUnit} per ${material.boqUnit}`,
      preview,
    };
  }

  if (boqUnit === "item" && (declaredUnit === "kg" || declaredUnit === "t")) {
    return {
      mode: "count_to_mass",
      basis: "Count to mass using mass per item × items per BoQ unit",
      equation:
        material.massKgPerItem == null
          ? "Mass per item missing"
          : `${formatNumber(material.massKgPerItem, 6)} kg/item × ${formatNumber(material.itemsPerBoqUnit ?? 1, 6)} = ${formatNumber(preview, 6)} ${material.declaredUnit} per ${material.boqUnit}`,
      preview,
    };
  }

  return {
    mode: "unknown",
    basis: "No automatic conversion rule available for this unit pair",
    equation: "Enter a manual conversion factor for this combination",
    preview: null,
  };
};

const getConversionPathLabel = (
  sourceLine: ProjectInput["materials"][number] | undefined,
  conversionTrace: ReturnType<typeof getConversionTrace> | null,
) => {
  if (!sourceLine) {
    return "—";
  }

  if (
    typeof sourceLine.conversionFactorToDeclaredUnit === "number" &&
    sourceLine.conversionFactorToDeclaredUnit > 0
  ) {
    return "Manual fallback";
  }

  switch (conversionTrace?.mode) {
    case "identity":
      return "Same unit";
    case "area_to_volume_thickness":
      return "Area to volume";
    case "volume_to_mass_density":
      return "Volume to mass";
    case "area_to_mass":
      return "Area to mass";
    case "count_to_mass":
      return "Count to mass";
    case "manual":
      return "Manual fallback";
    default:
      return "Not resolved";
  }
};

const updateProjectField = (
  section: "root" | "factory",
  field: string,
  value: string | number,
) => {
  setError(null);

  try {
    const parsed = JSON.parse(jsonInput) as ProjectInput;

    const next: ProjectInput =
      section === "root"
        ? {
            ...parsed,
            [field]: value,
          }
        : {
            ...parsed,
            factory: {
              ...parsed.factory,
              [field]: value,
            },
          };

    setJsonInput(JSON.stringify(next, null, 2));
  } catch {
    setError("Cannot update form because the JSON is currently invalid.");
  }
};

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-cygnum-border bg-[#f2f2f2] p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-cygnum-charcoal">
          Cygnum Embodied Carbon Calculator V1
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-cygnum-charcoal-2">
          By Conor O'Leary
        </p>
        <p className="mt-2 text-sm text-cygnum-charcoal-2">
          Current dataset: <span className="font-medium">{projectName}</span>
        </p>
      </section>

     <EditableMaterialLines
  currentInput={currentInput}
  updateMaterialField={updateMaterialField}
  getDerivedConversionPreview={getDerivedConversionPreview}
  getAutoDerivedMassFactorPreview={getAutoDerivedMassFactorPreview}
/>

<ProjectControls
  currentInput={currentInput}
  updateProjectField={updateProjectField}
/>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-cygnum-border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-cygnum-charcoal">Input JSON</h2>
            <button
              onClick={handleCalculate}
              disabled={isPending}
             className="rounded-lg bg-cygnum-green px-4 py-2 text-sm font-medium text-white transition hover:bg-cygnum-green-dark disabled:opacity-50"
            >
              {isPending ? "Calculating..." : "Recalculate"}
            </button>
          </div>

          <p className="mt-2 text-sm text-cygnum-charcoal-2">
            In production, this will become structured forms and imported data.
            For v1, JSON is useful because it keeps every assumption visible.
          </p>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
           className="mt-4 min-h-[640px] w-full rounded-xl border border-cygnum-border bg-white p-4 font-mono text-xs leading-5 text-cygnum-charcoal outline-none ring-0"
            spellCheck={false}
          />

          {error ? (
           <div className="mt-4 rounded-lg border border-cygnum-red bg-red-50 p-3 text-sm text-cygnum-red">
              {error}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
  <SummaryCards result={result} />
  <A5Trace currentInput={currentInput} result={result} />
</div>

<MaterialTraceSection
  currentInput={currentInput}
  result={result}
  getConversionTrace={getConversionTrace}
  getConversionPathLabel={getConversionPathLabel}
  getActiveMassFactorPreview={getActiveMassFactorPreview}
/>

<AssumptionsScope currentInput={currentInput} />
      </section>
    </div>
  );
}