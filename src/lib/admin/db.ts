import { createClient } from "@/lib/supabase/client";

export function getStoragePublicUrl(bucket: string, path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function getOriginalPhotoUrl(filename: string): string {
  return getStoragePublicUrl("ticket-originals", filename);
}

export async function insertAdminLog(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, unknown>,
  reason: string,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
    reason,
  });
  if (error) {
    console.error("Failed to insert admin log:", error);
  }
}
