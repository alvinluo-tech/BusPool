import { createClient } from "@/lib/supabase/client";

export function getStoragePublicUrl(bucket: string, path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function getOriginalPhotoUrl(filename: string): string {
  return getStoragePublicUrl("ticket-originals", filename);
}

/** Check if a string is already a full HTTP(S) URL */
export function isFullUrl(str: string): boolean {
  return str.startsWith("http://") || str.startsWith("https://");
}

/** Download a private bucket file and return an object URL for <img> display */
export async function getPrivatePhotoUrl(bucket: string, path: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error || !data) return null;
  return URL.createObjectURL(data);
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
