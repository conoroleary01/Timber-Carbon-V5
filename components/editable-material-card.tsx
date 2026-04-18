import type { ProjectInput } from "@/lib/types";
import { normalizeUnit } from "@/lib/conversion";

type Props = {
  material: ProjectInput["materials"][number];
  updateMaterialField: (
    materialId: string,
    field: string,
    value: string | number,
  ) => void;
  getDerivedConversionPreview: (
    material: ProjectInput["materials"][number],
  ) => number | null;
  getAutoDerivedMassFactorPreview: (
    material: ProjectInput["materials"][number],
  ) => number | null;
};

function formatNumber(value: number | null, digits = 2) {
  if (value === null) return "—";

  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export default function EditableMaterialCard({
  material,
  updateMaterialField,
  getDerivedConversionPreview,
  getAutoDerivedMassFactorPreview,
}: Props) {
  const boqUnit = normalizeUnit(material.boqUnit);
  const declaredUnit = normalizeUnit(material.declaredUnit);

  const showThicknessForAreaToVolume =
    boqUnit === "m2" && declaredUnit === "m3";

  const showDensityForDeclaredM3Mass =
    declaredUnit === "m3";

  const showAreaToMassInputs =
    boqUnit === "m2" && (declaredUnit === "kg" || declaredUnit === "t");

  const showCountToMassInputs =
    boqUnit === "item" && (declaredUnit === "kg" || declaredUnit === "t");

  const autoDerivedMassFactor = getAutoDerivedMassFactorPreview(material);
  const manualMassFactorTyped =
    typeof material.massTonnesPerDeclaredUnit === "number" &&
    material.massTonnesPerDeclaredUnit > 0;

  const showManualMassFallback =
    autoDerivedMassFactor == null || manualMassFactorTyped;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          {material.name}
        </h3>
        <p className="text-sm text-slate-500">ID: {material.id}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
            Name
          </span>
          <input
            type="text"
            value={material.name}
            onChange={(e) =>
              updateMaterialField(material.id, "name", e.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
            BoQ quantity
          </span>
          <input
            type="number"
            step="any"
            value={material.boqQty}
            onChange={(e) =>
              updateMaterialField(
                material.id,
                "boqQty",
                Number(e.target.value),
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
            BoQ unit
          </span>
          <input
            type="text"
            value={material.boqUnit}
            onChange={(e) =>
              updateMaterialField(material.id, "boqUnit", e.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
            Declared unit
          </span>
          <input
            type="text"
            value={material.declaredUnit}
            onChange={(e) =>
              updateMaterialField(material.id, "declaredUnit", e.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
            Manual conversion factor fallback
          </span>
          <input
            type="number"
            step="any"
            value={material.conversionFactorToDeclaredUnit}
            onChange={(e) =>
              updateMaterialField(
                material.id,
                "conversionFactorToDeclaredUnit",
                Number(e.target.value),
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>

        {showThicknessForAreaToVolume ? (
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
              Thickness m
            </span>
            <input
              type="number"
              step="any"
              value={material.thicknessM ?? ""}
              onChange={(e) =>
                updateMaterialField(
                  material.id,
                  "thicknessM",
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>
        ) : null}

        {showDensityForDeclaredM3Mass ? (
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
              Density kg/m³ (required for auto-derived transport mass)
            </span>
            <input
              type="number"
              step="any"
              value={material.densityKgPerM3 ?? ""}
              onChange={(e) =>
                updateMaterialField(
                  material.id,
                  "densityKgPerM3",
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>
        ) : null}

        {showAreaToMassInputs ? (
          <>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
                Surface mass kg/m²
              </span>
              <input
                type="number"
                step="any"
                value={material.surfaceMassKgPerM2 ?? ""}
                onChange={(e) =>
                  updateMaterialField(
                    material.id,
                    "surfaceMassKgPerM2",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
                Thickness m (optional alternative)
              </span>
              <input
                type="number"
                step="any"
                value={material.thicknessM ?? ""}
                onChange={(e) =>
                  updateMaterialField(
                    material.id,
                    "thicknessM",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
                Density kg/m³ (optional alternative)
              </span>
              <input
                type="number"
                step="any"
                value={material.densityKgPerM3 ?? ""}
                onChange={(e) =>
                  updateMaterialField(
                    material.id,
                    "densityKgPerM3",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>
          </>
        ) : null}

        {showCountToMassInputs ? (
          <>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
                Mass kg per item
              </span>
              <input
                type="number"
                step="any"
                value={material.massKgPerItem ?? ""}
                onChange={(e) =>
                  updateMaterialField(
                    material.id,
                    "massKgPerItem",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
                Items per BoQ unit
              </span>
              <input
                type="number"
                step="any"
                value={material.itemsPerBoqUnit ?? ""}
                onChange={(e) =>
                  updateMaterialField(
                    material.id,
                    "itemsPerBoqUnit",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              />
            </label>
          </>
        ) : null}

        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
          <div className="font-medium text-slate-900">Derived conversion preview</div>
          <div className="mt-1">
            {getDerivedConversionPreview(material) == null
              ? "Not available for the current unit / conversion combination"
              : `${formatNumber(getDerivedConversionPreview(material), 6)} ${material.declaredUnit} per ${material.boqUnit}`}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
            Factory waste rate
          </span>
          <input
            type="number"
            step="0.001"
            value={material.factoryWasteRate}
            onChange={(e) =>
              updateMaterialField(
                material.id,
                "factoryWasteRate",
                Number(e.target.value),
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
            EPD A1-A3 factor (kgCO2e per {material.declaredUnit || "declared unit"})
          </span>
          <input
            type="number"
            step="any"
            value={material.epdA1A3KgCO2ePerDeclaredUnit}
            onChange={(e) =>
              updateMaterialField(
                material.id,
                "epdA1A3KgCO2ePerDeclaredUnit",
                Number(e.target.value),
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
            Biogenic method
          </span>
          <select
            value={material.biogenicMethod ?? "none"}
            onChange={(e) =>
              updateMaterialField(material.id, "biogenicMethod", e.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="none">None</option>
            <option value="fallback_1_64">Fallback -1.64 kgCO2e/kg timber</option>
            <option value="epd">EPD stored biogenic value</option>
          </select>
        </label>

        {(material.biogenicMethod ?? "none") === "fallback_1_64" ? (
          <>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
                Wood mass fraction
              </span>
              <input
                type="number"
                step="any"
                min="0"
                max="1"
                value={material.woodMassFraction ?? ""}
                onChange={(e) =>
                  updateMaterialField(
                    material.id,
                    "woodMassFraction",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                placeholder="Defaults to 1.0"
              />
            </label>

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
              Stored biogenic carbon will be auto-derived as:
              <div className="mt-1 font-mono text-xs">
                installed mass × wood mass fraction × (-1.64)
              </div>
            </div>
          </>
        ) : null}

        {(material.biogenicMethod ?? "none") === "epd" ? (
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
              EPD stored biogenic carbon (kgCO2e per {material.declaredUnit || "declared unit"})
            </span>
            <input
              type="number"
              step="any"
              value={material.epdStoredBiogenicCarbonKgCO2ePerDeclaredUnit ?? ""}
              onChange={(e) =>
                updateMaterialField(
                  material.id,
                  "epdStoredBiogenicCarbonKgCO2ePerDeclaredUnit",
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>
        ) : null}

        {showManualMassFallback ? (
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
              Manual mass factor fallback (t per declared unit)
            </span>
            <input
              type="number"
              step="any"
              value={material.massTonnesPerDeclaredUnit || ""}
              onChange={(e) =>
                updateMaterialField(
                  material.id,
                  "massTonnesPerDeclaredUnit",
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>
        ) : null}

        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
          <div className="font-medium text-slate-900">Auto-derived mass factor</div>
          <div className="mt-1">
            {getAutoDerivedMassFactorPreview(material) == null
              ? "Not available for the current declared unit / input combination"
              : `${formatNumber(getAutoDerivedMassFactorPreview(material), 6)} t per ${material.declaredUnit}`}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
            Inbound distance km
          </span>
          <input
            type="number"
            step="any"
            value={material.inboundDistanceKm}
            onChange={(e) =>
              updateMaterialField(
                material.id,
                "inboundDistanceKm",
                Number(e.target.value),
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-600">
            Inbound transport factor
          </span>
          <input
            type="number"
            step="any"
            value={material.inboundTransportKgCO2ePerTkm}
            onChange={(e) =>
              updateMaterialField(
                material.id,
                "inboundTransportKgCO2ePerTkm",
                Number(e.target.value),
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          />
        </label>
      </div>
    </div>
  );
}