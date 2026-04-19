export default function UploadDropzone() {
  return (
    <div className="rounded-xl border border-dashed border-[#D9E1E7] bg-[#F7F9FA] p-8 text-center">
      <div className="mx-auto max-w-md">
        <h3 className="text-lg font-semibold text-[#1F2937]">
          Upload Excel file
        </h3>
        <p className="mt-2 text-sm text-[#667085]">
          Drag and drop your quantity take-off file here, or browse to upload.
        </p>

        <div className="mt-6">
          <button
            type="button"
            className="rounded-lg bg-cygnum-green px-4 py-2 text-sm font-medium text-white hover:bg-cygnum-green-dark"
          >
            Choose File
          </button>
        </div>

        <p className="mt-4 text-xs text-[#667085]">
          Accepted formats: .xlsx, .xls, .csv
        </p>
      </div>
    </div>
  );
}