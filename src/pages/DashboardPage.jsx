import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Calendar, LayoutGrid, MoreVertical } from "lucide-react"
import { useNavigate } from "react-router-dom"

const statCards = [
  { title: "Total Employee", value: "560", updated: "Updated: July 16, 2025", change: "+12%" },
  { title: "Total Applicant", value: "1050", updated: "Updated: July 14, 2025", change: "+5%" },
  { title: "Today Attendance", value: "470", updated: "Updated: July 14, 2025", change: "-8%" },
  { title: "Total Projects", value: "250", updated: "Updated: July 10, 2025", change: "+12%" },
]

const chartRangeData = {
  daily: {
    labels: ["01 Aug", "02 Aug", "03 Aug", "04 Aug", "07 Aug", "08 Aug", "09 Aug", "10 Aug", "11 Aug", "14 Aug", "15 Aug", "16 Aug"],
    values: [58, 72, 59, 74, 84, 55, 73, 39, 60, 73, 59, 40],
  },
  weekly: {
    labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
    values: [64, 70, 78, 69, 83, 76, 81, 74],
  },
  monthly: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    values: [71, 74, 69, 77, 82, 79, 85, 81, 76, 80, 78, 84],
  },
}

const attendanceRows = [
  ["Aarav Sharma", "Team Lead - Design", "Office", "09:27 AM", "06:18 PM", "On Time"],
  ["Rohan Verma", "Web Designer", "Office", "10:15 AM", "07:05 PM", "Late"],
  ["Arjun Patel", "Medical Assistant", "Remote", "10:24 AM", "06:44 PM", "Late"],
  ["Meera Joshi", "Marketing Coordinator", "Office", "09:10 AM", "06:11 PM", "On Time"],
  ["Rahul Desai", "Data Analyst", "Office", "09:15 AM", "06:23 PM", "On Time"],
  ["Karan Malhotra", "Phyton Developer", "Remote", "09:29 AM", "06:52 PM", "On Time"],
  ["Nisha Rao", "React JS Developer", "Remote", "11:30 AM", "08:10 PM", "Late"],
]

const scheduleItems = [
  { dayLabel: "Wednesday, 06 July 2023" },
  { time: "09:30", role: "UI/UX Designer", title: "Practical Task Review" },
  { time: "12:00", role: "Magento Developer", title: "Resume Review" },
  { time: "01:30", role: "Sales Manager", title: "Find HR Round" },
  { dayLabel: "Thursday, 07 July 2023" },
  { time: "09:30", role: "Front end Developer", title: "Practical Task Review" },
  { time: "11:00", role: "React JS", title: "TL Meeting" },
  { time: "12:30", role: "Product Designer", title: "Wireframe Review" },
  { dayLabel: "Friday, 08 July 2023" },
  { time: "09:00", role: "HR Team", title: "Hiring Pipeline Sync" },
  { time: "10:30", role: "Backend Team", title: "API Status Check" },
  { time: "01:00", role: "Sales Team", title: "Quarterly Targets" },
  { time: "03:30", role: "Project Manager", title: "Sprint Planning" },
]

const tableAvatarColors = ["bg-rose-100", "bg-amber-100", "bg-violet-100", "bg-teal-100", "bg-orange-100", "bg-cyan-100", "bg-pink-100"]

function buildSmoothPath(points) {
  if (!points.length) return ""
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] || p2

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }
  return path
}

