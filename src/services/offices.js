import { assertSupabaseConfigured, supabase } from "../lib/supabaseClient"

function normalizeOfficeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ")
}

export async function listOffices() {
  assertSupabaseConfigured()
  const { data, error } = await supabase
    .from("offices")
    .select("id, name, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) throw new Error(error.message || "Failed to load offices.")
  return (data || []).map((row) => row.name).filter(Boolean)
}

export async function createOffice(name) {
  assertSupabaseConfigured()
  const normalized = normalizeOfficeName(name)
  if (!normalized) throw new Error("Office name is required.")

  const { data, error } = await supabase
    .from("offices")
    .insert({ name: normalized, is_active: true })
    .select("id, name")
    .single()

  if (error) {
    const msg = String(error.message || "")
    if (msg.toLowerCase().includes("duplicate key") || msg.toLowerCase().includes("already exists")) {
      throw new Error("Office already exists.")
    }
    throw new Error(error.message || "Failed to create office.")
  }
  return data?.name || normalized
}
