import { ArrowLeft, ArrowRight, Calendar, ChevronDown, LayoutGrid, MoreVertical } from "lucide-react"
import { attendanceRows, chartDays, scheduleItems, statCards, tableAvatarColors } from "../data/mockData"

function DashboardPage() {
  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[1.82fr_1fr]">
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {statCards.map((card) => (
              <article key={card.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="space-y-4 p-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                      <LayoutGrid size={14} />
                    </span>
                    <p className="text-sm text-slate-500">{card.title}</p>
                  </div>

                  <div className="flex items-end justify-between">
                    <p className="text-[42px] font-semibold leading-none tracking-tight">{card.value}</p>
                    <span
                      className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                        card.change.startsWith("+") ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-500"
                      }`}
                    >
                      {card.change}
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-200 px-5 py-2.5">
                  <p className="text-xs text-slate-500">{card.updated.replace("Updated:", "Update:")}</p>
                </div>
              </article>
            ))}
          </div>

          <article className="flex h-[500px] flex-col rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[20px] font-semibold tracking-tight">Attendance Overview</h2>
              <button type="button" className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-500">
                Today
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[44px_1fr] gap-3">
              <div className="flex h-full flex-col justify-between text-xs text-slate-500">
                <span>100%</span>
                <span>80%</span>
                <span>60%</span>
                <span>40%</span>
                <span>20%</span>
                <span>0</span>
              </div>

              <div className="grid h-full grid-cols-7 items-end gap-6">
                {chartDays.map((bar) => (
                  <div key={bar.day} className="flex flex-col items-center gap-3">
                    <div className="flex h-[85%] w-3 flex-col justify-end gap-1.5">
                      <span className={`w-full rounded-full bg-violet-500 ${bar.blue}`} />
                      <span className={`w-full rounded-full bg-amber-400 ${bar.amber}`} />
                      <span className={`w-full rounded-full bg-rose-500 ${bar.red}`} />
                    </div>
                    <span className="text-xs text-slate-500">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>

        <aside className="flex h-[874px] min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[20px] font-semibold leading-none tracking-tight">My Schedule</h2>
            <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
              <Calendar size={14} />
            </button>
          </div>

          <div className="mb-5 rounded-xl border border-slate-100 p-4">
            <div className="mb-3 flex items-center justify-between">
              <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-200 text-slate-700">
                <ArrowLeft size={14} />
              </button>
              <p className="font-semibold">July, 2025</p>
              <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-200 text-slate-700">
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-slate-500">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((label) => (
                <span key={label}>{label}</span>
              ))}

              {Array.from({ length: 2 }).map((_, idx) => (
                <span key={`empty-${idx}`} />
              ))}
              {Array.from({ length: 30 }, (_, idx) => {
                const day = idx + 1

                return (
                  <span
                    key={day}
                    className={`mx-auto inline-flex h-7 w-7 items-center justify-center rounded-full ${
                      day === 6 || day === 8 ? "bg-slate-700 font-semibold text-white" : ""
                    }`}
                  >
                    {day}
                  </span>
                )
              })}
            </div>
          </div>

          <div className="hide-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {scheduleItems.map((item, index) =>
              item.dayLabel ? (
                <div
                  key={item.dayLabel}
                  className="sticky top-0 z-10 flex items-center justify-between border-y border-slate-100 bg-white py-2 text-sm text-slate-500"
                >
                  <p>{item.dayLabel}</p>
                  <MoreVertical size={15} />
                </div>
              ) : (
                <div key={`${item.time}-${index}`} className="grid grid-cols-[64px_1fr] gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <p className="pt-1 text-[18px] font-semibold leading-none tracking-tight">{item.time}</p>
                  <div className="border-l-2 border-slate-200 pl-3">
                    <p className="text-sm text-slate-500">{item.role}</p>
                    <p className="font-semibold">{item.title}</p>
                  </div>
                </div>
              ),
            )}
          </div>
        </aside>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold tracking-tight">Attendance Overview</h2>
          <button type="button" className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-500">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-slate-400/90">
              <tr>
                <th className="pb-3 font-medium">Employee Name</th>
                <th className="pb-3 font-medium">Designation</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Check In Time</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.map((row, index) => (
                <tr key={row[0]} className="border-t border-slate-100">
                  <td className="py-3 font-medium">
                    <span className="flex items-center gap-3">
                      <span className={`inline-block h-9 w-9 rounded-full ${tableAvatarColors[index % tableAvatarColors.length]}`} />
                      {row[0]}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600">{row[1]}</td>
                  <td className="py-3 text-slate-600">{row[2]}</td>
                  <td className="py-3 text-slate-600">{row[3]}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                        row[4] === "On Time" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                      }`}
                    >
                      {row[4]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  )
}

export default DashboardPage
