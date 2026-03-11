import { assertSupabaseConfigured, supabase } from "../lib/supabaseClient"

function buildEmployeeCode(seed = "") {
  const base = String(seed || "").trim()
  if (base) return base
  return `EMP${Date.now().toString().slice(-6)}`
}

function toNullableDate(value) {
  const raw = String(value || "").trim()
  return raw || null
}

function toEmployeeInsertRow(payload, userId, employeeCode) {
  return {
    employee_code: employeeCode,
    full_name: payload.name || "New Employee",
    first_name: payload.firstName || "",
    last_name: payload.lastName || "",
    department: payload.department || "",
    designation: payload.designation || "",
    employment_type: payload.employmentType || "",
    work_model: payload.type || "",
    employment_status: payload.status || "Active",
    mobile: payload.mobile || "",
    personal_email: payload.email || "",
    office_email: payload.officeEmail || "",
    username: payload.userName || "",
    password: payload.generatedPassword || "",
    dob: toNullableDate(payload.dob),
    joining_date: toNullableDate(payload.joiningDate),
    gender: payload.gender || "",
    address: payload.address || "",
    city: payload.city || "",
    state: payload.state || "",
    zip_code: payload.zipCode || "",
    office_location: payload.officeLocation || "",
    salary_text: payload.salary || "",
    bank_name: payload.bankName || "",
    bank_account: payload.bankAccount || "",
    profile_image_url: payload.profileImage || "",
    documents: payload.documents || {},
    created_by: userId || null,
  }
}

async function employeeCodeExists(employeeCode) {
  const { data, error } = await supabase
    .from("employees")
    .select("id")
    .eq("employee_code", employeeCode)
    .maybeSingle()
  if (error) throw new Error(error.message || "Unable to validate employee code.")
  return Boolean(data)
}

async function resolveUniqueEmployeeCode(initialCode) {
  const preferred = buildEmployeeCode(initialCode)
  if (!(await employeeCodeExists(preferred))) return preferred

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `EMP${Date.now().toString().slice(-6)}${attempt}`
    if (!(await employeeCodeExists(candidate))) return candidate
  }
  throw new Error("Unable to generate a unique employee code. Please retry.")
}

export async function createEmployeeRecord(payload) {
  assertSupabaseConfigured()

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw new Error(sessionError.message || "Unable to read auth session.")
  const userId = sessionData?.session?.user?.id || null

  const employeeCode = await resolveUniqueEmployeeCode(payload.employeeId)
  const row = toEmployeeInsertRow(payload, userId, employeeCode)

  const { data, error } = await supabase
    .from("employees")
    .insert(row)
    .select("id, employee_code")
    .single()

  if (error) throw new Error(error.message || "Failed to create employee.")
  return {
    id: data.id,
    employeeId: data.employee_code,
  }
}

function mapEmployeeRowToUi(row) {
  return {
    id: row.id || row.employee_code || "",
    name: row.full_name || "Employee",
    employeeId: row.employee_code || "",
    department: row.department || "",
    designation: row.designation || "",
    type: row.work_model || "",
    status: row.employment_status || "Active",
    mobile: row.mobile || "",
    email: row.personal_email || "",
    dob: row.dob || "",
    gender: row.gender || "",
    address: row.address || "",
    city: row.city || "",
    state: row.state || "",
    zipCode: row.zip_code || "",
    userName: row.username || "",
    officeEmail: row.office_email || "",
    workingDays: "",
    joiningDate: row.joining_date || "",
    officeLocation: row.office_location || "",
    generatedPassword: row.password || "",
    salary: row.salary_text || "",
    bankName: row.bank_name || "",
    bankAccount: row.bank_account || "",
    employmentType: row.employment_type || "",
    profileImage: row.profile_image_url || "",
    documents: row.documents || {},
  }
}

export async function listEmployeeRecords() {
  assertSupabaseConfigured()
  const { data, error } = await supabase
    .from("employees")
    .select(`
      id,
      employee_code,
      full_name,
      department,
      designation,
      employment_type,
      work_model,
      employment_status,
      mobile,
      personal_email,
      office_email,
      username,
      password,
      dob,
      joining_date,
      gender,
      address,
      city,
      state,
      zip_code,
      office_location,
      salary_text,
      bank_name,
      bank_account,
      profile_image_url,
      documents
    `)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message || "Failed to load employees.")
  return (data || []).map(mapEmployeeRowToUi)
}

export async function getEmployeeRecordByCode(employeeCode) {
  assertSupabaseConfigured()
  const code = String(employeeCode || "").trim()
  if (!code) return null

  const { data, error } = await supabase
    .from("employees")
    .select(`
      id,
      employee_code,
      full_name,
      first_name,
      last_name,
      department,
      designation,
      employment_type,
      work_model,
      employment_status,
      mobile,
      personal_email,
      office_email,
      username,
      password,
      dob,
      joining_date,
      gender,
      address,
      city,
      state,
      zip_code,
      office_location,
      salary_text,
      bank_name,
      bank_account,
      profile_image_url,
      documents
    `)
    .eq("employee_code", code)
    .maybeSingle()

  if (error) throw new Error(error.message || "Failed to load employee.")
  return data ? mapEmployeeRowToUi(data) : null
}

export async function updateEmployeeRecord(employeeCode, payload) {
  assertSupabaseConfigured()
  const code = String(employeeCode || "").trim()
  if (!code) throw new Error("Missing employee ID for update.")

  const row = toEmployeeInsertRow(payload, null, code)
  delete row.created_by
  delete row.employee_code

  const { data, error } = await supabase
    .from("employees")
    .update(row)
    .eq("employee_code", code)
    .select("id, employee_code")
    .maybeSingle()

  if (error) throw new Error(error.message || "Failed to update employee.")
  if (!data) throw new Error("Employee not found.")

  return {
    id: data.id,
    employeeId: data.employee_code,
  }
}
