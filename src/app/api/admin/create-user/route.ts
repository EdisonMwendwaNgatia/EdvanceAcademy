/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  try {
    const { email, full_name, role } = await req.json();

    // 1. Send invite email (NO PASSWORD)
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    );

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    const userId = data.user?.id;

    // 2. Create profile row
    if (userId) {
      await supabaseAdmin.from("user_profiles").insert({
        id: userId,
        email,
        full_name,
        role,
      });
    }

    return Response.json({
      success: true,
      message: "Invitation sent",
    });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Server error" },
      { status: 500 },
    );
  }
}