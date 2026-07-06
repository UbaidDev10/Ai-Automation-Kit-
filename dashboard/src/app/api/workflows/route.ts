import { NextResponse } from "next/server";
import { getMainWorkflow, isN8nConfigError, listWorkflows } from "@/lib/n8n";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    if (all) {
      const workflows = await listWorkflows();
      return NextResponse.json({ workflows });
    }

    const workflow = await getMainWorkflow();
    if (!workflow) {
      return NextResponse.json(
        { error: "Main workflow not found in n8n" },
        { status: 404 }
      );
    }
    return NextResponse.json(workflow);
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
