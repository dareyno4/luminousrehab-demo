import { supabaseClient } from "../lib/supabase";

// Helper to derive the storage path from a public URL
function getStoragePathFromPublicUrl(publicUrl: string): string | null {
  // Supabase public URL looks like:
  // https://<project>.supabase.co/storage/v1/object/public/chart-documents/<path>
  const marker = "/storage/v1/object/public/chart-documents/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.substring(idx + marker.length);
}

export async function uploadDocument(file: File, chartId: string, tenantId: string) {
  const fileExt = file.name.split('.').pop();
  const path = `${tenantId}/${chartId}/${crypto.randomUUID()}.${fileExt}`;

  // 1: Upload to storage
  const { data: uploadData, error: uploadError } = await supabaseClient.storage
    .from("chart-documents")
    .upload(path, file);

  if (uploadError) throw uploadError;

  // 2: Get URL
  const { data: urlData } = supabaseClient.storage
    .from("chart-documents")
    .getPublicUrl(path);

  const fileUrl = urlData.publicUrl;

  // 3: Insert metadata row into documents table
  const { data: docRow, error: docError } = await supabaseClient
    .from("documents")
    .insert({
      chart_id: chartId,
      tenant_id: tenantId,
      file_name: file.name,
      file_type: file.type,
      file_url: fileUrl,
    })
    .select()
    .single();

  if (docError) throw docError;
  return docRow;
}

export async function deleteDocument(docId: string, fileUrl: string) {
  // Best-effort storage cleanup using path derived from public URL
  const storagePath = getStoragePathFromPublicUrl(fileUrl);
  if (storagePath) {
    await supabaseClient.storage
      .from("chart-documents")
      .remove([storagePath]);
    // We intentionally ignore storage errors here to not block DB cleanup.
  }

  const { error } = await supabaseClient
    .from("documents")
    .delete()
    .eq("id", docId);

  if (error) throw error;
  return { success: true } as const;
}