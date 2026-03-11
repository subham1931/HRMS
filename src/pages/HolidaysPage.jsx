import { useRef, useMemo, useState } from "react"
import { Calendar, Plus, Search } from "lucide-react"

const CURRENT_YEAR = new Date().getFullYear()

const yearlyHolidaySeed = [
  ["01-01", "New Year Day"],
  ["01-26", "Republic Day"],
  ["01-30", "Martyrs' Day"],
  ["02-14", "Valentine's Day"],
  ["02-19", "Chhatrapati Shivaji Maharaj Jayanti"],
  ["02-26", "Maha Shivaratri"],
  ["03-08", "International Women's Day"],
  ["03-14", "Holi"],
  ["03-23", "Shaheed Diwas"],
  ["03-31", "Eid al-Fitr"],
  ["04-06", "Ram Navami"],
  ["04-10", "Mahavir Jayanti"],
  ["04-14", "Ambedkar Jayanti"],
  ["04-18", "Good Friday"],
  ["05-01", "Labor Day"],
  ["05-12", "Buddha Purnima"],
  ["06-21", "International Yoga Day"],
  ["06-07", "Eid al-Adha"],
  ["07-06", "Muharram"],
  ["08-09", "Raksha Bandhan"],
  ["08-15", "Independence Day"],
  ["08-27", "Ganesh Chaturthi"],
  ["09-05", "Milad-un-Nabi"],
  ["09-16", "Onam"],
  ["10-01", "Maha Navami"],
  ["10-02", "Gandhi Jayanti"],
  ["10-03", "Dussehra"],
  ["10-20", "Diwali"],
  ["10-21", "Govardhan Puja"],
  ["10-22", "Bhai Dooj"],
  ["11-01", "Kannada Rajyotsava"],
  ["11-05", "Guru Nanak Jayanti"],
  ["11-14", "Children's Day"],
  ["11-24", "Guru Tegh Bahadur Martyrdom Day"],
  ["12-18", "International Migrants Day"],
  ["12-25", "Christmas Day"],
  ["12-31", "New Year's Eve"],
]

function HolidaysPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [holidayDate, setHolidayDate] = useState("")
  const [holidayName, setHolidayName] = useState("")
  const [customHolidays, setCustomHolidays] = useState([])
  const [formError, setFormError] = useState("")
  const holidayDateInputRef = useRef(null)

  const holidayRows = useMemo(() => {
    const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "2-digit", year: "numeric" })
    const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" })

    const baseRows = yearlyHolidaySeed
      .map(([monthDay, name]) => {
        const dateValue = new Date(`${CURRENT_YEAR}-${monthDay}T00:00:00`)
        return {
          dateValue,
          date: dateFormatter.format(dateValue),
          day: dayFormatter.format(dateValue),
          name,
        }
      })

    return [...baseRows, ...customHolidays]
      .sort((a, b) => a.dateValue - b.dateValue)
  }, [customHolidays])

  const filteredRows = useMemo(() => {
    return holidayRows.filter((row) => {
      if (searchQuery.trim() === "") return true
      const q = searchQuery.toLowerCase()
      return [row.date, row.day, row.name].some((value) => value.toLowerCase().includes(q))
    })
  }, [holidayRows, searchQuery])

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-[330px]">
          <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-3 text-sm outline-none focus:border-[#53c4ae]"
            placeholder="Search"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddModal(true)
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
          <thead className="border-b border-slate-100 text-sm text-slate-400">
            <tr>
              <th className="pb-4 font-medium">Date</th>
              <th className="pb-4 font-medium">Day</th>
              <th className="pb-4 font-medium">Holiday Name</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredRows.map((row) => (
              <tr key={`${row.date}-${row.name}`} className="border-b border-slate-100 last:border-0">
                <td className="py-2.5 text-slate-700">
                  <span className="flex items-center gap-3">
                    <span
                      className={`inline-block h-8 w-0.5 rounded ${
                        row.dateValue >= new Date(new Date().setHours(0, 0, 0, 0)) ? "bg-[#53c4ae]" : "bg-slate-200"
                      }`}
                    />
                    {row.date}
                  </span>
                </td>
                <td className="py-2.5 text-slate-700">{row.day}</td>
                <td className="py-2.5 text-slate-700">{row.name}</td>
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={3} className="py-10 text-center text-sm text-slate-500">
                  No holidays found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-6 text-[13px] text-slate-700">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#53c4ae]" />
          <span className="font-medium">Upcoming</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          <span className="font-medium">Past Holidays</span>
        </span>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-[420px] rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-[18px] font-semibold text-slate-900">Add New Holiday</h3>
            <div className="my-4 border-t border-slate-200" />

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Date</span>
                <div className="relative">
                  <input
                    ref={holidayDateInputRef}
                    type="date"
                    value={holidayDate}
                    onChange={(event) => setHolidayDate(event.target.value)}
                    onClick={(event) => event.currentTarget.showPicker?.()}
                    onFocus={(event) => event.currentTarget.showPicker?.()}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-[#53c4ae]"
                  />
                  <button
                    type="button"
                    onClick={() => holidayDateInputRef.current?.showPicker?.()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    aria-label="Open date picker"
                  >
                    <Calendar size={16} />
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Holiday Name</span>
                <input
                  type="text"
                  value={holidayName}
                  onChange={(event) => setHolidayName(event.target.value)}
                  placeholder="Enter holiday name"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#53c4ae]"
                />
              </label>
            </div>

            {formError && <p className="mt-3 text-sm text-rose-500">{formError}</p>}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false)
                  setHolidayDate("")
                  setHolidayName("")
                  setFormError("")
                }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!holidayDate || !holidayName.trim()) {
                    setFormError("Please fill date and holiday name.")
                    return
                  }

                  const dateValue = new Date(`${holidayDate}T00:00:00`)
                  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "2-digit", year: "numeric" })
                  const dayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" })

                  setCustomHolidays((prev) => {
                    const next = [
                      ...prev,
                      {
                        dateISO: holidayDate,
                        dateValue,
                        date: dateFormatter.format(dateValue),
                        day: dayFormatter.format(dateValue),
                        name: holidayName.trim(),
                      },
                    ]
                    return next
                  })
                  setShowAddModal(false)
                  setHolidayDate("")
                  setHolidayName("")
                  setFormError("")
                }}
                className="flex-1 rounded-xl bg-[#53c4ae] px-4 py-2.5 text-sm font-medium text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export default HolidaysPage
