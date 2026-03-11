import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import RegisterEmployeeForm from "../components/RegisterEmployeeForm"
import { createEmployeeRecord } from "../services/employees"
import { createDepartment, listDepartments } from "../services/departments"

function AddEmployeePage() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [departmentOptions, setDepartmentOptions] = useState([])

  useEffect(() => {
    let isMounted = true

    async function loadDepartments() {
      try {
        const departments = await listDepartments()
        if (!isMounted) return
        setDepartmentOptions(departments)
      } catch {
        if (!isMounted) return
        setDepartmentOptions([])
      }
    }

    loadDepartments()
    return () => {
      isMounted = false
    }
  }, [])

  const handleAddEmployee = async (payload) => {
    try {
      setIsSubmitting(true)
      setSubmitError("")
      await createEmployeeRecord(payload)
      navigate("/employees")
    } catch (error) {
      setSubmitError(error?.message || "Unable to create employee right now.")
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleAddDepartment = async (departmentName) => {
    const normalized = (departmentName || "").trim()
    if (!normalized) return
    try {
      const savedName = await createDepartment(normalized)
      setDepartmentOptions((prev) => (
        prev.some((item) => item.toLowerCase() === savedName.toLowerCase()) ? prev : [...prev, savedName].sort()
      ))
    } catch (error) {
      setSubmitError(error?.message || "Unable to create department right now.")
    }
  }

  return (
    <RegisterEmployeeForm
      departmentOptions={departmentOptions}
      onCancel={() => navigate("/employees")}
      onSubmit={handleAddEmployee}
      onAddDepartment={handleAddDepartment}
      submitError={submitError}
      isSubmitting={isSubmitting}
    />
  )
}

export default AddEmployeePage
