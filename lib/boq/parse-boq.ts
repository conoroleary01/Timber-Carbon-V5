import * as XLSX from "xlsx";

export type ParsedBoqLine = {
  source_row_number: number;
  raw_description: string;
  boq_qty: number | null;
  boq_unit: string;
  review_status: "Valid" | "Warning" | "Error";
  validation_issue: string | null;
};

function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const cleaned = String(value ?? "")
    .trim()
    .replace(/,/g, "");

  if (!cleaned) return null;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function findHeaderIndex(headers: string[], candidates: string[]): number {
  return headers.findIndex((header) => candidates.includes(header));
}

function findHeaderRow(rows: unknown[][]): number {
  const candidates = [
    "material",
    "description",
    "item",
    "product",
    "raw_description",
  ];

  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const normalized = (rows[i] ?? []).map(normalizeHeader);
    const hasDescription = normalized.some((cell) => candidates.includes(cell));
    const hasQty = normalized.some((cell) =>
      ["qty", "quantity", "boq_qty"].includes(cell),
    );
    const hasUnit = normalized.some((cell) =>
      ["unit", "uom", "boq_unit"].includes(cell),
    );

    if ((hasDescription && hasQty) || (hasDescription && hasUnit)) {
      return i;
    }
  }

  return 0;
}

export function parseBoqWorkbook(arrayBuffer: ArrayBuffer): ParsedBoqLine[] {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("No worksheet found in uploaded file");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
  }) as unknown[][];

  if (!rows.length) {
    return [];
  }

  const headerRowIndex = findHeaderRow(rows);
  const headerRow = rows[headerRowIndex] ?? [];
  const normalizedHeaders = headerRow.map(normalizeHeader);

  let descriptionIndex = findHeaderIndex(normalizedHeaders, [
    "material",
    "description",
    "item",
    "product",
    "raw_description",
  ]);

  let qtyIndex = findHeaderIndex(normalizedHeaders, [
    "qty",
    "quantity",
    "boq_qty",
  ]);

  let unitIndex = findHeaderIndex(normalizedHeaders, [
    "unit",
    "uom",
    "boq_unit",
  ]);

  if (descriptionIndex === -1) descriptionIndex = 0;
  if (qtyIndex === -1) qtyIndex = 1;
  if (unitIndex === -1) unitIndex = 2;

  const parsedRows: ParsedBoqLine[] = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];

    const raw_description = String(row[descriptionIndex] ?? "").trim();
    const boq_qty = parseNumber(row[qtyIndex]);
    const boq_unit = String(row[unitIndex] ?? "").trim();

    const isCompletelyBlank =
      !raw_description &&
      boq_qty === null &&
      !boq_unit &&
      row.every((cell) => String(cell ?? "").trim() === "");

    if (isCompletelyBlank) {
      continue;
    }

    let review_status: ParsedBoqLine["review_status"] = "Valid";
    let validation_issue: string | null = null;

    if (!raw_description) {
      review_status = "Error";
      validation_issue = "Missing material description";
    } else if (boq_qty === null) {
      review_status = "Error";
      validation_issue = "Missing or invalid quantity";
    } else if (!boq_unit) {
      review_status = "Error";
      validation_issue = "Missing unit";
    }

    parsedRows.push({
      source_row_number: i + 1,
      raw_description,
      boq_qty,
      boq_unit,
      review_status,
      validation_issue,
    });
  }

  return parsedRows;
}