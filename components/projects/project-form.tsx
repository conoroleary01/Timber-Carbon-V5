export default function ProjectForm() {
  return (
    <div className="grid gap-4">
      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#667085]">
          Project name
        </span>
        <input
          type="text"
          placeholder="Enter project name"
          className="w-full rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#667085]">
          Client
        </span>
        <input
          type="text"
          placeholder="Enter client name"
          className="w-full rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#667085]">
          Floor area m²
        </span>
        <input
          type="number"
          step="any"
          placeholder="0"
          className="w-full rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#667085]">
          Location
        </span>
        <input
          type="text"
          placeholder="Enter project location"
          className="w-full rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-[#667085]">
          Building type
        </span>
        <select className="w-full rounded-lg border border-[#D9E1E7] bg-white px-3 py-2 text-sm text-[#1F2937] outline-none">
          <option>House</option>
          <option>Apartment</option>
          <option>Mixed use</option>
          <option>Other</option>
        </select>
      </label>
    </div>
  );
}