import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Eye, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react"
import EmployeeDetailsView from "../components/EmployeeDetailsView"
import EmployeeFilterModal from "../components/EmployeeFilterModal"
import EmployeeOnboardingModal from "../components/EmployeeOnboardingModal"
import { readLocalStorage, writeLocalStorage } from "../utils/localStorage"

const DEPARTMENTS_STORAGE_KEY = "hrms_departments_rows"
const indianNameMap = {
  "Darlene Robertson": "Aarav Sharma",
  "Floyd Miles": "Rohan Verma",
  "Cody Fisher": "Vikram Singh",
  "Dianne Russell": "Ananya Iyer",
  "Savannah Nguyen": "Priya Nair",
  "Jacob Jones": "Arjun Patel",
  "Darrell Steward": "Siddharth Mehra",
  "Kristin Watson": "Kavya Reddy",
  "Courtney Henry": "Neha Kapoor",
  "Kathryn Murphy": "Meera Joshi",
  "Albert Flores": "Ishaan Bhat",
  "Leslie Alexander": "Rahul Desai",
  "Ronald Richards": "Karan Malhotra",
  "Eleanor Pena": "Diya Chawla",
  "Esther Howard": "Nisha Rao",
  "Brooklyn Simmons": "Tanvi Kulkarni",
  "Arlene McCoy": "Pooja Menon",
  "Devon Lane": "Amit Kulshreshtha",
  "Wade Warren": "Aditya Khanna",
}

const initialDepartmentTableRows = {
  "Design Department": [
    ["345321231", "Aarav Sharma", "Lead UI/UX Designer", "Office"],
    ["987890345", "Rohan Verma", "Lead UI/UX Designer", "Office"],
    ["453367122", "Vikram Singh", "Sr. UI/UX Designer", "Office"],
    ["345321231", "Ananya Iyer", "Sr. UI/UX Designer", "Remote"],
    ["453677881", "Priya Nair", "Sr. UI/UX Designer", "Office"],
    ["009918765", "Arjun Patel", "UX Designer", "Remote"],
    ["238870122", "Marvin McKinney", "UX Designer", "Remote"],
    ["124355111", "Tanvi Kulkarni", "UI/UX Designer", "Office"],
    ["435540099", "Kavya Reddy", "UI/UX Designer", "Office"],
    ["009812890", "Meera Joshi", "UI/UX Designer", "Office"],
    ["671190345", "Pooja Menon", "UI/UX Designer", "Office"],
    ["091233412", "Amit Kulshreshtha", "UI/UX Designer", "Remote"],
  ],
  "Sales Department": [
    ["665291234", "Siddharth Mehra", "Sr. Sales Manager", "Office"],
    ["548832109", "Kavya Reddy", "Sales Manager", "Office"],
    ["901341122", "Neha Kapoor", "BDM", "Remote"],
    ["871203456", "Meera Joshi", "BDE", "Office"],
    ["337712890", "Ishaan Bhat", "Sales Executive", "Office"],
  ],
  "Project Manager Department": [
    ["220173456", "Rahul Desai", "Sr. Project Manager", "Office"],
    ["118324597", "Karan Malhotra", "Project Manager", "Office"],
    ["772310234", "Priya Nair", "Project Manager", "Remote"],
    ["314520876", "Diya Chawla", "Project Manager", "Office"],
    ["552801233", "Nisha Rao", "Project Manager", "Office"],
  ],
  "Marketing Department": [
    ["120945781", "Aditya Khanna", "Sr. Marketing Manager", "Office"],
    ["210134599", "Tanvi Kulkarni", "Marketing Manager", "Office"],
    ["668901245", "Kavya Reddy", "Marketing Coordinator", "Remote"],
    ["334421900", "Arjun Patel", "Marketing Coordinator", "Office"],
    ["785412209", "Vikram Singh", "Marketing Executive", "Office"],
  ],
}

const normalizeDepartmentRows = (rowsByName) =>
  Object.fromEntries(
    Object.entries(rowsByName).map(([key, rows]) => [
      key,
      rows.map((row) => [row[0], indianNameMap[row[1]] ?? row[1], row[2], row[3]]),
    ]),
  )

function DepartmentsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [editingDepartmentEmployee, setEditingDepartmentEmployee] = useState(null)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filters, setFilters] = useState({ departments: [], type: "" })
  const [departmentRowsByName, setDepartmentRowsByName] = useState(() =>
    normalizeDepartmentRows(readLocalStorage(DEPARTMENTS_STORAGE_KEY, initialDepartmentTableRows)),
  )

  useEffect(() => {
    writeLocalStorage(DEPARTMENTS_STORAGE_KEY, departmentRowsByName)
  }, [departmentRowsByName])

  const departments = useMemo(
    () =>
      Object.entries(departmentRowsByName).map(([name, rows], departmentIndex) => ({
        name,
        members: `${rows.length} Members`,
        employees: rows.slice(0, 5).map((employee, index) => ({
          name: employee[1],
          role: employee[2],
          avatar: `https://i.pravatar.cc/80?img=${(departmentIndex * 8 + index + 10) % 70}`,
        })),
      })),
    [departmentRowsByName],
  )

  const tableRows = useMemo(() => {
    const rows = selectedDepartment ? departmentRowsByName[selectedDepartment] ?? [] : []
    const departmentName = selectedDepartment.replace(" Department", "").trim()

    return rows.filter((row) => {
      const mappedType = row[3] === "Remote" ? "Work from Home" : row[3]
      const matchesSearch =
        searchQuery.trim() === "" ||
        row.some((value) => value.toLowerCase().includes(searchQuery.toLowerCase())) ||
        departmentName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDepartment = filters.departments.length === 0 || filters.departments.includes(departmentName)
      const matchesType = filters.type === "" || filters.type === mappedType

      return matchesSearch && matchesDepartment && matchesType
    })
  }, [departmentRowsByName, searchQuery, selectedDepartment, filters])

  const addDepartmentEmployee = () => {
    if (!selectedDepartment) return
    const employeeId = window.prompt("Employee ID")
    if (!employeeId || employeeId.trim() === "") return
    const name = window.prompt("Employee Name")
    if (!name || name.trim() === "") return
    const designation = window.prompt("Designation", "UI/UX Designer")
    if (!designation || designation.trim() === "") return
    const type = window.prompt("Type (Office/Remote)", "Office")
    if (!type || type.trim() === "") return

    setDepartmentRowsByName((prev) => ({
      ...prev,
      [selectedDepartment]: [...(prev[selectedDepartment] ?? []), [employeeId.trim(), name.trim(), designation.trim(), type.trim()]],
    }))
  }

  const openDepartmentEmployeeEditModal = (row) => {
    if (!selectedDepartment || !row) return
    const [employeeId, name, designation, type] = row
    const [firstName = "", ...rest] = (name || "").trim().split(/\s+/)
    const lastName = rest.join(" ")
    const safeOfficeEmail = `${firstName || "employee"}@mensou.com`.toLowerCase()
    const safePersonalEmail = `${(firstName || "employee").toLowerCase()}.${(lastName || "user").toLowerCase()}@example.com`
    setEditingDepartmentEmployee({
      originalEmployeeId: employeeId,
      originalName: name,
      data: {
        name,
        firstName,
        lastName,
        employeeId,
        department: selectedDepartment.replace(" Department", "").trim(),
        designation,
        type,
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
    setDepartmentRowsByName((prev) => ({
      ...prev,
      [selectedDepartment]: (prev[selectedDepartment] ?? []).filter((item) => !(item[0] === current[0] && item[1] === current[1])),
    }))
  }

  const editDepartmentEmployeeProfile = () => {
    if (!selectedDepartment || !selectedEmployee) return
    const [currentName, currentEmployeeId, , currentDesignation, currentType] = selectedEmployee
    openDepartmentEmployeeEditModal([currentEmployeeId, currentName, currentDesignation, currentType])
  }

  const saveEditedDepartmentEmployee = (payload) => {
    if (!selectedDepartment || !editingDepartmentEmployee) return
    const nextName = payload.name?.trim() || "New Employee"
    const nextId = payload.employeeId?.trim() || editingDepartmentEmployee.originalEmployeeId
    const nextDesignation = payload.designation?.trim() || "UI/UX Designer"
    const nextType = payload.type?.trim() || "Office"

    setDepartmentRowsByName((prev) => {
      const rows = [...(prev[selectedDepartment] ?? [])]
      const actualIndex = rows.findIndex(
        (item) => item[0] === editingDepartmentEmployee.originalEmployeeId && item[1] === editingDepartmentEmployee.originalName,
      )
      if (actualIndex === -1) return prev
      rows[actualIndex] = [nextId, nextName, nextDesignation, nextType]
      return { ...prev, [selectedDepartment]: rows }
    })

    setSelectedEmployee([nextName, nextId, selectedDepartment, nextDesignation, nextType])
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
                        key={`${row[0]}-${row[1]}`}
                        onClick={() => setSelectedEmployee([row[1], row[0], selectedDepartment, row[2], row[3]])}
                        className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="py-3.5 text-slate-700">{row[0]}</td>
                        <td className="py-3.5 font-medium text-slate-800">
                          <span className="flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 rounded-full bg-slate-200" />
                            {row[1]}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-700">{row[2]}</td>
                        <td className="py-3.5 text-slate-700">{row[3]}</td>
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
                              openDepartmentEmployeeEditModal(tableRows[rowIndex])
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
          <div className="mb-4 relative max-w-[330px]">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-3 text-sm outline-none focus:border-violet-300"
              placeholder="Search"
            />
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
        onClose={() => setEditingDepartmentEmployee(null)}
        onEditEmployee={saveEditedDepartmentEmployee}
      />
    </article>
  )
}

export default DepartmentsPage
