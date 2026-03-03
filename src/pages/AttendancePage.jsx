import { useEffect, useMemo, useState } from "react"
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Download, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from "lucide-react"
import { readLocalStorage, writeLocalStorage } from "../utils/localStorage"

const ATTENDANCE_STORAGE_KEY = "hrms_attendance"
const indianNameMap = {
  "Leasie Watson": "Aarav Sharma",
  "Darlene Robertson": "Rohan Verma",
  "Jacob Jones": "Arjun Patel",
  "Kathryn Murphy": "Meera Joshi",
  "Leslie Alexander": "Rahul Desai",
  "Ronald Richards": "Karan Malhotra",
  "Guy Hawkins": "Aditya Khanna",
  "Albert Flores": "Ishaan Bhat",
  "Savannah Nguyen": "Priya Nair",
  "Marvin McKinney": "Aniket Tiwari",
  "Jerome Bell": "Siddharth Mehra",
  "Jenny Wilson": "Nisha Rao",
}

const initialAttendanceRows = [
  ["Aarav Sharma", "Design", "Team Lead - Design", "Office", "09:27 AM", "On Time", "https://i.pravatar.cc/80?img=32", "A1"],
  ["Rohan Verma", "Design", "Web Designer", "Office", "10:15 AM", "Late", "https://i.pravatar.cc/80?img=5", "A2"],
  ["Arjun Patel", "Healthcare", "Medical Assistant", "Remote", "10:24 AM", "Late", "https://i.pravatar.cc/80?img=66", "A3"],
  ["Meera Joshi", "Marketing", "Marketing Coordinator", "Office", "09:10 AM", "On Time", "https://i.pravatar.cc/80?img=41", "A4"],
  ["Rahul Desai", "Analytics", "Data Analyst", "Office", "09:15 AM", "On Time", "https://i.pravatar.cc/80?img=51", "A5"],
  ["Karan Malhotra", "Engineering", "Phyton Developer", "Remote", "09:29 AM", "On Time", "https://i.pravatar.cc/80?img=54", "A6"],
  ["Aditya Khanna", "Design", "UI/UX Design", "Remote", "09:29 AM", "On Time", "https://i.pravatar.cc/80?img=58", "A7"],
  ["Ishaan Bhat", "Engineering", "React JS", "Remote", "09:29 AM", "On Time", "https://i.pravatar.cc/80?img=14", "A8"],
  ["Priya Nair", "Engineering", "IOS Developer", "Remote", "10:50 AM", "Late", "https://i.pravatar.cc/80?img=48", "A9"],
  ["Aniket Tiwari", "HR", "HR", "Remote", "09:29 AM", "On Time", "https://i.pravatar.cc/80?img=61", "A10"],
  ["Siddharth Mehra", "Sales", "Sales Manager", "Remote", "09:29 AM", "On Time", "https://i.pravatar.cc/80?img=53", "A11"],
  ["Nisha Rao", "Engineering", "React JS Developer", "Remote", "11:30 AM", "Late", "https://i.pravatar.cc/80?img=25", "A12"],
]

const normalizeAttendanceRows = (rows) =>
  (rows || []).map((row) => [indianNameMap[row[0]] ?? row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7]])

const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

