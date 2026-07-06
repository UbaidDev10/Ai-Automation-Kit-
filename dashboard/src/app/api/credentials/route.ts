import { NextResponse } from "next/server";
import { isN8nConfigError, listKitCredentialStatuses } from "@/lib/n8n";

export async function GET() {
  try {
    const result = await listKitCredentialStatuses();
    return NextResponse.json(result);
  } catch (error) {
    if (isN8nConfigError(error)) {
      return NextResponse.json({ error: (error as Error).message }, { status: 503 });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      message.includes("403") || message.includes("401")
        ? 403
        : message.includes("404")
          ? 404
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
