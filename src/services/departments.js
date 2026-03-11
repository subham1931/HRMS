import { assertSupabaseConfigured, supabase } from "../lib/supabaseClient"

function normalizeDepartmentName(value) {
  return String(value || "").trim().replace(/\s+/g, " ")
}

export async function listDepartments() {
  assertSupabaseConfigured()
  const { data, error } = await supabase
    .from("departments")
    .select("id, name, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (error) throw new Error(error.message || "Failed to load departments.")
  return (data || []).map((row) => row.name).filter(Boolean)
}

export async function createDepartment(name) {
  assertSupabaseConfigured()
  const normalized = normalizeDepartmentName(name)
  if (!normalized) throw new Error("Department name is required.")

  const { data, error } = await supabase
    .from("departments")
    .insert({ name: normalized, is_active: true })
    .select("id, name")
    .single()

  if (error) {
    const msg = String(error.message || "")
    if (msg.toLowerCase().includes("duplicate key") || msg.toLowerCase().includes("already exists")) {
      throw new Error("Department already exists.")
    }
    throw new Error(error.message || "Failed to create department.")
  }
  return data?.name || normalized
}
