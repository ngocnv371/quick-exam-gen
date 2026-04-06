import { NextRequest, NextResponse } from "next/server";
import { getProfileRole } from "@/lib/admin";
import { fulfillOrder, failOrder } from "@/lib/billing";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Admin check
  const role = await getProfileRole();
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action } = body as Record<string, unknown>;
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
  }

  try {
    if (action === "approve") {
      await fulfillOrder(id);
    } else {
      await failOrder(id, "failed");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Operation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, action });
}
