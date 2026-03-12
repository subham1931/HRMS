import { assertSupabaseConfigured, supabase } from "../lib/supabaseClient"

function to12hLabel(iso) {
  if (!iso) return "--"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "--"
  return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).format(d)
}

function deriveStatus(record) {
  if (record?.check_in_at) return record.status || "On Time"
  return "Absent"
}

export async function listAttendanceRowsByDate(attendanceDate) {
  assertSupabaseConfigured()
  const date = String(attendanceDate || "").trim()
  if (!date) return []

  const [{ data: employees, error: empError }, { data: records, error: attError }] = await Promise.all([
    supabase
      .from("employees")
      .select("employee_code, full_name, department, designation, office_location, profile_image_url")
      .eq("employment_status", "Active")
      .order("full_name", { ascending: true }),
    supabase
      .from("attendance_records")
      .select("employee_code, check_in_at, check_out_at, status, overtime_minutes")
      .eq("attendance_date", date),
  ])

  if (empError) throw new Error(empError.message || "Failed to load employees.")
  if (attError) throw new Error(attError.message || "Failed to load attendance.")

  const recordByCode = new Map((records || []).map((item) => [item.employee_code, item]))
  return (employees || []).map((emp) => {
    const record = recordByCode.get(emp.employee_code)
    return [
      emp.full_name || "Employee",
      emp.department || "General",
      emp.designation || "-",
      emp.office_location || "-",
      to12hLabel(record?.check_in_at || null),
      to12hLabel(record?.check_out_at || null),
      deriveStatus(record),
      emp.profile_image_url || "",
      emp.employee_code || "",
      Number(record?.overtime_minutes || 0),
    ]
  })
}

export async function listAttendanceRecordsInRange(startDate, endDate) {
  assertSupabaseConfigured()
  const start = String(startDate || "").trim()
  const end = String(endDate || "").trim()
  if (!start || !end) return []

  const { data, error } = await supabase
    .from("attendance_records")
    .select("attendance_date, check_in_at, status")
    .gte("attendance_date", start)
    .lte("attendance_date", end)

  if (error) throw new Error(error.message || "Failed to load attendance range.")
  return data || []
}

export async function listEmployeeAttendanceRecordsInRange(employeeCode, startDate, endDate) {
  assertSupabaseConfigured()
  const code = String(employeeCode || "").trim()
  const start = String(startDate || "").trim()
  const end = String(endDate || "").trim()
  if (!code || !start || !end) return []

  const { data, error } = await supabase
    .from("attendance_records")
    .select("attendance_date, check_in_at, check_out_at, work_minutes, status")
    .eq("employee_code", code)
    .gte("attendance_date", start)
    .lte("attendance_date", end)
    .order("attendance_date", { ascending: true })

  if (error) throw new Error(error.message || "Failed to load employee attendance.")
  return data || []
}
