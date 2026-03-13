import { useEffect, useRef, useMemo, useState } from "react"
import { Calendar, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { createHoliday, deleteHoliday, listHolidays, updateHoliday } from "../services/holidays"

function HolidaysPage({ appearance = "Light" }) {
  const isDark = appearance === "Dark"
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingHolidayId, setEditingHolidayId] = useState("")
  const [holidayDate, setHolidayDate] = useState("")
  const [holidayName, setHolidayName] = useState("")
  const [holidayRows, setHolidayRows] = useState([])
  const [isSavingHoliday, setIsSavingHoliday] = useState(false)
  const [deletingHolidayId, setDeletingHolidayId] = useState("")
  const [openActionHolidayId, setOpenActionHolidayId] = useState("")
  const [loadError, setLoadError] = useState("")
  const [formError, setFormError] = useState("")
  const holidayDateInputRef = useRef(null)

  useEffect(() => {
    let mounted = true
    async function loadHolidayRows() {
      try {
        setLoadError("")
        const rows = await listHolidays()
        if (!mounted) return
        const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "2-digit", year: "numeric" })
        const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" })
        setHolidayRows(
          rows.map((item) => {
            const dateValue = new Date(`${item.holidayDate}T00:00:00`)
            return {
              id: item.id,
              dateValue,
              dateISO: item.holidayDate,
              date: dateFormatter.format(dateValue),
              day: dayFormatter.format(dateValue),
              name: item.holidayName,
            }
          }),
        )
      } catch (error) {
        if (!mounted) return
        setHolidayRows([])
        setLoadError(error?.message || "Unable to load holidays.")
      }
    }
    loadHolidayRows()
    return () => {
      mounted = false
    }
  }, [])

  const sortedHolidayRows = useMemo(() => {
    return [...holidayRows]
      .sort((a, b) => a.dateValue - b.dateValue)
  }, [holidayRows])

  const filteredRows = useMemo(() => {
    return sortedHolidayRows.filter((row) => {
      if (searchQuery.trim() === "") return true
      const q = searchQuery.toLowerCase()
      return [row.date, row.day, row.name].some((value) => value.toLowerCase().includes(q))
    })
  }, [sortedHolidayRows, searchQuery])

  const buildRowFromHoliday = (holiday) => {
    const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "2-digit", year: "numeric" })
    const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" })
    const dateValue = new Date(`${holiday.holidayDate}T00:00:00`)
    return {
      id: holiday.id,
      dateISO: holiday.holidayDate,
      dateValue,
      date: dateFormatter.format(dateValue),
      day: dayFormatter.format(dateValue),
      name: holiday.holidayName,
    }
  }

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
            onChange={(event) => setSearchQuery(event.target.value)}
            className={`w-full rounded-xl border py-2.5 pl-11 pr-3 text-sm outline-none focus:border-[#53c4ae] ${
              isDark ? "border-slate-700 bg-[#0f1720] text-slate-100" : "border-slate-200 bg-white"
            }`}
            placeholder="Search"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddModal(true)
            setEditingHolidayId("")
            setHolidayDate("")
            setHolidayName("")
            setFormError("")
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#53c4ae] px-4 py-2.5 text-sm font-medium text-white"
        >
          <Plus size={15} />
          Add New Holiday
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead className={`border-b text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-100 text-slate-400"}`}>
            <tr>
              <th className="pb-4 font-medium">Date</th>
              <th className="pb-4 font-medium">Day</th>
              <th className="pb-4 font-medium">Holiday Name</th>
              <th className="pb-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredRows.map((row) => (
              <tr key={row.id || `${row.date}-${row.name}`} className={`border-b last:border-0 ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                <td className={`py-2.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  <span className="flex items-center gap-3">
                    <span
                      className={`inline-block h-8 w-0.5 rounded ${
                        row.dateValue >= new Date(new Date().setHours(0, 0, 0, 0)) ? "bg-[#53c4ae]" : isDark ? "bg-slate-600" : "bg-slate-200"
                      }`}
                    />
                    {row.date}
                  </span>
                </td>
                <td className={`py-2.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{row.day}</td>
                <td className={`py-2.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{row.name}</td>
                <td className="py-2.5 text-right">
                  <span className="relative inline-flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenActionHolidayId((prev) => (prev === row.id ? "" : row.id || ""))
                      }}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
                        isDark ? "border-slate-700 bg-[#0f1720] text-slate-300 hover:bg-[#0b1320]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                      aria-label="Open holiday actions"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                    {openActionHolidayId === row.id ? (
                      <span className={`absolute right-0 top-9 z-20 w-[130px] overflow-hidden rounded-lg border shadow-md ${
                        isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"
                      }`}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingHolidayId(row.id || "")
                            setHolidayDate(row.dateISO || "")
                            setHolidayName(row.name || "")
                            setFormError("")
                            setShowAddModal(true)
                            setOpenActionHolidayId("")
                          }}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium ${
                            isDark ? "text-slate-200 hover:bg-[#0f1720]" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <Pencil size={12} />
                          Update
                        </button>
                        <button
                          type="button"
                          disabled={deletingHolidayId === row.id}
                          onClick={async () => {
                            const shouldDelete = window.confirm(`Delete "${row.name}" holiday?`)
                            if (!shouldDelete) return
                            try {
                              setDeletingHolidayId(row.id || "")
                              await deleteHoliday(row.id)
                              setHolidayRows((prev) => prev.filter((item) => item.id !== row.id))
                              setOpenActionHolidayId("")
                            } catch (error) {
                              setLoadError(error?.message || "Unable to delete holiday.")
                            } finally {
                              setDeletingHolidayId("")
                            }
                          }}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-rose-600 disabled:cursor-not-allowed disabled:opacity-60 ${
                            isDark ? "hover:bg-rose-900/25" : "hover:bg-rose-50"
                          }`}
                        >
                          <Trash2 size={12} />
                          {deletingHolidayId === row.id ? "Deleting..." : "Delete"}
                        </button>
                      </span>
                    ) : null}
                  </span>
                </td>
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={4} className={`py-10 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  No holidays found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={`mt-4 flex items-center gap-6 text-[13px] ${isDark ? "text-slate-300" : "text-slate-700"}`}>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#53c4ae]" />
          <span className="font-medium">Upcoming</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isDark ? "bg-slate-600" : "bg-slate-300"}`} />
          <span className="font-medium">Past Holidays</span>
        </span>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className={`w-full max-w-[420px] rounded-2xl p-5 shadow-xl ${isDark ? "border border-slate-700 bg-[#0f1720]" : "bg-white"}`}>
            <h3 className={`text-[18px] font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {editingHolidayId ? "Edit Holiday" : "Add New Holiday"}
            </h3>
            <div className={`my-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`} />

            <div className="space-y-4">
              <label className="block">
                <span className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Date</span>
                <div className="relative">
                  <input
                    ref={holidayDateInputRef}
                    type="date"
                    value={holidayDate}
                    onChange={(event) => setHolidayDate(event.target.value)}
                    onClick={(event) => event.currentTarget.showPicker?.()}
                    onFocus={(event) => event.currentTarget.showPicker?.()}
                    className={`w-full rounded-xl border px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#53c4ae] ${
                      isDark ? "border-slate-700 bg-[#111a24] text-slate-100" : "border-slate-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => holidayDateInputRef.current?.showPicker?.()}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    aria-label="Open date picker"
                  >
                    <Calendar size={16} />
                  </button>
                </div>
              </label>

              <label className="block">
                <span className={`mb-1 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>Holiday Name</span>
                <input
                  type="text"
                  value={holidayName}
                  onChange={(event) => setHolidayName(event.target.value)}
                  placeholder="Enter holiday name"
                  className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:border-[#53c4ae] ${
                    isDark ? "border-slate-700 bg-[#111a24] text-slate-100 placeholder:text-slate-400" : "border-slate-200"
                  }`}
                />
              </label>
            </div>

            {formError && <p className="mt-3 text-sm text-rose-500">{formError}</p>}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false)
                  setEditingHolidayId("")
                  setHolidayDate("")
                  setHolidayName("")
                  setFormError("")
                }}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium ${
                  isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!holidayDate || !holidayName.trim()) {
                    setFormError("Please fill date and holiday name.")
                    return
                  }

                  try {
                    setIsSavingHoliday(true)
                    const saved = editingHolidayId
                      ? await updateHoliday(editingHolidayId, holidayDate, holidayName.trim())
                      : await createHoliday(holidayDate, holidayName.trim())
                    setHolidayRows((prev) => {
                      const mapped = buildRowFromHoliday(saved)
                      const withoutSameDate = prev.filter(
                        (item) => item.dateISO !== saved.holidayDate && item.id !== saved.id,
                      )
                      return [...withoutSameDate, mapped]
                    })
                    setShowAddModal(false)
                    setEditingHolidayId("")
                    setHolidayDate("")
                    setHolidayName("")
                    setFormError("")
                  } catch (error) {
                    setFormError(error?.message || "Unable to save holiday.")
                  } finally {
                    setIsSavingHoliday(false)
                  }
                }}
                disabled={isSavingHoliday}
                className="flex-1 rounded-xl bg-[#53c4ae] px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingHoliday ? "Saving..." : editingHolidayId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export default HolidaysPage
