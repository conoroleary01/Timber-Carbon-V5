"use client";

import { useMemo, useState } from "react";

function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function formatPercent(value: number) {
  return `${formatNumber(value, 1)}%`;
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-[#EEF2F4] py-2 last:border-b-0">
      <span className="text-sm text-[#667085]">{label}</span>
      <span className="text-right text-sm font-medium text-[#1F2937]">
        {value}
      </span>
    </div>
  );
}

function FormulaCard({
  title,
  formula,
  result,
  subtle = false,
}: {
  title: string;
  formula: string;
  result?: string;
  subtle?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        subtle
          ? "border-[#D7E9DE] bg-[#F4FBF7]"
          : "border-[#EEF2F4] bg-[#FAFCFC]"
      }`}
    >
      <p className="text-sm font-medium text-[#1F2937]">{title}</p>
      <p className="mt-3 font-mono text-xs leading-6 text-[#52606D]">
        {formula}
      </p>
      {result ? (
        <p className="mt-3 border-t border-[#E8EEF2] pt-3 text-sm font-semibold text-[#1F2937]">
          {result}
        </p>
      ) : null}
    </div>
  );
}

export type MaterialBreakdownListItem = {
  id: string;
  name: string;
  materialFamily: string;
  installedMassKg: number;
  declaredInstalledQty: number;
  declaredUnit: string;
  subtotal: number;
  share: number;

  sourceBoqQty: number;
  sourceBoqUnit: string;
  factoryWasteRate: number;
  siteWasteRate: number;
  epdA1A3Factor: number;
  inboundDistanceKm: number;
  inboundTransportFactor: number;
  a4DistanceKm: number;
  c2Factor: number;
  c3c4Factor: number;

  supplierA1A3NetKgCO2e: number;
  factoryWasteUpstreamKgCO2e: number;
  supplierA1A3GrossKgCO2e: number;
  inboundTransportKgCO2e: number;
  factoryWasteTransportKgCO2e: number;
  factoryWasteTreatmentKgCO2e: number;
  a4KgCO2e: number;
  c2KgCO2e: number;
  c3c4KgCO2e: number;

  grossFactoryInputQty: number;
  factoryWasteQty: number;
  siteInputQty: number;
  siteWasteQty: number;
  grossInputMassTonnes: number;
  deliveredToSiteMassTonnes: number;

  storedBiogenicCarbonKgCO2e: number;
  biogenicFormula: string;
};

export default function MaterialBreakdownList({
  items,
}: {
  items: MaterialBreakdownListItem[];
}) {
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return items;

    return items.filter((item) => {
      return (
        item.name.toLowerCase().includes(q) ||
        item.materialFamily.toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E1E7] bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-[#1F2937]">
            Search materials
          </p>
          <p className="mt-1 text-sm text-[#667085]">
            {filteredItems.length} of {items.length} material sections shown
          </p>
        </div>

        <div className="w-full md:max-w-sm">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search material or category"
            className="w-full rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none"
          />
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D9E1E7] bg-[#F7F9FA] px-6 py-10 text-center">
          <p className="text-sm font-medium text-[#1F2937]">
            No matching materials
          </p>
          <p className="mt-2 text-sm text-[#667085]">
            Try a different material name or category.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, index) => (
            <details
              key={item.id}
              className="group overflow-hidden rounded-2xl border border-[#D9E1E7] bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 marker:content-none">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#E8F5EE] px-2 text-xs font-semibold text-cygnum-green">
                      {index + 1}
                    </span>
                    <h3 className="truncate text-lg font-semibold text-[#1F2937]">
                      {item.name}
                    </h3>
                    <span className="rounded-full bg-[#F3F6F8] px-2.5 py-1 text-xs font-medium text-[#667085]">
                      {item.materialFamily || "—"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#667085]">
                    Installed mass {formatNumber(item.installedMassKg, 3)} kg
                    {" · "}
                    Declared installed {formatNumber(item.declaredInstalledQty, 4)}{" "}
                    {item.declaredUnit}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-[#667085]">
                      Material subtotal
                    </p>
                    <p className="mt-1 text-lg font-semibold text-[#1F2937]">
                      {formatNumber(item.subtotal)}
                    </p>
                    <p className="text-xs text-[#667085]">
                      {formatPercent(item.share)}
                    </p>
                  </div>

                  <div className="text-[#667085] transition group-open:rotate-180">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </summary>

              <div className="border-t border-[#E8EEF2] bg-[#FCFDFD] px-5 py-5">
                <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.72fr]">
                  <div className="rounded-2xl border border-[#E3E8EC] bg-white p-5">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-[#667085]">
                      Source inputs
                    </h4>
                    <div className="mt-4">
                      <DataRow
                        label="BoQ quantity"
                        value={`${formatNumber(item.sourceBoqQty, 4)} ${item.sourceBoqUnit}`}
                      />
                      <DataRow
                        label="Declared unit"
                        value={item.declaredUnit}
                      />
                      <DataRow
                        label="Factory waste rate"
                        value={`${formatNumber(item.factoryWasteRate * 100, 2)}%`}
                      />
                      <DataRow
                        label="Site waste rate"
                        value={`${formatNumber(item.siteWasteRate * 100, 2)}%`}
                      />
                      <DataRow
                        label="EPD A1-A3 factor"
                        value={`${formatNumber(item.epdA1A3Factor, 4)} kgCO₂e/${item.declaredUnit}`}
                      />
                      <DataRow
                        label="Inbound distance"
                        value={`${formatNumber(item.inboundDistanceKm, 2)} km`}
                      />
                      <DataRow
                        label="Inbound transport factor"
                        value={`${formatNumber(item.inboundTransportFactor, 4)} kgCO₂e/tkm`}
                      />
                      <DataRow
                        label="A4 distance"
                        value={`${formatNumber(item.a4DistanceKm, 2)} km`}
                      />
                      <DataRow
                        label="C2 factor"
                        value={`${formatNumber(item.c2Factor, 4)} kgCO₂e/kg`}
                      />
                      <DataRow
                        label="C3-C4 factor"
                        value={`${formatNumber(item.c3c4Factor, 4)} kgCO₂e/kg`}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#E3E8EC] bg-white p-5">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-[#667085]">
                      Quantity flow
                    </h4>
                    <div className="mt-4">
                      <DataRow
                        label="Declared installed quantity"
                        value={`${formatNumber(item.declaredInstalledQty, 4)} ${item.declaredUnit}`}
                      />
                      <DataRow
                        label="Gross factory input"
                        value={`${formatNumber(item.grossFactoryInputQty, 4)} ${item.declaredUnit}`}
                      />
                      <DataRow
                        label="Factory waste quantity"
                        value={`${formatNumber(item.factoryWasteQty, 4)} ${item.declaredUnit}`}
                      />
                      <DataRow
                        label="Site input quantity"
                        value={`${formatNumber(item.siteInputQty, 4)} ${item.declaredUnit}`}
                      />
                      <DataRow
                        label="Site waste quantity"
                        value={`${formatNumber(item.siteWasteQty, 4)} ${item.declaredUnit}`}
                      />
                      <DataRow
                        label="Gross input mass"
                        value={`${formatNumber(item.grossInputMassTonnes, 6)} t`}
                      />
                      <DataRow
                        label="Delivered-to-site mass"
                        value={`${formatNumber(item.deliveredToSiteMassTonnes, 6)} t`}
                      />
                      <DataRow
                        label="Installed mass"
                        value={`${formatNumber(item.installedMassKg, 4)} kg`}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#CFE7D9] bg-[#F4FBF7] p-5">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-[#567164]">
                      Biogenic carbon
                    </h4>
                    <div className="mt-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-[#667085]">
                        Stored in asset
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-[#1F2937]">
                        {formatNumber(item.storedBiogenicCarbonKgCO2e)}
                      </p>
                      <p className="mt-2 text-sm text-[#667085]">kgCO₂e</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#E3E8EC] bg-white p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-[#667085]">
                    Material-linked results
                  </h4>
                  <div className="mt-4 grid gap-6 xl:grid-cols-2">
                    <div>
                      <DataRow
                        label="Supplier A1-A3 net"
                        value={`${formatNumber(item.supplierA1A3NetKgCO2e)} kgCO₂e`}
                      />
                      <DataRow
                        label="Factory waste upstream"
                        value={`${formatNumber(item.factoryWasteUpstreamKgCO2e)} kgCO₂e`}
                      />
                      <DataRow
                        label="Supplier A1-A3 gross"
                        value={`${formatNumber(item.supplierA1A3GrossKgCO2e)} kgCO₂e`}
                      />
                      <DataRow
                        label="Inbound transport"
                        value={`${formatNumber(item.inboundTransportKgCO2e)} kgCO₂e`}
                      />
                      <DataRow
                        label="Factory waste transport"
                        value={`${formatNumber(item.factoryWasteTransportKgCO2e)} kgCO₂e`}
                      />
                    </div>

                    <div>
                      <DataRow
                        label="Factory waste treatment"
                        value={`${formatNumber(item.factoryWasteTreatmentKgCO2e)} kgCO₂e`}
                      />
                      <DataRow
                        label="A4"
                        value={`${formatNumber(item.a4KgCO2e)} kgCO₂e`}
                      />
                      <DataRow
                        label="C2"
                        value={`${formatNumber(item.c2KgCO2e)} kgCO₂e`}
                      />
                      <DataRow
                        label="C3-C4"
                        value={`${formatNumber(item.c3c4KgCO2e)} kgCO₂e`}
                      />
                      <DataRow
                        label="Material subtotal"
                        value={`${formatNumber(item.subtotal)} kgCO₂e`}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#E3E8EC] bg-white p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-[#667085]">
                    Calculation lines
                  </h4>

                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <FormulaCard
                      title="Declared installed quantity"
                      formula={`${formatNumber(item.sourceBoqQty, 4)} × conversion factor = ${formatNumber(
                        item.declaredInstalledQty,
                        4,
                      )} ${item.declaredUnit}`}
                      result={`${formatNumber(item.declaredInstalledQty, 4)} ${item.declaredUnit}`}
                    />

                    <FormulaCard
                      title="Gross factory input"
                      formula={`${formatNumber(item.declaredInstalledQty, 4)} ÷ (1 - ${formatNumber(
                        item.factoryWasteRate,
                        4,
                      )}) = ${formatNumber(item.grossFactoryInputQty, 4)} ${item.declaredUnit}`}
                      result={`${formatNumber(item.grossFactoryInputQty, 4)} ${item.declaredUnit}`}
                    />

                    <FormulaCard
                      title="Supplier A1-A3 gross"
                      formula={`${formatNumber(item.grossFactoryInputQty, 4)} × ${formatNumber(
                        item.epdA1A3Factor,
                        4,
                      )} = ${formatNumber(item.supplierA1A3GrossKgCO2e, 4)} kgCO₂e`}
                      result={`${formatNumber(item.supplierA1A3GrossKgCO2e, 4)} kgCO₂e`}
                    />

                    <FormulaCard
                      title="Inbound transport"
                      formula={`${formatNumber(item.grossInputMassTonnes, 6)} × ${formatNumber(
                        item.inboundDistanceKm,
                        2,
                      )} × ${formatNumber(item.inboundTransportFactor, 4)} = ${formatNumber(
                        item.inboundTransportKgCO2e,
                        4,
                      )} kgCO₂e`}
                      result={`${formatNumber(item.inboundTransportKgCO2e, 4)} kgCO₂e`}
                    />

                    <FormulaCard
                      title="A4 carbon"
                      formula={`${formatNumber(item.deliveredToSiteMassTonnes, 6)} × ${formatNumber(
                        item.a4DistanceKm,
                        2,
                      )} × project A4 factor = ${formatNumber(item.a4KgCO2e, 4)} kgCO₂e`}
                      result={`${formatNumber(item.a4KgCO2e, 4)} kgCO₂e`}
                    />

                    <FormulaCard
                      title="Installed mass"
                      formula={`declared installed quantity × active mass factor × 1000 = ${formatNumber(
                        item.installedMassKg,
                        4,
                      )} kg`}
                      result={`${formatNumber(item.installedMassKg, 4)} kg`}
                    />

                    <FormulaCard
                      title="C2"
                      formula={`${formatNumber(item.installedMassKg, 4)} × ${formatNumber(
                        item.c2Factor,
                        4,
                      )} = ${formatNumber(item.c2KgCO2e, 4)} kgCO₂e`}
                      result={`${formatNumber(item.c2KgCO2e, 4)} kgCO₂e`}
                    />

                    <FormulaCard
                      title="C3-C4"
                      formula={`${formatNumber(item.installedMassKg, 4)} × ${formatNumber(
                        item.c3c4Factor,
                        4,
                      )} = ${formatNumber(item.c3c4KgCO2e, 4)} kgCO₂e`}
                      result={`${formatNumber(item.c3c4KgCO2e, 4)} kgCO₂e`}
                    />

                    <div className="xl:col-span-2">
                      <FormulaCard
                        title="Stored biogenic carbon"
                        formula={item.biogenicFormula}
                        result={`${formatNumber(
                          item.storedBiogenicCarbonKgCO2e,
                          4,
                        )} kgCO₂e stored in asset`}
                        subtle
                      />
                    </div>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}