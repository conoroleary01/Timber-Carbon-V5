import type { MaterialLineResult, ProjectInput } from "@/lib/types";

type ConversionTrace = {
  mode: string;
  basis: string;
  equation: string;
  preview: number | null;
};

type Props = {
  material: MaterialLineResult;
  sourceLine: ProjectInput["materials"][number] | undefined;
  conversionTrace: ConversionTrace | null;
  conversionPathLabel: string;
  massFactorPreview: number | null;
  a4DistanceKm: number;
};

function formatNumber(value: number | null, digits = 2) {
  if (value === null) return "—";

  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export default function MaterialTraceCard({
  material,
  sourceLine,
  conversionTrace,
  conversionPathLabel,
  massFactorPreview,
  a4DistanceKm,
}: Props) {
  const a4DistanceAdjustedKm = a4DistanceKm * 1.43;
  const materialA4KgCO2e =
    material.deliveredToSiteMassTonnes * a4DistanceAdjustedKm * 0.1211;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {material.name}
          </h3>
          <p className="text-sm text-slate-500">Line ID: {material.id}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Inputs
            </h4>
            <div className="mt-2 space-y-2 text-sm text-slate-800">
              <div className="flex justify-between">
                <span>BoQ quantity</span>
                <span>
                  {formatNumber(sourceLine?.boqQty ?? material.boqQty, 4)}{" "}
                  {sourceLine?.boqUnit ?? material.boqUnit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Active conversion factor to declared unit</span>
                <span>
                  {conversionTrace?.preview == null
                    ? "—"
                    : `${formatNumber(conversionTrace.preview, 6)} ${material.declaredUnit}/${material.boqUnit}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Resolved conversion path</span>
                <span>{conversionPathLabel}</span>
              </div>
              <div className="flex justify-between">
                <span>Declared unit</span>
                <span>{material.declaredUnit}</span>
              </div>
              <div className="flex justify-between">
                <span>Factory waste rate</span>
                <span>
                  {formatNumber((sourceLine?.factoryWasteRate ?? 0) * 100, 2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>EPD A1-A3 factor</span>
                <span>
                  {formatNumber(
                    sourceLine?.epdA1A3KgCO2ePerDeclaredUnit ?? 0,
                    4,
                  )}{" "}
                  kgCO2e/{material.declaredUnit}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Biogenic method</span>
                <span>{sourceLine?.biogenicMethod ?? "none"}</span>
              </div>
              <div className="flex justify-between">
                <span>Wood mass fraction</span>
                <span>
                  {sourceLine?.biogenicMethod === "fallback_1_64"
                    ? formatNumber(sourceLine?.woodMassFraction ?? 1, 4)
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>EPD stored biogenic factor</span>
                <span>
                  {sourceLine?.biogenicMethod === "epd"
                    ? `${formatNumber(
                        sourceLine?.epdStoredBiogenicCarbonKgCO2ePerDeclaredUnit ?? 0,
                        4,
                      )} kgCO2e/${material.declaredUnit}`
                    : "—"}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Active mass factor</span>
                <span>
                  {massFactorPreview == null
                    ? "—"
                    : `${formatNumber(massFactorPreview, 6)} t/${material.declaredUnit}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Inbound distance</span>
                <span>{formatNumber(sourceLine?.inboundDistanceKm ?? 0, 2)} km</span>
              </div>
              <div className="flex justify-between">
                <span>Inbound transport factor</span>
                <span>
                  {formatNumber(
                    sourceLine?.inboundTransportKgCO2ePerTkm ?? 0,
                    4,
                  )}{" "}
                  kgCO2e/tkm
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Quantity flow
            </h4>
            <div className="mt-2 space-y-2 text-sm text-slate-800">
              <div className="flex justify-between">
                <span>Declared installed quantity</span>
                <span>
                  {formatNumber(material.declaredInstalledQty, 4)}{" "}
                  {material.declaredUnit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Gross factory input quantity</span>
                <span>
                  {formatNumber(material.grossFactoryInputQty, 4)}{" "}
                  {material.declaredUnit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Factory waste quantity</span>
                <span>
                  {formatNumber(material.factoryWasteQty, 4)}{" "}
                  {material.declaredUnit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Site input quantity</span>
                <span>
                  {formatNumber(material.siteInputQty, 4)} {material.declaredUnit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Gross input mass</span>
                <span>{formatNumber(material.grossInputMassTonnes, 6)} t</span>
              </div>
              <div className="flex justify-between">
                <span>Installed mass</span>
                <span>{formatNumber(material.installedMassKg, 4)} kg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Carbon results
            </h4>
            <div className="mt-2 space-y-2 text-sm text-slate-800">
              <div className="flex justify-between">
                <span>Supplier A1-A3 net</span>
                <span>{formatNumber(material.supplierA1A3NetKgCO2e)}</span>
              </div>
              <div className="flex justify-between">
                <span>Factory waste upstream</span>
                <span>{formatNumber(material.factoryWasteUpstreamKgCO2e)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Supplier A1-A3 gross</span>
                <span>{formatNumber(material.supplierA1A3GrossKgCO2e)}</span>
              </div>
              <div className="flex justify-between">
                <span>Inbound transport</span>
                <span>{formatNumber(material.inboundTransportKgCO2e)}</span>
              </div>
              <div className="flex justify-between">
                <span>A4 delivered mass</span>
                <span>{formatNumber(material.deliveredToSiteMassTonnes, 6)} t</span>
              </div>
              <div className="flex justify-between">
                <span>A4 carbon</span>
                <span>{formatNumber(materialA4KgCO2e)}</span>
              </div>
              <div className="flex justify-between">
                <span>Factory waste transport</span>
                <span>{formatNumber(material.factoryWasteTransportKgCO2e)}</span>
              </div>
              <div className="flex justify-between">
                <span>Factory waste treatment</span>
                <span>{formatNumber(material.factoryWasteTreatmentKgCO2e)}</span>
              </div>
              <div className="flex justify-between">
                <span>Stored biogenic carbon</span>
                <span>{formatNumber(material.storedBiogenicCarbonKgCO2e)}</span>
              </div>
              <div className="flex justify-between">
                <span>A5 biogenic release</span>
                <span>{formatNumber(material.a5BiogenicKgCO2e)}</span>
              </div>
              <div className="flex justify-between">
                <span>Net stored biogenic after A5</span>
                <span>{formatNumber(material.netStoredBiogenicCarbonKgCO2e)}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
              Conversion trace
            </h4>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <div className="flex justify-between">
                <span className="font-medium text-slate-900">Resolved conversion path</span>
                <span>{conversionPathLabel}</span>
              </div>

              <div className="mt-3">
                <p className="font-medium text-slate-900">Basis</p>
                <p className="mt-1 text-slate-700">
                  {conversionTrace?.basis ?? "No conversion basis available"}
                </p>
              </div>

              <div className="mt-3">
                <p className="font-medium text-slate-900">Derived factor</p>
                <p className="mt-1 font-mono text-xs text-slate-600">
                  {conversionTrace?.preview == null
                    ? "Not available for current unit / conversion combination"
                    : `${formatNumber(conversionTrace.preview, 6)} ${material.declaredUnit} per ${material.boqUnit}`}
                </p>
              </div>

              <div className="mt-3">
                <p className="font-medium text-slate-900">Conversion equation</p>
                <p className="mt-1 font-mono text-xs text-slate-600">
                  {conversionTrace?.equation ?? "No conversion equation available"}
                </p>
              </div>

              <div className="mt-3">
                <p className="font-medium text-slate-900">
                  Declared installed quantity = BoQ quantity × active conversion factor
                </p>
                <p className="mt-1 font-mono text-xs text-slate-600">
                  {formatNumber(sourceLine?.boqQty ?? material.boqQty, 4)} ×{" "}
                  {conversionTrace?.preview == null
                    ? "?"
                    : formatNumber(conversionTrace.preview, 6)}{" "}
                  = {formatNumber(material.declaredInstalledQty, 4)} {material.declaredUnit}
                </p>
              </div>

              <div className="mt-3">
                <p className="font-medium text-slate-900">
                  Gross factory input = declared installed ÷ (1 - factory waste rate)
                </p>
                <p className="mt-1 font-mono text-xs text-slate-600">
                  {formatNumber(material.declaredInstalledQty, 4)} ÷ (1 -{" "}
                  {formatNumber(sourceLine?.factoryWasteRate ?? 0, 4)}) ={" "}
                  {formatNumber(material.grossFactoryInputQty, 4)} {material.declaredUnit}
                </p>
              </div>

              <div className="mt-3">
                <p className="font-medium text-slate-900">
                  Supplier A1-A3 gross = gross factory input × EPD factor (kgCO2e per {material.declaredUnit})
                </p>
                <p className="mt-1 font-mono text-xs text-slate-600">
                  {formatNumber(material.grossFactoryInputQty, 4)} ×{" "}
                  {formatNumber(sourceLine?.epdA1A3KgCO2ePerDeclaredUnit ?? 0, 4)} ={" "}
                  {formatNumber(material.supplierA1A3GrossKgCO2e, 4)} kgCO2e
                </p>
              </div>

              <div className="mt-3">
                <p className="font-medium text-slate-900">
                  Inbound transport = gross input mass × distance × transport factor
                </p>
                <p className="mt-1 font-mono text-xs text-slate-600">
                  {formatNumber(material.grossInputMassTonnes, 6)} ×{" "}
                  {formatNumber(sourceLine?.inboundDistanceKm ?? 0, 2)} ×{" "}
                  {formatNumber(sourceLine?.inboundTransportKgCO2ePerTkm ?? 0, 4)} ={" "}
                  {formatNumber(material.inboundTransportKgCO2e, 4)} kgCO2e
                </p>
              </div>

              <div className="mt-3">
                <p className="font-medium text-slate-900">
                  A4 delivered mass = site input quantity × mass factor
                </p>
                <p className="mt-1 font-mono text-xs text-slate-600">
                  {formatNumber(material.siteInputQty, 4)} ×{" "}
                  {massFactorPreview == null ? "?" : formatNumber(massFactorPreview, 6)} ={" "}
                  {formatNumber(material.deliveredToSiteMassTonnes, 6)} t
                </p>
              </div>

              <div className="mt-3">
                <p className="font-medium text-slate-900">
                  A4 carbon = mass × (distance × 1.43) × 0.1211
                </p>
                <p className="mt-1 font-mono text-xs text-slate-600">
                  {formatNumber(material.deliveredToSiteMassTonnes, 6)} × (
                  {formatNumber(a4DistanceKm, 2)} × 1.43) × 0.1211 ={" "}
                  {formatNumber(materialA4KgCO2e, 4)} kgCO2e
                </p>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <p className="font-medium text-slate-900">
                  Installed mass = declared installed quantity × mass factor × 1000
                </p>
                <p className="mt-1 font-mono text-xs text-slate-600">
                  {formatNumber(material.declaredInstalledQty, 4)} ×{" "}
                  {massFactorPreview == null ? "?" : formatNumber(massFactorPreview, 6)} × 1000 ={" "}
                  {formatNumber(material.installedMassKg, 4)} kg
                </p>
              </div>

              <div className="mt-3">
                <p className="font-medium text-slate-900">Stored biogenic carbon</p>
                <p className="mt-1 font-mono text-xs text-slate-600">
                  {sourceLine?.biogenicMethod === "fallback_1_64"
                    ? `${formatNumber(material.installedMassKg, 4)} × ${formatNumber(
                        sourceLine?.woodMassFraction ?? 1,
                        4,
                      )} × (-1.64) = ${formatNumber(
                        material.storedBiogenicCarbonKgCO2e,
                        4,
                      )} kgCO2e`
                    : sourceLine?.biogenicMethod === "epd"
                      ? `${formatNumber(material.declaredInstalledQty, 4)} × ${formatNumber(
                          sourceLine?.epdStoredBiogenicCarbonKgCO2ePerDeclaredUnit ?? 0,
                          4,
                        )} = ${formatNumber(material.storedBiogenicCarbonKgCO2e, 4)} kgCO2e`
                      : "No biogenic method applied"}
                </p>
              </div>

              <div className="mt-3">
                <p className="font-medium text-slate-900">
                  A5 biogenic release = abs(stored biogenic carbon) × site waste rate
                </p>
                <p className="mt-1 font-mono text-xs text-slate-600">
                  abs({formatNumber(material.storedBiogenicCarbonKgCO2e, 4)}) ×{" "}
                  {formatNumber(sourceLine?.siteWasteRate ?? 0, 4)} ={" "}
                  {formatNumber(material.a5BiogenicKgCO2e, 4)} kgCO2e
                </p>
              </div>

              <div className="mt-3">
                <p className="font-medium text-slate-900">
                  Net stored biogenic after A5 = stored biogenic + A5 biogenic release
                </p>
                <p className="mt-1 font-mono text-xs text-slate-600">
                  {formatNumber(material.storedBiogenicCarbonKgCO2e, 4)} +{" "}
                  {formatNumber(material.a5BiogenicKgCO2e, 4)} ={" "}
                  {formatNumber(material.netStoredBiogenicCarbonKgCO2e, 4)} kgCO2e
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}