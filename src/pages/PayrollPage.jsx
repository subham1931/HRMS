import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Search, Upload } from "lucide-react"
import { listPayrollRowsForMonth } from "../services/payroll"

const getInitials = (name) => (name || "E")
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase() || "")
  .join("")

function PayrollPage({ appearance = "Light" }) {
  const isDark = appearance === "Dark"
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [payrollRows, setPayrollRows] = useState([])
  const [loadError, setLoadError] = useState("")
  const [brokenAvatarByCode, setBrokenAvatarByCode] = useState({})

  useEffect(() => {
    let mounted = true
    async function loadPayrollRows() {
      try {
        setLoadError("")
        const rows = await listPayrollRowsForMonth()
        if (!mounted) return
        setPayrollRows(rows)
      } catch (error) {
        if (!mounted) return
        setPayrollRows([])
        setLoadError(error?.message || "Unable to load payroll records.")
      }
    }
    loadPayrollRows()
    return () => {
      mounted = false
    }
  }, [])

  const filteredRows = useMemo(() => {
    return payrollRows.filter((row) => {
      if (searchQuery.trim() === "") return true
      const q = searchQuery.toLowerCase()
      return [row.employeeName, row.ctc, row.salaryPerMonth, row.deduction, row.status]
        .some((value) => String(value || "").toLowerCase().includes(q))
    })
  }, [payrollRows, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const pagedRows = filteredRows.slice(startIndex, endIndex)
  const from = filteredRows.length === 0 ? 0 : startIndex + 1
  const to = Math.min(endIndex, filteredRows.length)

  return (
    <article className={`rounded-2xl border p-4 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
      {loadError ? (
        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {loadError}
        </div>
      ) : null}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-[330px]">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setCurrentPage(1)
            }}
            className={`w-full rounded-xl border py-2.5 pl-11 pr-3 text-sm outline-none focus:border-violet-300 ${
              isDark ? "border-slate-700 bg-[#0f1720] text-slate-100" : "border-slate-200 bg-white"
            }`}
            placeholder="Search"
          />
        </div>

        <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-[#53c4ae] px-4 py-2.5 text-sm font-medium text-white">
          <Upload size={15} />
          Export
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left">
          <thead className={`border-b text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-100 text-slate-400"}`}>
            <tr>
              <th className="pb-4 font-medium">Employee Name</th>
              <th className="pb-4 font-medium">CTC</th>
              <th className="pb-4 font-medium">Salary Per Month</th>
              <th className="pb-4 font-medium">Deduction</th>
              <th className="pb-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {pagedRows.map((row) => (
              <tr key={row.employeeCode || row.employeeName} className={`border-b last:border-0 ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                <td className={`py-3 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                  <span className="flex items-center gap-3">
                    {row.profileImage && !brokenAvatarByCode[row.employeeCode] ? (
                      <img
                        src={row.profileImage}
                        alt={row.employeeName}
                        className="h-8 w-8 rounded-full object-cover"
                        onError={() => {
                          setBrokenAvatarByCode((prev) => ({ ...prev, [row.employeeCode]: true }))
                        }}
                      />
                    ) : (
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                        {getInitials(row.employeeName)}
                      </span>
                    )}
                    <span className={`font-medium ${isDark ? "text-slate-100" : ""}`}>{row.employeeName}</span>
                  </span>
                </td>
                <td className={`py-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{row.ctc}</td>
                <td className={`py-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{row.salaryPerMonth}</td>
                <td className={`py-3 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{row.deduction}</td>
                <td className="py-3">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      row.status === "Completed" ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
            {pagedRows.length === 0 && (
              <tr>
                <td colSpan={5} className={`py-10 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  No payroll records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={`mt-4 flex flex-wrap items-center justify-between gap-3 text-sm ${isDark ? "text-slate-400" : "text-slate-400"}`}>
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setCurrentPage(1)
            }}
            className={`rounded-lg border px-3 py-1.5 outline-none ${
              isDark ? "border-slate-700 bg-[#0f1720] text-slate-200" : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </div>

        <p>
          Showing {from} to {to} out of {filteredRows.length} records
        </p>

        <div className={`flex items-center gap-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: Math.min(totalPages, 4) }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs ${
                safeCurrentPage === page
                  ? (isDark ? "border border-[#53c4ae] text-[#53c4ae]" : "border border-violet-500 text-violet-600")
                  : ""
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </article>
  )
}

export default PayrollPage
