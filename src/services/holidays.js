import { assertSupabaseConfigured, supabase } from "../lib/supabaseClient"

function mapHolidayRow(row) {
  return {
    id: row.id || "",
    holidayDate: row.holiday_date || "",
    holidayName: row.holiday_name || "",
    createdAt: row.created_at || null,
  }
}

export async function listHolidays() {
  assertSupabaseConfigured()
  const { data, error } = await supabase
    .from("holidays")
    .select("id, holiday_date, holiday_name, created_at")
    .order("holiday_date", { ascending: true })

  if (error) throw new Error(error.message || "Failed to load holidays.")
  return (data || []).map(mapHolidayRow)
}

export async function createHoliday(holidayDate, holidayName) {
  assertSupabaseConfigured()
  const date = String(holidayDate || "").trim()
  const name = String(holidayName || "").trim()
  if (!date || !name) throw new Error("Holiday date and holiday name are required.")

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw new Error(sessionError.message || "Unable to read auth session.")
  const createdBy = sessionData?.session?.user?.id || null

  const { data, error } = await supabase
    .from("holidays")
    .upsert({
      holiday_date: date,
      holiday_name: name,
      created_by: createdBy,
    }, { onConflict: "holiday_date" })
    .select("id, holiday_date, holiday_name, created_at")
    .single()

  if (error) throw new Error(error.message || "Failed to save holiday.")
  return mapHolidayRow(data)
}

export async function updateHoliday(holidayId, holidayDate, holidayName) {
  assertSupabaseConfigured()
  const id = String(holidayId || "").trim()
  const date = String(holidayDate || "").trim()
  const name = String(holidayName || "").trim()
  if (!id) throw new Error("Missing holiday ID.")
  if (!date || !name) throw new Error("Holiday date and holiday name are required.")

  const { data, error } = await supabase
    .from("holidays")
    .update({
      holiday_date: date,
      holiday_name: name,
    })
    .eq("id", id)
    .select("id, holiday_date, holiday_name, created_at")
    .maybeSingle()

  if (error) throw new Error(error.message || "Failed to update holiday.")
  if (!data) throw new Error("Holiday not found.")
  return mapHolidayRow(data)
}

export async function deleteHoliday(holidayId) {
  assertSupabaseConfigured()
  const id = String(holidayId || "").trim()
  if (!id) throw new Error("Missing holiday ID.")

  const { error } = await supabase
    .from("holidays")
    .delete()
    .eq("id", id)

  if (error) throw new Error(error.message || "Failed to delete holiday.")
}
