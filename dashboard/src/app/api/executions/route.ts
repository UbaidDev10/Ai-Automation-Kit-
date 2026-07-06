import { NextResponse } from "next/server";
import {
  getMainWorkflow,
  isN8nConfigError,
  listExecutions,
} from "@/lib/n8n";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? "25");

    const workflow = await getMainWorkflow();
    if (!workflow) {
      return NextResponse.json(
        { error: "Main workflow not found in n8n" },
        { status: 404 }
      );
    }

    const executions = await listExecutions(workflow.id, limit);
    return NextResponse.json({ workflow, executions });
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
