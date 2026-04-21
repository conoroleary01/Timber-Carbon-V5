"use client";

export default function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex rounded-lg bg-cygnum-green px-4 py-2 text-sm font-medium text-white hover:bg-cygnum-green-dark print:hidden"
    >
      Print report
    </button>
  );
}