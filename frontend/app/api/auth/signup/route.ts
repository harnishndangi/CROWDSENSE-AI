import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";
import { supabaseAdmin } from "../../../lib/supabaseServer";
import { devSignup, isSupabaseAuthConfigured } from "../../../lib/authBackend";

export async function POST(req: Request) {
  try {
    const { fullName, email, password } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isSupabaseAuthConfigured()) {
      const out = devSignup(fullName, email, password);
      if ("error" in out) {
        return NextResponse.json({ error: out.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, user: out.user });
    }

    const client = supabaseAdmin ?? supabase;
    const { data, error } = await client
      .from("users")
      .insert([{ name: fullName, email, password }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
