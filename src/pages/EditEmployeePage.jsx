import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import RegisterEmployeeForm from "../components/RegisterEmployeeForm"
import { listDepartments } from "../services/departments"
import { getEmployeeRecordByCode, updateEmployeeRecord } from "../services/employees"
import { createOffice, listOffices } from "../services/offices"

function EditEmployeePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const employeeId = location.state?.employeeId || ""
  const [employee, setEmployee] = useState(location.state?.employee || null)
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [officeOptions, setOfficeOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function bootstrap() {
      if (!employeeId) {
        if (!isMounted) return
        setEmployee(null)
        setLoadError("This profile cannot be edited right now. Please open it again from Employees list.")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setLoadError("")
        const [departments, offices, employeeRecord] = await Promise.all([
          listDepartments().catch(() => []),
          listOffices().catch(() => []),
          getEmployeeRecordByCode(employeeId),
        ])
        if (!isMounted) return

        const mergedDepartments = Array.from(new Set([
          ...departments,
          (employeeRecord?.department || "").trim(),
        ].filter(Boolean))).sort()
        const mergedOffices = Array.from(new Set([
          ...offices,
          (employeeRecord?.officeLocation || "").trim(),
        ].filter(Boolean))).sort()

        setDepartmentOptions(mergedDepartments)
        setOfficeOptions(mergedOffices)
        setEmployee(employeeRecord)
        if (!employeeRecord) {
          setLoadError("This profile cannot be edited right now. Please open it again from Employees list.")
        }
      } catch (error) {
        if (!isMounted) return
        setEmployee(null)
        setDepartmentOptions([])
        setOfficeOptions([])
        setLoadError(error?.message || "Unable to load employee profile.")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    bootstrap()
    return () => {
      isMounted = false
    }
  }, [employeeId])

  const handleAddDepartment = (departmentName) => {
    const normalized = (departmentName || "").trim()
    if (!normalized) return
    setDepartmentOptions((prev) => (prev.some((item) => item.toLowerCase() === normalized.toLowerCase()) ? prev : [...prev, normalized]))
  }
  const handleAddOffice = async (officeName) => {
    const normalized = (officeName || "").trim()
    if (!normalized) return
    try {
      const savedName = await createOffice(normalized)
      setOfficeOptions((prev) => (
        prev.some((item) => item.toLowerCase() === savedName.toLowerCase()) ? prev : [...prev, savedName].sort()
      ))
    } catch (error) {
      setSubmitError(error?.message || "Unable to create office right now.")
    }
  }

  const handleUpdateEmployee = async (payload) => {
    if (!employee) return
    try {
      setIsSubmitting(true)
      setSubmitError("")
      const updated = await updateEmployeeRecord(employee.employeeId, payload)
      navigate("/employees", { state: { selectedEmployeeId: updated.employeeId } })
    } catch (error) {
      setSubmitError(error?.message || "Unable to update employee right now.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Loading employee profile...</p>
      </div>
    )
  }

  if (!employee || loadError) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-800">Employee not found</h1>
        <p className="mt-2 text-sm text-slate-500">{loadError || "This profile cannot be edited right now. Please open it again from Employees list."}</p>
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
      officeOptions={officeOptions}
      onCancel={() => navigate("/employees")}
      onSubmit={handleUpdateEmployee}
      onAddDepartment={handleAddDepartment}
      onAddOffice={handleAddOffice}
      submitError={submitError}
      isSubmitting={isSubmitting}
    />
  )
}

export default EditEmployeePage
