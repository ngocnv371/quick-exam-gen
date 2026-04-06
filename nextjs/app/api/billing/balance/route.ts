import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCoinsBalance } from "@/lib/billing";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balance = await getCoinsBalance(supabase);
  return NextResponse.json({ balance });
}
