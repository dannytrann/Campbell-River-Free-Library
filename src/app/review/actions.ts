"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyReviewToken } from "@/lib/review-token";

/**
 * Approve/reject straight from an emailed link. Authority comes from the signed
 * token, which names one row — so this can only ever touch that submission.
 */
export async function decideFromEmail(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const claim = verifyReviewToken(token);
  if (!claim) redirect("/review?error=expired");

  const status = formData.get("status") === "approved" ? "approved" : "rejected";
  const supabase = createAdminClient();
  const table = claim.kind === "library" ? "libraries" : "photos";

  // Only ever moves a pending row, so a re-clicked link can't undo a later decision.
  const { error } = await supabase.from(table).update({ status }).eq("id", claim.id).eq("status", "pending");
  if (error) throw error;

  revalidatePath("/", "layout");
  redirect(`/review?done=${status}`);
}
