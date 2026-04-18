import type { ProjectInput } from "@/lib/types";
import EditableMaterialCard from "@/components/editable-material-card";

type Props = {
  currentInput: ProjectInput;
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

export default function EditableMaterialLines({
  currentInput,
  updateMaterialField,
  getDerivedConversionPreview,
  getAutoDerivedMassFactorPreview,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Editable material lines
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Edit the main material inputs here, then click Recalculate. The JSON below
        remains the source of truth for audit and verification.
      </p>

      <div className="mt-6 space-y-6">
        {currentInput.materials.map((material) => (
          <EditableMaterialCard
            key={material.id}
            material={material}
            updateMaterialField={updateMaterialField}
            getDerivedConversionPreview={getDerivedConversionPreview}
            getAutoDerivedMassFactorPreview={getAutoDerivedMassFactorPreview}
          />
        ))}
      </div>
    </section>
  );
}