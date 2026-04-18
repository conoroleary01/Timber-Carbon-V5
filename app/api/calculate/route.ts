import { NextResponse } from "next/server";
import { calculateProject } from "@/lib/calc";
import type { ProjectInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProjectInput;
    const result = calculateProject(body);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Calculation failed";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}