const toIsoDate = (dateObj) => {
  const year = dateObj.getFullYear()
  const month = `${dateObj.getMonth() + 1}`.padStart(2, "0")
  const day = `${dateObj.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [departmentFilter, setDepartmentFilter] = useState("All Departments")
  const todayForInput = new Date().toISOString().split("T")[0]
  const [selectedDate, setSelectedDate] = useState(todayForInput)
  const [showDateModal, setShowDateModal] = useState(false)
  const [tempDate, setTempDate] = useState(todayForInput)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const base = new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })
  const [toastMessage, setToastMessage] = useState("")
  const [attendanceRows, setAttendanceRows] = useState(() =>
    normalizeAttendanceRows(readLocalStorage(ATTENDANCE_STORAGE_KEY, initialAttendanceRows)),
  )

  useEffect(() => {
    writeLocalStorage(ATTENDANCE_STORAGE_KEY, attendanceRows)
  }, [attendanceRows])

  const filteredRows = useMemo(() => {
    return attendanceRows.filter((row) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch = searchQuery.trim() === "" || row.slice(0, 6).some((value) => value.toLowerCase().includes(q))
      const matchesDepartment = departmentFilter === "All Departments" || row[1] === departmentFilter
      return matchesSearch && matchesDepartment
    })
  }, [searchQuery, departmentFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const pagedRows = filteredRows.slice(startIndex, endIndex)
  const from = filteredRows.length === 0 ? 0 : startIndex + 1
  const to = Math.min(endIndex, filteredRows.length)
  const selectedDateLabel = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(selectedDate),
  )
  const selectedDateTableLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(
    new Date(selectedDate),
  )
  const calendarMonthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarMonth)
  const calendarCells = useMemo(() => {
    const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1)
    const firstWeekday = firstDay.getDay()
    const daysInCurrentMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
    const daysInPrevMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 0).getDate()
    const cells = []

    for (let i = firstWeekday - 1; i >= 0; i -= 1) {
      const day = daysInPrevMonth - i
      const dateObj = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, day)
      cells.push({ iso: toIsoDate(dateObj), day, inCurrentMonth: false })
    }

    for (let day = 1; day <= daysInCurrentMonth; day += 1) {
      const dateObj = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
      cells.push({ iso: toIsoDate(dateObj), day, inCurrentMonth: true })
    }

    const trailingDays = (7 - (cells.length % 7)) % 7
    for (let day = 1; day <= trailingDays; day += 1) {
      const dateObj = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, day)
      cells.push({ iso: toIsoDate(dateObj), day, inCurrentMonth: false })
    }

    return cells
  }, [calendarMonth])

  const handleExportCsv = async () => {
    const exportDate = selectedDateTableLabel
    const fileDate = selectedDate
    const rowsToExport = [
      ["Date", "Employee Name", "Department", "Designation", "Type", "Check In Time", "Status"],
      ...filteredRows.map((row) => [exportDate, ...row.slice(0, 6)]),
    ]
    const csv = `\uFEFF${rowsToExport.map((row) => row.join(",")).join("\n")}`

    try {
      if ("showSaveFilePicker" in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: `attendance-${fileDate}.csv`,
          types: [
            {
              description: "CSV file",
              accept: { "text/csv": [".csv"] },
            },
          ],
        })

        const writable = await fileHandle.createWritable()
        await writable.write(csv)
        await writable.close()
        setToastMessage("Exported successfully")
        window.setTimeout(() => setToastMessage(""), 2200)
        return
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        return
      }
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `attendance-${fileDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const addAttendanceRecord = () => {
    const name = window.prompt("Employee Name")
    if (!name || name.trim() === "") return
    const department = window.prompt("Department", "Design")
    if (!department || department.trim() === "") return
    const designation = window.prompt("Designation", "UI/UX Design")
    if (!designation || designation.trim() === "") return
    const type = window.prompt("Type (Office/Remote)", "Office")
    if (!type || type.trim() === "") return
    const checkIn = window.prompt("Check In Time (e.g. 09:30 AM)", "09:30 AM")
    if (!checkIn || checkIn.trim() === "") return
    const status = window.prompt("Status (On Time/Late)", "On Time")
    if (!status || status.trim() === "") return

    setAttendanceRows((prev) => [
      [name.trim(), department.trim(), designation.trim(), type.trim(), checkIn.trim(), status.trim(), "https://i.pravatar.cc/80?img=30", `A${Date.now()}`],
      ...prev,
    ])
  }

  const editAttendanceRecord = (id) => {
    const current = attendanceRows.find((row) => row[7] === id)
    if (!current) return
    const checkIn = window.prompt("Check In Time", current[4])
    if (!checkIn || checkIn.trim() === "") return
    const status = window.prompt("Status (On Time/Late)", current[5])
    if (!status || status.trim() === "") return

    setAttendanceRows((prev) => prev.map((row) => (row[7] === id ? [row[0], row[1], row[2], row[3], checkIn.trim(), status.trim(), row[6], row[7]] : row)))
  }

  const deleteAttendanceRecord = (id) => {
    if (!window.confirm("Delete this attendance record?")) return
    setAttendanceRows((prev) => prev.filter((row) => row[7] !== id))
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:flex-nowrap">
        <div className="flex w-full items-center gap-3 lg:w-auto">
          <div className="relative w-full sm:w-[360px]">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-14 text-sm outline-none focus:border-violet-300"
              placeholder="Search by name, role, department..."
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">⌘ K</span>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
          >
            Filter
            <SlidersHorizontal size={14} className="text-slate-400" />
          </button>
          <button
            type="button"
            onClick={addAttendanceRecord}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white"
          >
            <Plus size={14} />
            Add Record
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          <div className="relative">
            <select
              value={departmentFilter}
              onChange={(event) => setDepartmentFilter(event.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-9 text-sm text-slate-700 outline-none"
            >
              <option>All Departments</option>
              <option>Design</option>
              <option>Engineering</option>
              <option>Sales</option>
              <option>Marketing</option>
              <option>HR</option>
              <option>Analytics</option>
              <option>Healthcare</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={() => {
              setTempDate(selectedDate)
              const parsed = new Date(`${selectedDate}T00:00:00`)
              setCalendarMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1))
              setShowDateModal(true)
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
          >
            <CalendarDays size={14} className="text-slate-500" />
            <span>{selectedDateLabel}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700"
          >
            Export CSV
            <Download size={14} className="text-slate-500" />
          </button>
        </div>
      </div>

      {showDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-[360px] rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Select Date</h3>
            <p className="mt-1 text-sm text-slate-500">Choose date for attendance view</p>

            <div className="mt-4 rounded-xl border border-slate-200 p-3">
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={14} />
                </button>
                <p className="text-sm font-medium text-slate-800">{calendarMonthLabel}</p>
                <button
                  type="button"
                  onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600"
                  aria-label="Next month"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
                {weekdayLabels.map((day) => (
                  <span key={day} className="py-1">
                    {day}
                  </span>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {calendarCells.map((cell) => (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => setTempDate(cell.iso)}
                    className={`h-8 rounded-md text-xs ${
                      cell.iso === tempDate
                        ? "bg-violet-600 font-semibold text-white"
                        : cell.inCurrentMonth
                          ? "text-slate-700 hover:bg-slate-100"
                          : "text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {cell.day}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDateModal(false)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(tempDate)
                  setShowDateModal(false)
                }}
                className="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1240px] text-left">
          <thead className="border-b border-slate-100 text-sm text-slate-400">
            <tr>
              <th className="pb-4 font-medium">Date</th>
              <th className="pb-4 font-medium">Employee Name</th>
              <th className="pb-4 font-medium">Department</th>
              <th className="pb-4 font-medium">Designation</th>
              <th className="pb-4 font-medium">Type</th>
              <th className="pb-4 font-medium">Check In Time</th>
              <th className="pb-4 font-medium">Status</th>
              <th className="pb-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {pagedRows.map((row) => (
              <tr key={row[7]} className="border-b border-slate-100 last:border-0">
                <td className="py-3 text-slate-700">{selectedDateTableLabel}</td>
                <td className="py-3 text-slate-800">
                  <span className="flex items-center gap-3">
                    <img src={row[6]} alt={row[0]} className="h-8 w-8 rounded-full object-cover" />
                    <span className="font-medium">{row[0]}</span>
                  </span>
                </td>
                <td className="py-3 text-slate-700">{row[1]}</td>
                <td className="py-3 text-slate-700">{row[2]}</td>
                <td className="py-3 text-slate-700">{row[3]}</td>
                <td className="py-3 text-slate-700">{row[4]}</td>
                <td className="py-3">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      row[5] === "On Time" ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-400"
                    }`}
                  >
                    {row[5]}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <button type="button" onClick={() => editAttendanceRecord(row[7])}>
                      <Pencil size={15} />
                    </button>
                    <button type="button" onClick={() => deleteAttendanceRecord(row[7])}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {pagedRows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center text-sm text-slate-500">
                  No attendance records found.
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

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[320px] rounded-2xl border border-teal-400 bg-[#effaf7] p-4 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md bg-teal-500 text-white">
                <Check size={12} />
              </span>
              <div>
                <p className="text-[22px] font-semibold leading-tight text-slate-800 sm:text-[20px]">Success</p>
                <p className="mt-1 text-[17px] leading-snug text-slate-600 sm:text-[14px]">{toastMessage}</p>
              </div>
            </div>
            <button type="button" onClick={() => setToastMessage("")} className="text-slate-400 hover:text-slate-600" aria-label="Close toast">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </article>
  )
}

export default AttendancePage
