import { assertSupabaseConfigured, supabase } from "../lib/supabaseClient"

function normalizeLeaveTypeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ")
}

function parseNumber(value, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function mapLeaveTypeRow(row) {
  return {
    id: row.id || "",
    name: row.name || "",
    annualLimit: parseNumber(row.annual_limit_days, 0),
    earnedPerMonth: parseNumber(row.earned_per_month_days, 0),
    isPaid: Boolean(row.is_paid),
    isActive: Boolean(row.is_active),
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  }
}

export async function listLeaveTypes() {
  assertSupabaseConfigured()
  const { data, error } = await supabase
    .from("leave_types")
    .select("id, name, annual_limit_days, earned_per_month_days, is_paid, is_active, created_at, updated_at")
    .order("name", { ascending: true })

  if (error) throw new Error(error.message || "Failed to load leave types.")
  return (data || []).map(mapLeaveTypeRow)
}

export async function createLeaveType(payload = {}) {
  assertSupabaseConfigured()
  const name = normalizeLeaveTypeName(payload.name)
  const annualLimit = Math.max(0, parseNumber(payload.annualLimit, 0))
  const earnedPerMonth = Math.max(0, parseNumber(payload.earnedPerMonth, 0))
  const isPaid = Boolean(payload.isPaid)
  if (!name) throw new Error("Leave type name is required.")

  const { data, error } = await supabase
    .from("leave_types")
    .insert({
      name,
      annual_limit_days: annualLimit,
      earned_per_month_days: earnedPerMonth,
      is_paid: isPaid,
      is_active: true,
    })
    .select("id, name, annual_limit_days, earned_per_month_days, is_paid, is_active, created_at, updated_at")
    .single()

  if (error) {
    const msg = String(error.message || "").toLowerCase()
    if (msg.includes("duplicate key") || msg.includes("already exists")) {
      throw new Error("Leave type already exists.")
    }
    throw new Error(error.message || "Failed to create leave type.")
  }
  return mapLeaveTypeRow(data)
}

export async function updateLeaveType(leaveTypeId, payload = {}) {
  assertSupabaseConfigured()
  const id = String(leaveTypeId || "").trim()
  if (!id) throw new Error("Missing leave type ID.")

  const updates = {}
  if (Object.hasOwn(payload, "name")) {
    const name = normalizeLeaveTypeName(payload.name)
    if (!name) throw new Error("Leave type name is required.")
    updates.name = name
  }
  if (Object.hasOwn(payload, "annualLimit")) {
    updates.annual_limit_days = Math.max(0, parseNumber(payload.annualLimit, 0))
  }
  if (Object.hasOwn(payload, "earnedPerMonth")) {
    updates.earned_per_month_days = Math.max(0, parseNumber(payload.earnedPerMonth, 0))
  }
  if (Object.hasOwn(payload, "isPaid")) {
    updates.is_paid = Boolean(payload.isPaid)
  }
  if (Object.hasOwn(payload, "isActive")) {
    updates.is_active = Boolean(payload.isActive)
  }
  if (Object.keys(updates).length === 0) {
    throw new Error("No leave type changes provided.")
  }

  const { data, error } = await supabase
    .from("leave_types")
    .update(updates)
    .eq("id", id)
    .select("id, name, annual_limit_days, earned_per_month_days, is_paid, is_active, created_at, updated_at")
    .maybeSingle()

  if (error) {
    const msg = String(error.message || "").toLowerCase()
    if (msg.includes("duplicate key") || msg.includes("already exists")) {
      throw new Error("Leave type already exists.")
    }
    throw new Error(error.message || "Failed to update leave type.")
  }
  if (!data) throw new Error("Leave type not found.")
  return mapLeaveTypeRow(data)
}
