import { NextResponse } from "next/server";
import { executeWorkflow, isN8nConfigError } from "@/lib/n8n";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await executeWorkflow(id);
    return NextResponse.json(result);
  } catch (error) {
    if (isN8nConfigError(error)) {
      return NextResponse.json({ error: (error as Error).message }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    let status = 500;
    if (message.includes("403") || message.includes("401")) status = 403;
    else if (message.includes("Timed out") || message.includes("within 30 seconds")) status = 504;
    else if (message.includes("Webhook trigger failed (404)")) status = 503;
    return NextResponse.json({ error: message }, { status });
  }
}