function DashboardPage() {
  const navigate = useNavigate()
  const chartContainerRef = useRef(null)
  const [chartRange, setChartRange] = useState("daily")
  const [chartSize, setChartSize] = useState({ width: 920, height: 260 })
  const activeChartData = chartRangeData[chartRange]
  const { labels: comparisonLabels, values: comparisonValues } = activeChartData
  const chartWidth = chartSize.width
  const chartHeight = chartSize.height
  const paddingX = chartWidth < 700 ? 40 : 58
  const paddingTop = 24
  const paddingBottom = chartWidth < 700 ? 30 : 34
  const plotHeight = chartHeight - paddingTop - paddingBottom
  const stepX = (chartWidth - paddingX * 2) / (comparisonValues.length - 1)
  const xLabelStep = chartWidth < 700 ? 2 : 1
  const points = comparisonValues.map((value, index) => {
    const x = paddingX + index * stepX
    const y = paddingTop + (100 - value) / 100 * plotHeight
    return { x, y, value, label: comparisonLabels[index] }
  })
  const linePath = buildSmoothPath(points)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
  const highlightedIndex = points.reduce((bestIndex, point, index, list) => (point.value > list[bestIndex].value ? index : bestIndex), 0)
  const highlightedPoint = points[highlightedIndex]

  useEffect(() => {
    const container = chartContainerRef.current
    if (!container) return

    const updateChartSize = () => {
      const nextWidth = Math.max(320, Math.floor(container.clientWidth))
      const nextHeight = nextWidth < 640 ? 220 : 260
      setChartSize((prev) => (prev.width === nextWidth && prev.height === nextHeight ? prev : { width: nextWidth, height: nextHeight }))
    }

    updateChartSize()

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateChartSize)
      return () => window.removeEventListener("resize", updateChartSize)
    }

    const observer = new ResizeObserver(updateChartSize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

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

          <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[18px] font-semibold leading-tight tracking-tight text-slate-800 sm:text-[20px] lg:text-[24px]">
                Attendance Comparison
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:gap-5 sm:text-sm">
                <button
                  type="button"
                  onClick={() => setChartRange("daily")}
                  className={`inline-flex items-center gap-2 ${chartRange === "daily" ? "text-indigo-500" : "text-slate-500"}`}
                >
                  <span className={`h-2 w-2 rounded-full ${chartRange === "daily" ? "bg-indigo-500" : "border border-slate-500"}`} />
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => setChartRange("weekly")}
                  className={`inline-flex items-center gap-2 ${chartRange === "weekly" ? "text-indigo-500" : "text-slate-500"}`}
                >
                  <span className={`h-2 w-2 rounded-full ${chartRange === "weekly" ? "bg-indigo-500" : "border border-slate-500"}`} />
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setChartRange("monthly")}
                  className={`inline-flex items-center gap-2 ${chartRange === "monthly" ? "text-indigo-500" : "text-slate-500"}`}
                >
                  <span className={`h-2 w-2 rounded-full ${chartRange === "monthly" ? "bg-indigo-500" : "border border-slate-500"}`} />
                  Monthly
                </button>
              </div>
            </div>

            <div ref={chartContainerRef} className="w-full overflow-hidden rounded-xl">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-[220px] w-full sm:h-[260px]">
                <defs>
                  <linearGradient id="attendanceLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4F6DFF" />
                    <stop offset="100%" stopColor="#3559F6" />
                  </linearGradient>
                  <linearGradient id="attendanceAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4F6DFF" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#4F6DFF" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {[0, 20, 40, 60, 80, 100].map((level) => {
                  const y = paddingTop + (100 - level) / 100 * plotHeight
                  return (
                    <g key={level}>
                      <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#E5E7EB" strokeWidth="1" />
                      <text x={paddingX - 14} y={y + 4} fontSize={chartWidth < 700 ? "10" : "12"} fill="#94A3B8" textAnchor="end">
                        {level}
                      </text>
                    </g>
                  )
                })}

                {points.map((point, index) => (
                  <line
                    key={`v-${point.label}`}
                    x1={point.x}
                    y1={paddingTop}
                    x2={point.x}
                    y2={chartHeight - paddingBottom}
                    stroke="#F1F5F9"
                    strokeWidth="1"
                    opacity={index % xLabelStep === 0 || index === highlightedIndex ? 1 : 0.45}
                  />
                ))}

                <rect
                  x={highlightedPoint.x - 16}
                  y={highlightedPoint.y}
                  width="32"
                  height={Math.max(8, chartHeight - paddingBottom - highlightedPoint.y)}
                  fill="#C7D2FE"
                  opacity="0.35"
                  rx="4"
                  className="chart-highlight-animate"
                />

                <path
                  key={`area-${chartRange}`}
                  d={areaPath}
                  fill="url(#attendanceAreaGradient)"
                  className="chart-area-animate"
                />

                <path
                  key={`line-shadow-${chartRange}`}
                  d={linePath}
                  fill="none"
                  stroke="#3559F6"
                  strokeOpacity="0.2"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="chart-line-animate"
                />

                <path
                  key={`line-main-${chartRange}`}
                  d={linePath}
                  fill="none"
                  stroke="url(#attendanceLineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="100"
                  className="chart-line-animate"
                />

                {points.map((point, index) => (
                  <circle
                    key={`${chartRange}-p-${point.label}`}
                    cx={point.x}
                    cy={point.y}
                    r={index === highlightedIndex ? "8" : "5"}
                    fill={index === highlightedIndex ? "#3559F6" : "#FFFFFF"}
                    stroke="#3559F6"
                    strokeWidth="2"
                    className="chart-point-animate"
                    style={{ animationDelay: `${index * 70}ms` }}
                  />
                ))}

                <text
                  x={highlightedPoint.x + 10}
                  y={highlightedPoint.y - 14}
                  fontSize="20"
                  fontWeight="600"
                  fill="#64748B"
                  className="chart-value-animate"
                >
                  {highlightedPoint.value}%
                </text>

                {points.map((point, index) => (
                  <text
                    key={`${chartRange}-l-${point.label}`}
                    x={point.x}
                    y={chartHeight - 6}
                    fontSize={chartWidth < 700 ? "10" : "12"}
                    fill="#6B7280"
                    textAnchor="middle"
                    opacity={index % xLabelStep === 0 || index === highlightedIndex ? 1 : 0}
                  >
                    {point.label}
                  </text>
                ))}
              </svg>
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

      <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <h2 className="text-[18px] font-semibold tracking-tight sm:text-[20px]">Attendance Overview</h2>
          <button
            type="button"
            onClick={() => navigate("/attendance")}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500 sm:px-3 sm:text-sm"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs sm:min-w-[760px] sm:text-sm">
            <thead className="text-slate-400/90">
              <tr>
                <th className="pb-3 font-medium">Employee Name</th>
                <th className="hidden pb-3 font-medium md:table-cell">Designation</th>
                <th className="hidden pb-3 font-medium sm:table-cell">Type</th>
                <th className="pb-3 font-medium">Check In Time</th>
                <th className="pb-3 font-medium">Check Out Time</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.map((row, index) => (
                <tr key={row[0]} className="border-t border-slate-100">
                  <td className="py-3 font-medium">
                    <span className="flex items-center gap-2.5 sm:gap-3">
                      <span className={`inline-block h-8 w-8 rounded-full sm:h-9 sm:w-9 ${tableAvatarColors[index % tableAvatarColors.length]}`} />
                      {row[0]}
                    </span>
                  </td>
                  <td className="hidden py-3 text-slate-600 md:table-cell">{row[1]}</td>
                  <td className="hidden py-3 text-slate-600 sm:table-cell">{row[2]}</td>
                  <td className="py-3 text-slate-600">{row[3]}</td>
                  <td className="py-3 text-slate-600">{row[4]}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                        row[5] === "On Time" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                      }`}
                    >
                      {row[5]}
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
