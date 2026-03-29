import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import { supabaseAdmin } from "../../../lib/supabaseServer";
import { devLogin, isSupabaseAuthConfigured } from "../../../lib/authBackend";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isSupabaseAuthConfigured()) {
      const out = devLogin(email, password);
      if ("error" in out) {
        return NextResponse.json({ error: out.error }, { status: 401 });
      }
      return NextResponse.json({ success: true, user: out.user });
    }

    const client = supabaseAdmin ?? supabase;
    const { data, error } = await client
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
