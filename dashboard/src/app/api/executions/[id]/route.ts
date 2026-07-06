import { NextResponse } from "next/server";
import { getExecution, isN8nConfigError } from "@/lib/n8n";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const execution = await getExecution(id);
    return NextResponse.json(execution);
  } catch (error) {
    if (isN8nConfigError(error)) {
      return NextResponse.json({ error: (error as Error).message }, { status: 503 });
    }
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
