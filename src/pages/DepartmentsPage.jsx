import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react"
import EmployeeDetailsView from "../components/EmployeeDetailsView"
import EmployeeFilterModal from "../components/EmployeeFilterModal"
import EmployeeOnboardingModal from "../components/EmployeeOnboardingModal"
import { readLocalStorage, writeLocalStorage } from "../utils/localStorage"

const EMPLOYEES_STORAGE_KEY = "hrms_employees"
const DEPARTMENT_NAMES_STORAGE_KEY = "hrms_department_names"

function DepartmentsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employees, setEmployees] = useState(() => readLocalStorage(EMPLOYEES_STORAGE_KEY, []))
  const [departmentNames, setDepartmentNames] = useState(() => readLocalStorage(DEPARTMENT_NAMES_STORAGE_KEY, []))
  const [showAddDepartmentEmployeeModal, setShowAddDepartmentEmployeeModal] = useState(false)
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false)
  const [newDepartmentName, setNewDepartmentName] = useState("")
  const [departmentError, setDepartmentError] = useState("")
  const [editingDepartmentEmployee, setEditingDepartmentEmployee] = useState(null)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filters, setFilters] = useState({ departments: [], type: "" })

  useEffect(() => {
    writeLocalStorage(EMPLOYEES_STORAGE_KEY, employees)
  }, [employees])
  useEffect(() => {
    writeLocalStorage(DEPARTMENT_NAMES_STORAGE_KEY, departmentNames)
  }, [departmentNames])

  const departments = useMemo(
    () => {
      const grouped = new Map()
      employees.forEach((employee) => {
        const deptName = (employee.department || "General").trim() || "General"
        if (!grouped.has(deptName)) grouped.set(deptName, [])
        grouped.get(deptName).push(employee)
      })
      departmentNames.forEach((departmentName) => {
        const trimmedName = (departmentName || "").trim()
        if (!trimmedName) return
        if (!grouped.has(trimmedName)) grouped.set(trimmedName, [])
      })

      return Array.from(grouped.entries()).map(([departmentName, departmentEmployees], departmentIndex) => ({
        name: `${departmentName} Department`,
        departmentKey: departmentName,
        members: `${departmentEmployees.length} Members`,
        employees: departmentEmployees.slice(0, 5).map((employee, index) => ({
          name: employee.name,
          role: employee.designation,
          avatar: employee.profileImage || `https://i.pravatar.cc/80?img=${(departmentIndex * 8 + index + 10) % 70}`,
        })),
      }))
    },
    [departmentNames, employees],
  )

  const tableRows = useMemo(() => {
    if (!selectedDepartment) return []
    const selectedDepartmentName = selectedDepartment.replace(" Department", "").trim()
    const rows = employees.filter((employee) => (employee.department || "").trim() === selectedDepartmentName)

    return rows.filter((row) => {
      const mappedType = row.type === "Remote" ? "Work from Home" : row.type
      const matchesSearch =
        searchQuery.trim() === "" ||
        [row.name, row.employeeId, row.designation, row.type].some((value) =>
          (value || "").toLowerCase().includes(searchQuery.toLowerCase()),
        ) ||
        selectedDepartmentName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDepartment = filters.departments.length === 0 || filters.departments.includes(selectedDepartmentName)
      const matchesType = filters.type === "" || filters.type === mappedType

      return matchesSearch && matchesDepartment && matchesType
    })
  }, [employees, searchQuery, selectedDepartment, filters])
  const departmentOptions = useMemo(() => {
    const fromEmployees = employees
      .map((item) => (item.department || "").trim())
      .filter((value) => value !== "")
    const fromCreated = (departmentNames || []).map((item) => (item || "").trim()).filter((value) => value !== "")
    return Array.from(new Set([...fromCreated, ...fromEmployees]))
  }, [departmentNames, employees])

  const addDepartmentEmployee = () => {
    if (!selectedDepartment) return
    setShowAddDepartmentEmployeeModal(true)
  }

  const addDepartmentEmployeeFromModal = (payload) => {
    if (!selectedDepartment) return
    const departmentName = selectedDepartment.replace(" Department", "").trim()
    setEmployees((prev) => {
      const uniqueEmployeeId = prev.some((item) => item.employeeId === payload.employeeId)
        ? `EMP${Date.now().toString().slice(-6)}`
        : payload.employeeId
      const nextEmployee = {
        id: uniqueEmployeeId,
        name: payload.name || "New Employee",
        employeeId: uniqueEmployeeId,
        department: departmentName,
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
      return [nextEmployee, ...prev]
    })
    setShowAddDepartmentEmployeeModal(false)
  }

  const addDepartment = () => {
    const normalized = newDepartmentName.trim().replace(/\s+Department$/i, "")
    if (!normalized) {
      setDepartmentError("Department name is required")
      return
    }
    if (departmentNames.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      setDepartmentError("Department already exists")
      return
    }
    setDepartmentNames((prev) => {
      return [...prev, normalized]
    })
    setNewDepartmentName("")
    setDepartmentError("")
    setShowAddDepartmentModal(false)
  }

  const openDepartmentEmployeeEditModal = (row) => {
    if (!selectedDepartment || !row) return
    const source = row
    const [firstName = "", ...rest] = (source.name || "").trim().split(/\s+/)
    const lastName = rest.join(" ")
    const safeOfficeEmail = `${firstName || "employee"}@mensou.com`.toLowerCase()
    const safePersonalEmail = `${(firstName || "employee").toLowerCase()}.${(lastName || "user").toLowerCase()}@example.com`
    setEditingDepartmentEmployee({
      originalEmployeeId: source.employeeId,
      data: {
        ...source,
        name: source.name,
        firstName,
        lastName,
        employeeId: source.employeeId,
        department: selectedDepartment.replace(" Department", "").trim(),
        designation: source.designation,
        type: source.type,
        officeEmail: safeOfficeEmail,
        email: safePersonalEmail,
        status: "Permanent",
      },
    })
  }

  const deleteDepartmentEmployee = (rowIndex) => {
    if (!selectedDepartment || !window.confirm("Delete this employee?")) return
    const current = tableRows[rowIndex]
    if (!current) return
    setEmployees((prev) => prev.filter((item) => item.employeeId !== current.employeeId))
  }

  const editDepartmentEmployeeProfile = () => {
    if (!selectedDepartment || !selectedEmployee) return
    openDepartmentEmployeeEditModal(selectedEmployee)
  }

  const saveEditedDepartmentEmployee = (payload) => {
    if (!selectedDepartment || !editingDepartmentEmployee) return
    const originalId = editingDepartmentEmployee.originalEmployeeId
    const updatedEmployee = {
      ...(employees.find((item) => item.employeeId === originalId) || {}),
      ...payload,
      id: payload.employeeId,
      employeeId: payload.employeeId,
    }
    setEmployees((prev) => prev.map((item) => (item.employeeId === originalId ? updatedEmployee : item)))
    setSelectedEmployee(updatedEmployee)
    setEditingDepartmentEmployee(null)
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      {selectedDepartment ? (
        <>
          {selectedEmployee ? (
            <EmployeeDetailsView
              employee={selectedEmployee}
              onBack={() => setSelectedEmployee(null)}
              onEditProfile={editDepartmentEmployeeProfile}
              backLabel={`Back to ${selectedDepartment}`}
            />
          ) : (
            <>
              <div className="mb-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDepartment("")
                    setSearchQuery("")
                    setSelectedEmployee(null)
                  }}
                  aria-label="Back to all departments"
                  className="inline-flex items-center rounded-lg px-1 py-1 text-violet-500"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-semibold text-slate-800">{selectedDepartment}</span>
              </div>

              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="relative w-full max-w-[330px]">
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
                    onClick={addDepartmentEmployee}
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

              <div className="overflow-x-auto">
                <table className="w-full min-w-[940px] text-left">
                  <thead className="border-b border-slate-100 text-sm text-slate-400">
                    <tr>
                      <th className="pb-4 font-medium">Employee ID</th>
                      <th className="pb-4 font-medium">Employee Name</th>
                      <th className="pb-4 font-medium">Designation</th>
                      <th className="pb-4 font-medium">Type</th>
                      <th className="pb-4 font-medium">Status</th>
                      <th className="pb-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {tableRows.map((row, rowIndex) => (
                      <tr
                        key={`${row.employeeId}-${row.name}`}
                        onClick={() => {
                          setSelectedEmployee(row)
                        }}
                        className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="py-3.5 text-slate-700">{row.employeeId}</td>
                        <td className="py-3.5 font-medium text-slate-800">
                          <span className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 rounded-full bg-slate-200" />
                            {row.name}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-700">{row.designation}</td>
                        <td className="py-3.5 text-slate-700">{row.type}</td>
                        <td className="py-3.5">
                          <span className="rounded bg-violet-50 px-2 py-1 text-xs font-medium text-violet-500">Permanent</span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2 text-slate-500">
                            <button type="button" onClick={(event) => event.stopPropagation()}>
                              <Eye size={15} />
                            </button>
                            <button type="button" onClick={(event) => {
                              event.stopPropagation()
                              openDepartmentEmployeeEditModal(row)
                            }}>
                              <Pencil size={15} />
                            </button>
                            <button type="button" onClick={(event) => {
                              event.stopPropagation()
                              deleteDepartmentEmployee(rowIndex)
                            }}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {tableRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                          No employees found for this department.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-[330px]">
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-3 text-sm outline-none focus:border-violet-300"
                placeholder="Search"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setDepartmentError("")
                setNewDepartmentName("")
                setShowAddDepartmentModal(true)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white"
            >
              <Plus size={16} />
              Add Department
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {departments.map((department) => (
              <section key={department.name} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-[16px] font-semibold leading-[1.1] text-slate-900">{department.name}</h3>
                    <p className="mt-1 text-[12px] leading-tight text-slate-400">{department.members}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDepartment(department.name)}
                    className="mt-1 text-[14px] font-medium text-violet-500"
                  >
                    View All
                  </button>
                </div>
                <div className="mb-3 h-px w-full bg-slate-200" />

                <div className="space-y-2">
                  {department.employees.map((employee) => (
                    <div key={employee.name} className="flex items-center justify-between rounded-lg py-1.5">
                      <div className="flex items-center gap-3">
                        <img src={employee.avatar} alt={employee.name} className="h-11 w-11 rounded-full object-cover" />
                        <div>
                          <p className="text-[14px] font-medium leading-tight text-slate-800">{employee.name}</p>
                          <p className="mt-0.5 text-[12px] leading-tight text-slate-400">{employee.role}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-700" />
                    </div>
                  ))}
                </div>
              </section>
            ))}
            {departments.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 lg:col-span-2">
                No departments available from employees data.
              </div>
            )}
          </div>
        </>
      )}

      <EmployeeFilterModal
        open={showFilterModal}
        initialFilters={filters}
        onClose={() => setShowFilterModal(false)}
        onApply={(nextFilters) => {
          setFilters(nextFilters)
          setShowFilterModal(false)
        }}
      />
      <EmployeeOnboardingModal
        open={Boolean(editingDepartmentEmployee)}
        initialData={editingDepartmentEmployee?.data ?? null}
        departmentOptions={departmentOptions}
        onClose={() => setEditingDepartmentEmployee(null)}
        onEditEmployee={saveEditedDepartmentEmployee}
      />
      <EmployeeOnboardingModal
        open={showAddDepartmentEmployeeModal}
        departmentOptions={departmentOptions}
        presetDepartment={selectedDepartment.replace(" Department", "").trim()}
        onClose={() => setShowAddDepartmentEmployeeModal(false)}
        onAddEmployee={addDepartmentEmployeeFromModal}
      />
      {showAddDepartmentModal && (
        <div className="fixed inset-0 z-50 bg-black/35 p-4">
          <div className="mx-auto mt-20 w-full max-w-[430px] rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-[20px] font-semibold tracking-tight text-slate-900">Add Department</h3>
            <p className="mt-1 text-sm text-slate-500">Create a new department for your organization.</p>
            <div className="mt-5">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-600">Department Name</span>
                <input
                  value={newDepartmentName}
                  onChange={(event) => {
                    setNewDepartmentName(event.target.value)
                    if (departmentError) setDepartmentError("")
                  }}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ${
                    departmentError ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-violet-500"
                  }`}
                  placeholder="Enter department name"
                />
              </label>
              {departmentError && <p className="mt-2 text-xs text-rose-500">{departmentError}</p>}
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddDepartmentModal(false)
                  setDepartmentError("")
                  setNewDepartmentName("")
                }}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addDepartment}
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white"
              >
                Create Department
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export default DepartmentsPage
