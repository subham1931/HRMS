import { useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import RegisterEmployeeForm from "../components/RegisterEmployeeForm"

function EditEmployeePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const employeeId = location.state?.employeeId || ""
  const [employees] = useState([])

  const [departmentOptions, setDepartmentOptions] = useState(() => {
    const departmentNames = []
    const fromEmployees = employees
      .map((item) => (item.department || "").trim())
      .filter((value) => value !== "")
    const fromDepartmentPage = (departmentNames || []).map((item) => (item || "").trim()).filter((value) => value !== "")
    return Array.from(new Set([...fromDepartmentPage, ...fromEmployees]))
  })

  const employee = useMemo(
    () => employees.find((item) => item.employeeId === employeeId) || null,
    [employeeId, employees],
  )

  const handleAddDepartment = (departmentName) => {
    const normalized = (departmentName || "").trim()
    if (!normalized) return
    setDepartmentOptions((prev) => (prev.some((item) => item.toLowerCase() === normalized.toLowerCase()) ? prev : [...prev, normalized]))
  }

  const handleUpdateEmployee = (payload) => {
    if (!employee) return
    const nextId = payload.employeeId || employee.employeeId
    navigate("/employees", { state: { selectedEmployeeId: nextId } })
  }

  if (!employee) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-800">Employee not found</h1>
        <p className="mt-2 text-sm text-slate-500">This profile cannot be edited right now. Please open it again from Employees list.</p>
        <button
          type="button"
          onClick={() => navigate("/employees")}
          className="mt-4 rounded-xl bg-[#53c4ae] px-4 py-2 text-sm font-medium text-white"
        >
          Back to Employees
        </button>
      </div>
    )
  }

  return (
    <RegisterEmployeeForm
      initialData={employee}
      departmentOptions={departmentOptions}
      onCancel={() => navigate("/employees")}
      onSubmit={handleUpdateEmployee}
      onAddDepartment={handleAddDepartment}
    />
  )
}

export default EditEmployeePage
