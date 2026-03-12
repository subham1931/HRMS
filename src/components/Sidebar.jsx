import {
  Calendar,
  CalendarCheck2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  LayoutGrid,
  Settings,
  Users,
} from "lucide-react"
import { useEffect, useState } from "react"

const menuItems = [
  { label: "Dashboard", icon: LayoutGrid, to: "/dashboard" },
  { label: "All Employees", icon: Users, to: "/employees" },
  { label: "Attendance", icon: CalendarCheck2, to: "/attendance" },
  { label: "Payroll", icon: ClipboardList, to: "/payroll" },
  { label: "Leaves", icon: CalendarDays, to: "/leaves" },
  { label: "Calendar", icon: CalendarDays, to: "/calendar" },
  { label: "Holidays", icon: Calendar, to: "/holidays" },
  {
    label: "Setup",
    icon: Settings,
    to: "/setup",
    children: [
      { label: "Departments", to: "/departments" },
      { label: "Offices", to: "/offices" },
      { label: "Leaves", to: "/setup/leaves" },
    ],
  },
  { label: "Settings", icon: Settings, to: "/settings" },
]

function isPathActive(pathname, to) {
  if (to === "/employees") return pathname.startsWith("/employees")
  if (to === "/leaves") return pathname.startsWith("/leaves")
  return pathname === to
}

function Sidebar({ pathname, onNavigate, mobile = false }) {
  const setupItem = menuItems.find((item) => item.label === "Setup")
  const setupHasActiveChild = (setupItem?.children || []).some((child) => isPathActive(pathname, child.to))
  const setupIsActive = isPathActive(pathname, "/setup") || setupHasActiveChild
  const [setupOpen, setSetupOpen] = useState(setupIsActive)

  useEffect(() => {
    if (setupIsActive) setSetupOpen(true)
  }, [setupIsActive])

  const asideClassName = mobile
    ? "h-[calc(100dvh-72px)] w-[280px] shrink-0 overflow-y-auto border-r border-slate-200 bg-[#f7f7fa] p-5"
    : "sticky top-[103px] hidden h-[calc(100dvh-103px)] w-[260px] shrink-0 self-start overflow-y-auto rounded-2xl border border-slate-200 bg-[#f7f7fa] p-5 xl:flex xl:flex-col"

  return (
    <aside className={asideClassName}>
      <nav className="space-y-1 px-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isSetup = item.label === "Setup"
          const isActive = isSetup ? setupIsActive : isPathActive(pathname, item.to)

          return (
            <div key={item.to}>
              <button
                type="button"
                onClick={() => {
                  if (isSetup) {
                    setSetupOpen((open) => !open)
                    return
                  }
                  onNavigate(item.to)
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] ${
                  isActive ? "bg-slate-100 font-semibold text-slate-800" : "text-slate-700"
                }`}
              >
                <Icon size={17} strokeWidth={1.75} />
                <span className="flex-1">{item.label}</span>
                {isSetup && (
                  <ChevronDown
                    size={16}
                    strokeWidth={1.9}
                    className={`transition-transform ${setupOpen ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {isSetup && setupOpen && (
                <div className="mt-1 space-y-1 pl-9 pr-2">
                  {item.children.map((child) => {
                    const childActive = isPathActive(pathname, child.to)
                    return (
                      <button
                        key={child.to}
                        type="button"
                        onClick={() => onNavigate(child.to)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                          childActive ? "bg-slate-100 font-semibold text-slate-800" : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {child.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
