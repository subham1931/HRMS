import { useEffect, useMemo, useState } from "react"
import { Pencil, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react"
import { CiUser } from "react-icons/ci"
import EmployeeDetailsView from "../components/EmployeeDetailsView"
import EmployeeFilterModal from "../components/EmployeeFilterModal"
import EmployeeOnboardingModal from "../components/EmployeeOnboardingModal"
import { readLocalStorage, writeLocalStorage } from "../utils/localStorage"

const EMPLOYEES_STORAGE_KEY = "hrms_employees"
const DEPARTMENT_NAMES_STORAGE_KEY = "hrms_department_names"
const defaultEmployees = []
const normalizeEmployees = (rows) => rows

function EmployeesPage() {
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({ departments: [], type: "" })
  const [employees, setEmployees] = useState(() => normalizeEmployees(readLocalStorage(EMPLOYEES_STORAGE_KEY, defaultEmployees)))
  const [departmentNames] = useState(() => readLocalStorage(DEPARTMENT_NAMES_STORAGE_KEY, []))
  const [toastMessage, setToastMessage] = useState("")

  useEffect(() => {
    writeLocalStorage(EMPLOYEES_STORAGE_KEY, employees)
  }, [employees])

  const filteredRows = useMemo(() => {
    return employees.filter((employee) => {
      const { name, employeeId, department, designation, type } = employee
      const mappedType = type === "Remote" ? "Work from Home" : type

      const matchesSearch =
        searchQuery.trim() === "" ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDepartment = filters.departments.length === 0 || filters.departments.includes(department)
      const matchesType = filters.type === "" || filters.type === mappedType

      return matchesSearch && matchesDepartment && matchesType
    })
  }, [employees, filters, searchQuery])

  const selectedEmployee = useMemo(
    () =>
      filteredRows.find((item) => item.employeeId === selectedEmployeeId) ||
      employees.find((item) => item.employeeId === selectedEmployeeId),
    [employees, filteredRows, selectedEmployeeId],
  )
  const departmentOptions = useMemo(() => {
    const fromEmployees = employees
      .map((item) => (item.department || "").trim())
      .filter((value) => value !== "")
    const fromDepartmentPage = (departmentNames || []).map((item) => (item || "").trim()).filter((value) => value !== "")
    return Array.from(new Set([...fromDepartmentPage, ...fromEmployees]))
  }, [departmentNames, employees])

  const addEmployee = (payload) => {
    setEmployees((prev) => {
      const uniqueEmployeeId = prev.some((item) => item.employeeId === payload.employeeId) ? `EMP${Date.now().toString().slice(-6)}` : payload.employeeId
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
      return [nextItem, ...prev]
    })
    setToastMessage("Employee added successfully")
    window.setTimeout(() => setToastMessage(""), 2200)
  }

  const editEmployeeProfile = (employeeId) => {
    const current = employees.find((item) => item.employeeId === employeeId)
    if (!current) return
    setEditingEmployee(current)
    setShowAddEmployeeModal(true)
  }

  const saveEditedEmployee = (payload) => {
    const originalId = editingEmployee?.employeeId
    if (!originalId) return
    const currentEmployee = employees.find((item) => item.employeeId === originalId)
    if (!currentEmployee) return
    const updatedEmployee = {
      ...currentEmployee,
      ...payload,
      id: payload.employeeId,
      employeeId: payload.employeeId,
    }
    setEmployees((prev) =>
      prev.map((item) => (item.employeeId === originalId ? updatedEmployee : item)),
    )
    if (selectedEmployeeId === originalId) {
      setSelectedEmployeeId(payload.employeeId)
    }
    setEditingEmployee(null)
    setShowAddEmployeeModal(false)
  }

  const deleteEmployee = (employeeId) => {
    if (!window.confirm("Delete this employee?")) return
    setEmployees((prev) => prev.filter((item) => item.employeeId !== employeeId))
    if (selectedEmployeeId === employeeId) {
      setSelectedEmployeeId("")
    }
  }

  return (
    <>
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        {!selectedEmployee && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-full max-w-[320px]">
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-3 text-sm outline-none focus:border-violet-300"
                placeholder="Search"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingEmployee(null)
                  setShowAddEmployeeModal(true)
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white"
              >
                <Plus size={16} />
                Add New Employee
              </button>
              <button
                type="button"
                onClick={() => setShowFilterModal(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                <SlidersHorizontal size={16} />
                Filter
              </button>
            </div>
          </div>
        )}

        {selectedEmployee ? (
          <EmployeeDetailsView
            employee={selectedEmployee}
            onBack={() => {
              setSelectedEmployeeId("")
            }}
            onEditProfile={() => editEmployeeProfile(selectedEmployee.employeeId)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left">
              <thead className="border-b border-slate-100 text-sm text-slate-400">
                <tr>
                  <th className="pb-4 font-medium">Employee Name</th>
                  <th className="pb-4 font-medium">Employee ID</th>
                  <th className="pb-4 font-medium">Department</th>
                  <th className="pb-4 font-medium">Designation</th>
                  <th className="pb-4 font-medium">Type</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredRows.map((row) => (
                  <tr
                    key={`${row.name}-${row.employeeId}`}
                    onClick={() => {
                      setSelectedEmployeeId(row.employeeId)
                    }}
                    className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-3.5 font-medium text-slate-800">
                      <span className="flex items-center gap-3">
                        {row.profileImage ? (
                          <img src={row.profileImage} alt={row.name} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <CiUser size={24} />
                          </span>
                        )}
                        {row.name}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-700">{row.employeeId}</td>
                    <td className="py-3.5 text-slate-700">{row.department}</td>
                    <td className="py-3.5 text-slate-700">{row.designation}</td>
                    <td className="py-3.5 text-slate-700">{row.type}</td>
                    <td className="py-3.5">
                      <span className="rounded bg-violet-50 px-2 py-1 text-xs font-medium text-violet-500">{row.status}</span>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={(event) => {
                          event.stopPropagation()
                          editEmployeeProfile(row.employeeId)
                        }} className="text-slate-500 transition-colors hover:text-violet-600">
                          <Pencil size={15} />
                        </button>
                        <button type="button" onClick={(event) => {
                          event.stopPropagation()
                          deleteEmployee(row.employeeId)
                        }} className="text-slate-500 transition-colors hover:text-rose-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
                      No employees match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <EmployeeOnboardingModal
        open={showAddEmployeeModal}
        initialData={editingEmployee}
        departmentOptions={departmentOptions}
        onClose={() => {
          setShowAddEmployeeModal(false)
          setEditingEmployee(null)
        }}
        onAddEmployee={addEmployee}
        onEditEmployee={saveEditedEmployee}
      />
      <EmployeeFilterModal
        open={showFilterModal}
        initialFilters={filters}
        onClose={() => setShowFilterModal(false)}
        onApply={(nextFilters) => {
          setFilters(nextFilters)
          setShowFilterModal(false)
        }}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toastMessage}
        </div>
      )}
    </>
  )
}

export default EmployeesPage
