import { assertSupabaseConfigured, supabase } from "../lib/supabaseClient"

function normalizeOfficeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ")
}

function mapOfficeRow(row) {
  return {
    id: row.id || "",
    name: row.name || "",
    isActive: Boolean(row.is_active),
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  }
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

export async function listOfficeDetails() {
  assertSupabaseConfigured()

  const { data, error } = await supabase
    .from("offices")
    .select("id, name, is_active, created_at, updated_at")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message || "Failed to load offices.")
  return (data || []).map(mapOfficeRow)
}

export async function updateOfficeDetails(officeId, payload = {}) {
  assertSupabaseConfigured()
  const id = String(officeId || "").trim()
  if (!id) throw new Error("Missing office ID.")

  const updates = {}
  if (Object.hasOwn(payload, "name")) {
    const normalized = normalizeOfficeName(payload.name)
    if (!normalized) throw new Error("Office name is required.")
    updates.name = normalized
  }
  if (Object.hasOwn(payload, "isActive")) {
    updates.is_active = Boolean(payload.isActive)
  }
  if (Object.keys(updates).length === 0) {
    throw new Error("No office changes provided.")
  }

  const { data, error } = await supabase
    .from("offices")
    .update(updates)
    .eq("id", id)
    .select("id, name, is_active, created_at, updated_at")
    .maybeSingle()

  if (error) {
    const msg = String(error.message || "")
    if (msg.toLowerCase().includes("duplicate key") || msg.toLowerCase().includes("already exists")) {
      throw new Error("Office already exists.")
    }
    throw new Error(error.message || "Failed to update office.")
  }
  if (!data) throw new Error("Office not found.")

  return mapOfficeRow(data)
}
