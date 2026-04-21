import { notFound } from "next/navigation";
import SectionCard from "@/components/ui/section-card";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  runProjectCalculation,
  updateProjectBoqLineMapping,
} from "../actions";

export default async function MappingPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = createServerSupabaseClient();

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", Number(projectId))
    .single();

  if (projectError || !project) {
    notFound();
  }

  const { data: boqLines, error: boqError } = await supabase
    .from("project_boq_lines")
    .select(
      "id, source_row_number, raw_description, boq_qty, boq_unit, matched_product_id"
    )
    .eq("project_id", Number(projectId))
    .order("source_row_number", { ascending: true });

  if (boqError) {
    throw new Error(boqError.message);
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, material_family")
    .order("name", { ascending: true });

  if (productsError) {
    throw new Error(productsError.message);
  }

  const runProjectCalculationWithId = runProjectCalculation.bind(
    null,
    Number(projectId),
  );

  const mappedCount = (boqLines ?? []).filter((line) => !!line.matched_product_id)
    .length;
  const totalCount = boqLines?.length ?? 0;

  return (
    <div className="space-y-8">
      <SectionCard
        title="Material mapping"
        description="Assign each uploaded BOQ row to a product in your material database."
      >
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-[#D9E1E7] bg-[#F7F9FA] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[#1F2937]">
              Mapping progress
            </p>
            <p className="mt-1 text-sm text-[#667085]">
              {mappedCount} of {totalCount} rows mapped
            </p>
          </div>

          <form action={runProjectCalculationWithId}>
            <button
              type="submit"
              className="inline-flex rounded-lg bg-cygnum-green px-4 py-2 text-sm font-medium text-white hover:bg-cygnum-green-dark"
            >
              Run Calculation
            </button>
          </form>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#D9E1E7] bg-white">
          <table className="min-w-full divide-y divide-[#D9E1E7]">
            <thead className="bg-[#F7F9FA]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Row #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Material
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Quantity
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Unit
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Mapping
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#667085]">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#D9E1E7] bg-white">
              {(boqLines ?? []).map((line) => {
                const actionWithIds = updateProjectBoqLineMapping.bind(
                  null,
                  Number(projectId),
                  line.id,
                );

                const isMapped = !!line.matched_product_id;

                const selectedProduct = (products ?? []).find(
                  (product) => product.id === line.matched_product_id,
                );

                return (
                  <tr key={line.id}>
                    <td className="px-4 py-3 text-sm text-[#1F2937]">
                      {line.source_row_number ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-[#1F2937]">
                      {line.raw_description}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-[#1F2937]">
                      {line.boq_qty ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-[#667085]">
                      {line.boq_unit ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-sm text-[#1F2937]">
                      <form action={actionWithIds} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            name="matched_product_id"
                            defaultValue={String(line.matched_product_id ?? "")}
                            className="min-w-[280px] rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm text-[#1F2937]"
                          >
                            <option value="">Select product</option>
                            {(products ?? []).map((product) => (
                              <option
                                key={product.id}
                                value={String(product.id)}
                              >
                                {product.name}
                                {product.material_family
                                  ? ` — ${product.material_family}`
                                  : ""}
                              </option>
                            ))}
                          </select>

                          <button
                            type="submit"
                            className="rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm font-medium text-[#1F2937]"
                          >
                            Save
                          </button>
                        </div>

                        {selectedProduct ? (
                          <p className="text-xs text-[#667085]">
                            Assigned:{" "}
                            <span className="font-medium text-[#1F2937]">
                              {selectedProduct.name}
                            </span>
                          </p>
                        ) : null}
                      </form>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          isMapped
                            ? "bg-[#E8F5EF] text-cygnum-green"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {isMapped ? "Mapped" : "Unmapped"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}