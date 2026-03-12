import { assertSupabaseConfigured, supabase } from "../lib/supabaseClient"

const DEFAULT_STATUS = "Pending"

function mapLeaveRowToUi(row) {
  return {
    id: row.id || "",
    employeeCode: row.employee_code || "",
    leaveTitle: row.leave_title || "",
    leaveType: row.leave_type || "Casual Leave",
    startDate: row.start_date || "",
    endDate: row.end_date || "",
    isHalfDay: Boolean(row.is_half_day),
    reason: row.reason || "",
    attachmentUrl: row.attachment_url || "",
    status: row.status || DEFAULT_STATUS,
    reviewedBy: row.reviewed_by || null,
    reviewedAt: row.reviewed_at || null,
    reviewNote: row.review_note || "",
    source: row.source || "mobile-app",
    createdAt: row.created_at || null,
    updatedAt: row.updated_at || null,
  }
}

export async function listLeaveRequests() {
  assertSupabaseConfigured()

  const { data, error } = await supabase
    .from("leave_requests")
    .select(`
      id,
      employee_code,
      leave_title,
      leave_type,
      start_date,
      end_date,
      is_half_day,
      reason,
      attachment_url,
      status,
      reviewed_by,
      reviewed_at,
      review_note,
      source,
      created_at,
      updated_at,
      employees:employee_code (
        employee_code,
        full_name,
        department,
        designation,
        profile_image_url
      )
    `)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message || "Failed to load leave requests.")

  return (data || []).map((row) => {
    const base = mapLeaveRowToUi(row)
    const employee = Array.isArray(row.employees) ? row.employees[0] : row.employees
    return {
      ...base,
      employeeName: employee?.full_name || "Employee",
      employeeId: employee?.employee_code || base.employeeCode,
      department: employee?.department || "General",
      jobTitle: employee?.designation || "Team Member",
      avatar: employee?.profile_image_url || "",
    }
  })
}

export async function updateLeaveRequestStatus(leaveRequestId, nextStatus, reviewNote = "") {
  assertSupabaseConfigured()
  const id = String(leaveRequestId || "").trim()
  const status = String(nextStatus || "").trim()
  if (!id) throw new Error("Missing leave request ID.")
  if (!["Approved", "Rejected", "Pending", "Canceled"].includes(status)) {
    throw new Error("Invalid leave status.")
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw new Error(sessionError.message || "Unable to read auth session.")
  const reviewerId = sessionData?.session?.user?.id || null

  const { data, error } = await supabase
    .from("leave_requests")
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: ["Approved", "Rejected"].includes(status) ? new Date().toISOString() : null,
      review_note: reviewNote || "",
    })
    .eq("id", id)
    .select(`
      id,
      employee_code,
      leave_title,
      leave_type,
      start_date,
      end_date,
      is_half_day,
      reason,
      attachment_url,
      status,
      reviewed_by,
      reviewed_at,
      review_note,
      source,
      created_at,
      updated_at
    `)
    .maybeSingle()

  if (error) throw new Error(error.message || "Failed to update leave request.")
  if (!data) throw new Error("Leave request not found.")

  return mapLeaveRowToUi(data)
}
