import { ArrowLeft, Briefcase, Search, SlidersHorizontal, TrendingUp, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { listDepartmentDetails } from "../services/departments"
import { listEmployeeRecords } from "../services/employees"

function parseDate(value) {
  const date = new Date(value || "")
  return Number.isNaN(date.getTime()) ? null : date
}

function safeGrowth(current, previous) {
  if (previous <= 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

function DepartmentDetailsPage({ appearance = "Light" }) {
  const isDark = appearance === "Dark"
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const departmentId = decodeURIComponent(pathname.split("/").pop() || "")

  const [department, setDepartment] = useState(null)
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [statusFilter, setStatusFilter] = useState("All Status")

  useEffect(() => {
    let mounted = true

    async function loadDetails() {
      try {
        setIsLoading(true)
        setLoadError("")
        const [departmentRows, employeeRows] = await Promise.all([
          listDepartmentDetails(),
          listEmployeeRecords(),
        ])
        if (!mounted) return

        const currentDepartment = (departmentRows || []).find((item) => item.id === departmentId) || null
        if (!currentDepartment) {
          setDepartment(null)
          setEmployees([])
          setLoadError("Department not found.")
          return
        }

        const departmentEmployees = (employeeRows || []).filter(
          (item) => String(item.department || "").trim().toLowerCase() === String(currentDepartment.name || "").trim().toLowerCase(),
        )
        setDepartment(currentDepartment)
        setEmployees(departmentEmployees)
      } catch (error) {
        if (!mounted) return
        setDepartment(null)
        setEmployees([])
        setLoadError(error?.message || "Unable to load department details.")
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadDetails()
    return () => {
      mounted = false
    }
  }, [departmentId])

  const stats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const previousMonthDate = new Date(currentYear, currentMonth - 1, 1)
    const previousMonth = previousMonthDate.getMonth()
    const previousYear = previousMonthDate.getFullYear()

    let joinedThisMonth = 0
    let joinedLastMonth = 0
    let activeCount = 0

    employees.forEach((item) => {
      const status = String(item.status || "").toLowerCase()
      if (status !== "inactive" && status !== "resigned" && status !== "terminated") {
        activeCount += 1
      }

      const joined = parseDate(item.joiningDate)
      if (!joined) return
      if (joined.getMonth() === currentMonth && joined.getFullYear() === currentYear) {
        joinedThisMonth += 1
      } else if (joined.getMonth() === previousMonth && joined.getFullYear() === previousYear) {
        joinedLastMonth += 1
      }
    })

    const growth = safeGrowth(joinedThisMonth, joinedLastMonth)
    return {
      total: employees.length,
      active: activeCount,
      joinedThisMonth,
      growth,
    }
  }, [employees])

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return employees.filter((item) => {
      const matchesSearch = !query
        || [item.employeeId, item.name, item.designation]
          .some((value) => String(value || "").toLowerCase().includes(query))
      const matchesStatus = statusFilter === "All Status" || String(item.status || "") === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [employees, searchQuery, statusFilter])

  const statusOptions = useMemo(
    () => Array.from(new Set(employees.map((item) => String(item.status || "").trim()).filter(Boolean))),
    [employees],
  )

  if (isLoading) {
    return (
      <article className={`rounded-2xl border p-5 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Loading department details...</p>
      </article>
    )
  }

  if (!department) {
    return (
      <article className={`rounded-2xl border p-5 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
        <button
          type="button"
          onClick={() => navigate("/departments")}
          className={`inline-flex items-center gap-1 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}
        >
          <ArrowLeft size={14} />
          Back to Departments
        </button>
        <p className={`mt-4 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{loadError || "Department not found."}</p>
      </article>
    )
  }

  return (
    <div className="space-y-4">
      <article className={`rounded-2xl border p-5 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
      <button
        type="button"
        onClick={() => navigate("/departments")}
        className={`inline-flex items-center gap-1 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}
      >
        <ArrowLeft size={14} />
        Back to Departments
      </button>

      <div className="mt-4">
        <h2 className={`text-2xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{department.name}</h2>
        <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Department details, employee stats, and growth overview.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className={`rounded-xl border p-4 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-white"}`}>
          <p className={`inline-flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <Users size={14} />
            Total Employees
          </p>
          <p className={`mt-2 text-3xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{stats.total}</p>
        </div>
        <div className={`rounded-xl border p-4 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-white"}`}>
          <p className={`inline-flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <Briefcase size={14} />
            Active Employees
          </p>
          <p className={`mt-2 text-3xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{stats.active}</p>
        </div>
        <div className={`rounded-xl border p-4 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-white"}`}>
          <p className={`inline-flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <Users size={14} />
            Joined This Month
          </p>
          <p className={`mt-2 text-3xl font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{stats.joinedThisMonth}</p>
        </div>
        <div className={`rounded-xl border p-4 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-white"}`}>
          <p className={`inline-flex items-center gap-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <TrendingUp size={14} />
            Growth (MoM)
          </p>
          <p className={`mt-2 text-3xl font-semibold ${stats.growth >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {stats.growth >= 0 ? "+" : "-"}
            {Math.abs(stats.growth).toFixed(1)}%
          </p>
        </div>
      </div>
      </article>

      <article className={`rounded-2xl border p-5 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
        <div className="mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Department Employees</h3>
          <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>All employees currently mapped to this department.</p>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-[320px]">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search employee"
              className={`w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#53c4ae] ${
                isDark ? "border-slate-700 bg-[#0f1720] text-slate-100" : "border-slate-200 bg-white text-slate-700"
              }`}
            />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterMenu((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium ${
                isDark ? "border-slate-700 bg-[#0f1720] text-slate-200" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              Filter
              <SlidersHorizontal size={14} />
            </button>
            {showFilterMenu ? (
              <div className={`absolute right-0 top-[46px] z-20 w-[220px] rounded-xl border p-3 shadow-lg ${
                isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-white"
              }`}
              >
                <label className={`block text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Status
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm outline-none ${
                      isDark ? "border-slate-700 bg-[#111a24] text-slate-200" : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <option>All Status</option>
                    {statusOptions.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusFilter("All Status")}
                    className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                      isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilterMenu(false)}
                    className="flex-1 rounded-lg bg-[#53c4ae] px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className={`text-sm ${isDark ? "text-slate-300" : "text-slate-400"}`}>
            <tr>
              <th className={`rounded-l-xl px-3 py-3 font-semibold ${isDark ? "bg-[#0f1720]" : "bg-slate-100"}`}>Employee ID</th>
              <th className={`px-3 py-3 font-semibold ${isDark ? "bg-[#0f1720]" : "bg-slate-100"}`}>Name</th>
              <th className={`px-3 py-3 font-semibold ${isDark ? "bg-[#0f1720]" : "bg-slate-100"}`}>Designation</th>
              <th className={`px-3 py-3 font-semibold ${isDark ? "bg-[#0f1720]" : "bg-slate-100"}`}>Join Date</th>
              <th className={`rounded-r-xl px-3 py-3 font-semibold ${isDark ? "bg-[#0f1720]" : "bg-slate-100"}`}>Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredEmployees.map((item) => (
              <tr key={item.employeeId} className={`border-b last:border-0 ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                <td className={`px-3 py-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{item.employeeId || "-"}</td>
                <td className={`px-3 py-3 font-medium ${isDark ? "text-slate-100" : "text-slate-800"}`}>{item.name || "-"}</td>
                <td className={`px-3 py-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{item.designation || "-"}</td>
                <td className={`px-3 py-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{item.joiningDate || "-"}</td>
                <td className="px-3 py-3">
                  <span className={`rounded px-2 py-1 text-xs font-medium ${
                    String(item.status || "").toLowerCase() === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                  >
                    {item.status || "-"}
                  </span>
                </td>
              </tr>
            ))}
            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan={5} className={`py-10 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  No employees found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </article>
    </div>
  )
}

export default DepartmentDetailsPage
