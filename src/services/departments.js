import { assertSupabaseConfigured, supabase } from "../lib/supabaseClient"

function normalizeDepartmentName(value) {
  return String(value || "").trim().replace(/\s+/g, " ")
}

function mapDepartmentRow(row) {
  return {
    id: row.id || "",
    name: row.name || "",
    isActive: Boolean(row.is_active),
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  }
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

export async function listDepartmentDetails() {
  assertSupabaseConfigured()

  const { data, error } = await supabase
    .from("departments")
    .select("id, name, is_active, created_at, updated_at")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message || "Failed to load departments.")
  return (data || []).map(mapDepartmentRow)
}

export async function updateDepartmentDetails(departmentId, payload = {}) {
  assertSupabaseConfigured()
  const id = String(departmentId || "").trim()
  if (!id) throw new Error("Missing department ID.")

  const updates = {}
  if (Object.hasOwn(payload, "name")) {
    const normalized = normalizeDepartmentName(payload.name)
    if (!normalized) throw new Error("Department name is required.")
    updates.name = normalized
  }
  if (Object.hasOwn(payload, "isActive")) {
    updates.is_active = Boolean(payload.isActive)
  }
  if (Object.keys(updates).length === 0) {
    throw new Error("No department changes provided.")
  }

  const { data, error } = await supabase
    .from("departments")
    .update(updates)
    .eq("id", id)
    .select("id, name, is_active, created_at, updated_at")
    .maybeSingle()

  if (error) {
    const msg = String(error.message || "")
    if (msg.toLowerCase().includes("duplicate key") || msg.toLowerCase().includes("already exists")) {
      throw new Error("Department already exists.")
    }
    throw new Error(error.message || "Failed to update department.")
  }
  if (!data) throw new Error("Department not found.")

  return mapDepartmentRow(data)
}
