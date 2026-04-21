import "server-only";
import { chromium } from "playwright";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage();

    const reportUrl = new URL(
      `/projects/${projectId}/reports`,
      request.url,
    ).toString();

    await page.goto(reportUrl, {
      waitUntil: "networkidle",
      timeout: 120000,
    });

    await page.emulateMedia({ media: "print" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "14mm",
        right: "12mm",
        bottom: "14mm",
        left: "12mm",
      },
    });

    const pdfBuffer = Buffer.from(pdf);

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="project-${projectId}-engineering-report.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } finally {
    await browser.close();
  }
}