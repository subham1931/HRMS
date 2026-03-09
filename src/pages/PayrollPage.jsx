import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Search, Upload } from "lucide-react"

const payrollRows = [
  ["Aarav Sharma", "$45000", "$3500", "-", "Completed", "https://i.pravatar.cc/80?img=32"],
  ["Rohan Verma", "$78000", "$6400", "$100", "Completed", "https://i.pravatar.cc/80?img=5"],
  ["Arjun Patel", "$60000", "$5000", "$250", "Completed", "https://i.pravatar.cc/80?img=66"],
  ["Meera Joshi", "$34000", "$2800", "-", "Pending", "https://i.pravatar.cc/80?img=41"],
  ["Rahul Desai", "$40000", "$3400", "-", "Pending", "https://i.pravatar.cc/80?img=51"],
  ["Karan Malhotra", "$45000", "$3500", "-", "Completed", "https://i.pravatar.cc/80?img=54"],
  ["Aditya Khanna", "$55000", "$4000", "$50", "Pending", "https://i.pravatar.cc/80?img=58"],
  ["Ishaan Bhat", "$60000", "$5000", "$150", "Completed", "https://i.pravatar.cc/80?img=14"],
  ["Priya Nair", "$25000", "$2200", "-", "Pending", "https://i.pravatar.cc/80?img=48"],
  ["Aniket Tiwari", "$30000", "$2700", "-", "Completed", "https://i.pravatar.cc/80?img=61"],
  ["Siddharth Mehra", "$78000", "$6400", "-", "Completed", "https://i.pravatar.cc/80?img=53"],
  ["Nisha Rao", "$45000", "$3500", "$100", "Pending", "https://i.pravatar.cc/80?img=25"],
]

function PayrollPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredRows = useMemo(() => {
    return payrollRows.filter((row) => {
      if (searchQuery.trim() === "") return true
      const q = searchQuery.toLowerCase()
      return row.slice(0, 5).some((value) => value.toLowerCase().includes(q))
    })
  }, [searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const pagedRows = filteredRows.slice(startIndex, endIndex)
  const from = filteredRows.length === 0 ? 0 : startIndex + 1
  const to = Math.min(endIndex, filteredRows.length)

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-[330px]">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setCurrentPage(1)
            }}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-3 text-sm outline-none focus:border-violet-300"
            placeholder="Search"
          />
        </div>

        <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white">
          <Upload size={15} />
          Export
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left">
          <thead className="border-b border-slate-100 text-sm text-slate-400">
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
              <tr key={`${row[0]}-${row[2]}`} className="border-b border-slate-100 last:border-0">
                <td className="py-3 text-slate-800">
                  <span className="flex items-center gap-3">
                    <img src={row[5]} alt={row[0]} className="h-8 w-8 rounded-full object-cover" />
                    <span className="font-medium">{row[0]}</span>
                  </span>
                </td>
                <td className="py-3 text-slate-700">{row[1]}</td>
                <td className="py-3 text-slate-700">{row[2]}</td>
                <td className="py-3 text-slate-700">{row[3]}</td>
                <td className="py-3">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      row[4] === "Completed" ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"
                    }`}
                  >
                    {row[4]}
                  </span>
                </td>
              </tr>
            ))}
            {pagedRows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                  No payroll records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <span>Showing</span>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value))
              setCurrentPage(1)
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-600 outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </div>

        <p>
          Showing {from} to {to} out of {filteredRows.length} records
        </p>

        <div className="flex items-center gap-2 text-slate-700">
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
                safeCurrentPage === page ? "border border-violet-500 text-violet-600" : ""
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
