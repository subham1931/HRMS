import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import RegisterEmployeeForm from "../components/RegisterEmployeeForm"
import { createEmployeeRecord } from "../services/employees"
import { createDepartment, listDepartments } from "../services/departments"
import { createOffice, listOffices } from "../services/offices"

function AddEmployeePage() {
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [departmentOptions, setDepartmentOptions] = useState([])
  const [officeOptions, setOfficeOptions] = useState([])

  useEffect(() => {
    let isMounted = true

    async function loadMasterData() {
      try {
        const [departments, offices] = await Promise.all([
          listDepartments(),
          listOffices(),
        ])
        if (!isMounted) return
        setDepartmentOptions(departments)
        setOfficeOptions(offices)
      } catch {
        if (!isMounted) return
        setDepartmentOptions([])
        setOfficeOptions([])
      }
    }

    loadMasterData()
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

  return (
    <RegisterEmployeeForm
      departmentOptions={departmentOptions}
      officeOptions={officeOptions}
      onCancel={() => navigate("/employees")}
      onSubmit={handleAddEmployee}
      onAddDepartment={handleAddDepartment}
      onAddOffice={handleAddOffice}
      submitError={submitError}
      isSubmitting={isSubmitting}
    />
  )
}

export default AddEmployeePage
