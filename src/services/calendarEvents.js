import { assertSupabaseConfigured, supabase } from "../lib/supabaseClient"

function mapRow(row) {
  return {
    id: row.id || "",
    eventDate: row.event_date || "",
    eventTitle: row.event_title || "",
    eventType: row.event_type || "meeting",
  }
}

export async function listCalendarEventsInRange(startDate, endDate) {
  assertSupabaseConfigured()
  const start = String(startDate || "").trim()
  const end = String(endDate || "").trim()
  if (!start || !end) return []

  const { data, error } = await supabase
    .from("calendar_events")
    .select("id, event_date, event_title, event_type")
    .gte("event_date", start)
    .lte("event_date", end)
    .order("event_date", { ascending: true })

  if (error) throw new Error(error.message || "Failed to load calendar events.")
  return (data || []).map(mapRow)
}

export async function createCalendarEvent(eventDate, eventTitle, eventType = "meeting") {
  assertSupabaseConfigured()
  const date = String(eventDate || "").trim()
  const title = String(eventTitle || "").trim()
  const type = String(eventType || "meeting").trim().toLowerCase()
  if (!date || !title) throw new Error("Event date and title are required.")
  if (!["meeting", "task"].includes(type)) throw new Error("Invalid event type.")

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw new Error(sessionError.message || "Unable to read auth session.")

  const { data, error } = await supabase
    .from("calendar_events")
    .insert({
      event_date: date,
      event_title: title,
      event_type: type,
      created_by: sessionData?.session?.user?.id || null,
    })
    .select("id, event_date, event_title, event_type")
    .single()

  if (error) throw new Error(error.message || "Failed to create calendar event.")
  return mapRow(data)
}
