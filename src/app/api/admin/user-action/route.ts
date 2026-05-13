import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, action } = body;

  if (!userId || !action) {
    return Response.json({ error: "Missing data" }, { status: 400 });
  }

  // BAN USER (soft block)
  if (action === "ban") {
    const { error } = await supabaseAdmin
      .from("user_profiles")
      .update({ is_banned: true })
      .eq("id", userId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  }

  // UNBAN USER
  if (action === "unban") {
    const { error } = await supabaseAdmin
      .from("user_profiles")
      .update({ is_banned: false })
      .eq("id", userId);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  }

  // DELETE USER (HARD DELETE)
  if (action === "delete") {
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (authError) {
      return Response.json({ error: authError.message }, { status: 500 });
    }

    await supabaseAdmin.from("user_profiles").delete().eq("id", userId);

    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}