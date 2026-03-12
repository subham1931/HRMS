import { useEffect, useMemo, useState } from "react"
import { Activity, Check, Minus, Plus, Search, SlidersHorizontal, UserMinus, UserRoundPlus, Users } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import EmployeeDetailsView from "../components/EmployeeDetailsView"
import EmployeeFilterModal from "../components/EmployeeFilterModal"
import { listDepartmentDetails } from "../services/departments"
import { listEmployeeRecords } from "../services/employees"
const defaultEmployees = []
const normalizeEmployees = (rows) => rows
const safePercent = (value) => `${Math.abs(value).toFixed(1)}%`
const EMPLOYMENT_TYPE_LEGACY_VALUES = new Set([
  "full-time",
  "part-time",
  "internship",
  "freelance",
  "contract",
  "temporary",
  "permanent",
])
const isValidEmploymentType = (value) => EMPLOYMENT_TYPE_LEGACY_VALUES.has((value || "").trim().toLowerCase())

const getEmploymentTypeLabel = (row) => {
  const direct = (row.employmentType || "").trim()
  if (isValidEmploymentType(direct)) return direct
  const legacy = (row.status || "").trim()
  if (isValidEmploymentType(legacy)) return legacy
  return "-"
}
const normalizeWorkModel = (value) => {
  const raw = (value || "").trim().toLowerCase()
  if (!raw) return ""
  if (raw === "office") return "on-site"
  if (raw === "work from home") return "remote"
  return raw
}

const parseDateValue = (value) => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
const getInitials = (name) => (name || "A")
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((word) => word[0]?.toUpperCase() || "")
  .join("")

function EmployeesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(() => location.state?.selectedEmployeeId || "")
  const [selectedRowIds, setSelectedRowIds] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState({ departments: [], employmentType: "", workModel: "" })
  const [employees, setEmployees] = useState(() => normalizeEmployees(defaultEmployees))
  const [departmentMaster, setDepartmentMaster] = useState([])
  const [loadError, setLoadError] = useState("")

  useEffect(() => {
    let isMounted = true
    listEmployeeRecords()
      .then((rows) => {
        if (!isMounted) return
        setEmployees(normalizeEmployees(rows))
        setLoadError("")
      })
      .catch((error) => {
        if (!isMounted) return
        setEmployees(normalizeEmployees(defaultEmployees))
        setLoadError(error?.message || "Unable to load employees from database.")
      })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    listDepartmentDetails()
      .then((rows) => {
        if (!isMounted) return
        setDepartmentMaster(rows.map((item) => (item.name || "").trim()).filter(Boolean))
      })
      .catch(() => {
        if (!isMounted) return
        setDepartmentMaster([])
      })
    return () => {
      isMounted = false
    }
  }, [])

  const filteredRows = useMemo(() => {
    return employees.filter((employee) => {
      const { name, employeeId, department, designation, type } = employee
      const employmentType = getEmploymentTypeLabel(employee)
      const currentWorkModel = normalizeWorkModel(type)
      const requestedWorkModel = normalizeWorkModel(filters.workModel)

      const matchesSearch =
        searchQuery.trim() === "" ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDepartment = filters.departments.length === 0 || filters.departments.includes(department)
      const matchesEmploymentType =
        filters.employmentType === ""
        || employmentType.toLowerCase() === filters.employmentType.toLowerCase()
      const matchesWorkModel = requestedWorkModel === "" || currentWorkModel === requestedWorkModel

      return matchesSearch && matchesDepartment && matchesEmploymentType && matchesWorkModel
    })
  }, [employees, filters, searchQuery])

  const selectedEmployee = useMemo(
    () =>
      filteredRows.find((item) => item.employeeId === selectedEmployeeId) ||
      employees.find((item) => item.employeeId === selectedEmployeeId),
    [employees, filteredRows, selectedEmployeeId],
  )
  const filterDepartmentOptions = useMemo(() => {
    const createdDepartments = (departmentMaster || []).map((item) => (item || "").trim()).filter(Boolean)
    const fromEmployees = employees
      .map((item) => (item.department || "").trim())
      .filter(Boolean)
    return Array.from(new Set([...createdDepartments, ...fromEmployees]))
  }, [departmentMaster, employees])
  const visibleEmployeeIds = useMemo(() => filteredRows.map((row) => row.employeeId), [filteredRows])
  const allVisibleSelected = visibleEmployeeIds.length > 0 && visibleEmployeeIds.every((id) => selectedRowIds.includes(id))
  const hasVisibleSelection = visibleEmployeeIds.some((id) => selectedRowIds.includes(id))
  const toggleSelectAllVisible = () => {
    setSelectedRowIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleEmployeeIds.includes(id))
      }
      return Array.from(new Set([...prev, ...visibleEmployeeIds]))
    })
  }
  const toggleSelectRow = (employeeId) => {
    setSelectedRowIds((prev) => (prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId]))
  }
  const activeFilterCount = useMemo(() => (
    (filters.departments?.length || 0)
    + (filters.employmentType ? 1 : 0)
    + (filters.workModel ? 1 : 0)
  ), [filters.departments, filters.employmentType, filters.workModel])
  const heroStats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const previousMonthDate = new Date(currentYear, currentMonth - 1, 1)
    const previousMonth = previousMonthDate.getMonth()
    const previousYear = previousMonthDate.getFullYear()

    let newEmployeesThisMonth = 0
    let newEmployeesLastMonth = 0
    let resignedThisMonth = 0
    let resignedLastMonth = 0

    employees.forEach((employee) => {
      const joinedOn = parseDateValue(employee.joiningDate)
      if (joinedOn) {
        if (joinedOn.getMonth() === currentMonth && joinedOn.getFullYear() === currentYear) {
          newEmployeesThisMonth += 1
        } else if (joinedOn.getMonth() === previousMonth && joinedOn.getFullYear() === previousYear) {
          newEmployeesLastMonth += 1
        }
      }

      const normalizedStatus = (employee.status || "").toLowerCase()
      const resigned = ["resigned", "inactive", "terminated"].some((term) => normalizedStatus.includes(term))
      if (resigned) {
        if (joinedOn && joinedOn.getMonth() === currentMonth && joinedOn.getFullYear() === currentYear) {
          resignedThisMonth += 1
        } else if (joinedOn && joinedOn.getMonth() === previousMonth && joinedOn.getFullYear() === previousYear) {
          resignedLastMonth += 1
        } else if (!joinedOn) {
          resignedThisMonth += 1
        }
      }
    })

    const totalEmployees = employees.length
    const turnoverRate = totalEmployees ? (resignedThisMonth / totalEmployees) * 100 : 0
    const totalGrowth = newEmployeesLastMonth
      ? ((newEmployeesThisMonth - newEmployeesLastMonth) / newEmployeesLastMonth) * 100
      : newEmployeesThisMonth > 0 ? 100 : 0
    const newEmployeeGrowth = newEmployeesLastMonth
      ? ((newEmployeesThisMonth - newEmployeesLastMonth) / newEmployeesLastMonth) * 100
      : newEmployeesThisMonth > 0 ? 100 : 0
    const resignedGrowth = resignedLastMonth
      ? ((resignedThisMonth - resignedLastMonth) / resignedLastMonth) * 100
      : resignedThisMonth > 0 ? 100 : 0

    return {
      totalEmployees,
      newEmployeesThisMonth,
      resignedThisMonth,
      turnoverRate,
      totalGrowth,
      newEmployeeGrowth,
      resignedGrowth,
    }
  }, [employees])

  const departmentBreakdown = useMemo(() => {
    const counts = departmentMaster.reduce((acc, name) => {
      const key = (name || "").trim()
      if (key) acc.set(key, 0)
      return acc
    }, new Map())

    employees.forEach((employee) => {
      const name = (employee.department || "Unassigned").trim() || "Unassigned"
      counts.set(name, (counts.get(name) || 0) + 1)
    })

    const total = employees.length || 1
    const colors = ["#0f766e", "#22c3aa", "#dbe8c8", "#6b7c7a", "#a8b6b4", "#1f7667"]
    const items = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], index) => ({
        name,
        count,
        percent: Math.round((count / total) * 100),
        color: colors[index % colors.length],
      }))

    const donutStops = items.length
      ? items
        .map((item, index) => {
          const start = items.slice(0, index).reduce((sum, current) => sum + current.percent, 0)
          const end = start + item.percent
          return `${item.color} ${start}% ${end}%`
        })
        .join(", ")
      : "#e2e8f0 0 100%"

    return { items, donutStops }
  }, [departmentMaster, employees])

  const editEmployeeProfile = (employeeId) => {
    const current = employees.find((item) => item.employeeId === employeeId)
    if (!current) return
    navigate("/employees/editemploye", { state: { employeeId } })
  }

  return (
    <>
      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        {loadError ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {loadError}
          </div>
        ) : null}
        {!selectedEmployee && (
          <>
            <div className="mb-6 space-y-4">
              <div>
                <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">Employees</h1>
                <p className="mt-1 text-xs text-slate-500">Dashboard / Employees</p>
              </div>

              <div className="grid gap-3 xl:grid-cols-[1.8fr_1fr]">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-[#dceac7] p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Users size={14} />
                      <span>Total Employees</span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <p className="text-[36px] font-semibold leading-none text-slate-800">{heroStats.totalEmployees}</p>
                      <div className="text-right">
                        <span className="rounded-full bg-white/75 px-2 py-1 text-[11px] font-semibold text-slate-700">
                          {heroStats.totalGrowth >= 0 ? "+" : "-"}
                          {safePercent(heroStats.totalGrowth)}
                        </span>
                        <p className="mt-1 text-[11px] text-slate-600">from last month</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <UserRoundPlus size={14} />
                      <span>New Employees (This Month)</span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <p className="text-[36px] font-semibold leading-none text-slate-800">{heroStats.newEmployeesThisMonth}</p>
                      <div className="text-right">
                        <span className="rounded-full bg-[#e6f4de] px-2 py-1 text-[11px] font-semibold text-[#2f7b54]">
                          {heroStats.newEmployeeGrowth >= 0 ? "+" : "-"}
                          {safePercent(heroStats.newEmployeeGrowth)}
                        </span>
                        <p className="mt-1 text-[11px] text-slate-500">from last month</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Activity size={14} />
                      <span>Turnover Rate</span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <p className="text-[36px] font-semibold leading-none text-slate-800">{heroStats.turnoverRate.toFixed(1)}%</p>
                      <p className="text-[11px] text-slate-500">this month</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <UserMinus size={14} />
                      <span>Resigned Employees (This Month)</span>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <p className="text-[36px] font-semibold leading-none text-slate-800">{heroStats.resignedThisMonth}</p>
                      <div className="text-right">
                        <span className="rounded-full bg-[#e6f4de] px-2 py-1 text-[11px] font-semibold text-[#2f7b54]">
                          {heroStats.resignedGrowth >= 0 ? "+" : "-"}
                          {safePercent(heroStats.resignedGrowth)}
                        </span>
                        <p className="mt-1 text-[11px] text-slate-500">from last month</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800">Departments</h3>
                    <button type="button" className="rounded-lg bg-[#edf4e6] px-2.5 py-1 text-xs text-slate-600">
                      This Month
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                    <div className="flex items-center justify-center">
                      <div
                        className="relative h-[110px] w-[110px] rounded-full"
                        style={{ background: `conic-gradient(${departmentBreakdown.donutStops})` }}
                      >
                        <div className="absolute inset-[20px] rounded-full bg-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-xs text-slate-600">
                      {departmentBreakdown.items.length === 0 ? (
                        <p className="text-slate-400">No department data yet.</p>
                      ) : (
                        departmentBreakdown.items.map((item) => (
                          <div key={item.name} className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.name}
                            </span>
                            <span className="text-slate-500">
                              {item.count} - <span className="font-semibold text-slate-700">{item.percent}%</span>
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="relative w-full max-w-[320px]">
                <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-3 text-sm outline-none focus:border-violet-300"
                  placeholder="Search employee"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFilterModal(true)
                  }}
                  className="relative inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-[#edf4e6] px-4 py-2.5 text-sm font-medium text-slate-700"
                >
                  <SlidersHorizontal size={16} />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#53c4ae] px-1 text-[11px] font-semibold leading-none text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/employees/addemploye")
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white"
                >
                  <Plus size={16} />
                  New Employee
                </button>
              </div>
            </div>
          </>
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
              <thead className="text-xs text-slate-400">
                <tr className="rounded-xl bg-[#f6f7f8]">
                  <th className="w-10 rounded-l-xl px-3 py-3 font-medium">
                    <button
                      type="button"
                      onClick={toggleSelectAllVisible}
                      className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
                        allVisibleSelected || hasVisibleSelection
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 bg-white text-slate-400"
                      }`}
                      aria-label="Select all employees"
                    >
                      {allVisibleSelected ? <Check size={10} /> : hasVisibleSelection ? <Minus size={10} /> : null}
                    </button>
                  </th>
                  <th className="px-3 py-3 font-medium">Employee ID</th>
                  <th className="px-3 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Job Title</th>
                  <th className="px-3 py-3 font-medium">Department</th>
                  <th className="px-3 py-3 font-medium">Employment Type</th>
                  <th className="px-3 py-3 font-medium">Work Model</th>
                  <th className="px-3 py-3 font-medium">Join Date</th>
                  <th className="rounded-r-xl px-3 py-3 font-medium">Status</th>
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
                    <td className="w-10 px-3 py-3">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          toggleSelectRow(row.employeeId)
                        }}
                        className={`inline-flex h-4 w-4 items-center justify-center rounded border ${
                          selectedRowIds.includes(row.employeeId)
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                        aria-label={`Select ${row.name}`}
                      >
                        <Check size={10} />
                      </button>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{row.employeeId}</td>
                    <td className="px-3 py-3 font-medium text-slate-800">
                      <span className="flex items-center gap-3">
                        {row.profileImage ? (
                          <img src={row.profileImage} alt={row.name} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                            {getInitials(row.name) || "A"}
                          </span>
                        )}
                        {row.name}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{row.designation}</td>
                    <td className="px-3 py-3 text-slate-700">{row.department}</td>
                    <td className="px-3 py-3 text-slate-700">{getEmploymentTypeLabel(row)}</td>
                    <td className="px-3 py-3 text-slate-700">{row.type || "-"}</td>
                    <td className="px-3 py-3 text-slate-700">{row.joiningDate || "-"}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">Active</span>
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-sm text-slate-500">
                      No employees match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {showFilterModal && (
        <EmployeeFilterModal
          open={showFilterModal}
          initialFilters={filters}
          departmentOptions={filterDepartmentOptions}
          onClose={() => setShowFilterModal(false)}
          onApply={(nextFilters) => {
            setFilters(nextFilters)
            setShowFilterModal(false)
          }}
        />
      )}
    </>
  )
}

export default EmployeesPage
