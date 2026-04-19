import CalculatorApp from "@/components/calculator-app";
import { calculateProject } from "@/lib/calc";
import { sampleProject } from "@/lib/sample-project";

export default function LegacyPage() {
  const initialResult = calculateProject(sampleProject);

  return (
    <main className="min-h-screen bg-cygnum-green px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <CalculatorApp
          initialInput={sampleProject}
          initialResult={initialResult}
        />
      </div>
    </main>
  );
}