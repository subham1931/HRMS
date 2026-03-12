import { assertSupabaseConfigured, supabase } from "../lib/supabaseClient"

function toMonthStart(dateObj = new Date()) {
  const y = dateObj.getFullYear()
  const m = `${dateObj.getMonth() + 1}`.padStart(2, "0")
  return `${y}-${m}-01`
}

function parseAmount(value) {
  const raw = String(value || "").replace(/[^0-9.]/g, "")
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

function money(value) {
  const amount = Number(value || 0)
  const formatted = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(amount))
  return `₹${formatted}`
}

export async function listPayrollRowsForMonth(targetMonth = toMonthStart()) {
  assertSupabaseConfigured()
  const month = String(targetMonth || "").trim() || toMonthStart()

  const [{ data: employees, error: employeesError }, { data: records, error: recordsError }] = await Promise.all([
    supabase
      .from("employees")
      .select("employee_code, full_name, salary_text, profile_image_url, employment_status")
      .order("full_name", { ascending: true }),
    supabase
      .from("payroll_records")
      .select("employee_code, ctc_amount, monthly_salary_amount, deduction_amount, payment_status")
      .eq("payroll_month", month),
  ])

  if (employeesError) throw new Error(employeesError.message || "Failed to load employees for payroll.")
  if (recordsError) throw new Error(recordsError.message || "Failed to load payroll records.")

  const payrollByCode = new Map((records || []).map((item) => [item.employee_code, item]))

  return (employees || [])
    .filter((employee) => String(employee.employment_status || "").toLowerCase() !== "inactive")
    .map((employee) => {
      const record = payrollByCode.get(employee.employee_code)
      const salaryFallback = parseAmount(employee.salary_text)
      const monthlySalary = Number(record?.monthly_salary_amount ?? salaryFallback)
      const ctc = Number(record?.ctc_amount ?? (salaryFallback * 12))
      const deduction = Number(record?.deduction_amount ?? 0)
      const status = record?.payment_status || "Pending"

      return {
        employeeCode: employee.employee_code || "",
        employeeName: employee.full_name || "Employee",
        ctc: money(ctc),
        salaryPerMonth: money(monthlySalary),
        deduction: deduction > 0 ? money(deduction) : "-",
        status,
        profileImage: employee.profile_image_url || "",
      }
    })
}
