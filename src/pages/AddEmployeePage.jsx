import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import RegisterEmployeeForm from "../components/RegisterEmployeeForm"
import { readLocalStorage, writeLocalStorage } from "../utils/localStorage"

const EMPLOYEES_STORAGE_KEY = "hrms_employees"
const DEPARTMENT_NAMES_STORAGE_KEY = "hrms_department_names"

function AddEmployeePage() {
  const navigate = useNavigate()

  const [departmentOptions, setDepartmentOptions] = useState(() => {
    const employees = readLocalStorage(EMPLOYEES_STORAGE_KEY, [])
    const departmentNames = readLocalStorage(DEPARTMENT_NAMES_STORAGE_KEY, [])
    const fromEmployees = employees
      .map((item) => (item.department || "").trim())
      .filter((value) => value !== "")
    const fromDepartmentPage = (departmentNames || []).map((item) => (item || "").trim()).filter((value) => value !== "")
    return Array.from(new Set([...fromDepartmentPage, ...fromEmployees]))
  })

  const handleAddEmployee = (payload) => {
    const employees = readLocalStorage(EMPLOYEES_STORAGE_KEY, [])
    const uniqueEmployeeId = employees.some((item) => item.employeeId === payload.employeeId)
      ? `EMP${Date.now().toString().slice(-6)}`
      : payload.employeeId
    const nextItem = {
      id: uniqueEmployeeId,
      name: payload.name,
      employeeId: uniqueEmployeeId,
      department: payload.department || "Design",
      designation: payload.designation || "UI/UX Designer",
      type: payload.type || "Office",
      status: payload.status || "Permanent",
      mobile: payload.mobile || "",
      email: payload.email || "",
      dob: payload.dob || "",
      maritalStatus: payload.maritalStatus || "",
      gender: payload.gender || "",
      nationality: payload.nationality || "",
      address: payload.address || "",
      city: payload.city || "",
      state: payload.state || "",
      zipCode: payload.zipCode || "",
      userName: payload.userName || "",
      officeEmail: payload.officeEmail || "",
      workingDays: payload.workingDays || "",
      joiningDate: payload.joiningDate || "",
      officeLocation: payload.officeLocation || "",
      generatedPassword: payload.generatedPassword || "",
      profileImage: payload.profileImage || "",
      documents: payload.documents || {},
    }

    writeLocalStorage(EMPLOYEES_STORAGE_KEY, [nextItem, ...employees])
    navigate("/employees")
  }
  const handleAddDepartment = (departmentName) => {
    const normalized = (departmentName || "").trim()
    if (!normalized) return
    const current = readLocalStorage(DEPARTMENT_NAMES_STORAGE_KEY, [])
    const exists = current.some((item) => item.toLowerCase() === normalized.toLowerCase())
    const next = exists ? current : [...current, normalized]
    writeLocalStorage(DEPARTMENT_NAMES_STORAGE_KEY, next)
    setDepartmentOptions((prev) => (prev.some((item) => item.toLowerCase() === normalized.toLowerCase()) ? prev : [...prev, normalized]))
  }

  return (
    <RegisterEmployeeForm
      departmentOptions={departmentOptions}
      onCancel={() => navigate("/employees")}
      onSubmit={handleAddEmployee}
      onAddDepartment={handleAddDepartment}
    />
  )
}

export default AddEmployeePage
