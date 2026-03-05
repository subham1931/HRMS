import {
  Building2,
  Calendar,
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  Settings,
  Users,
} from "lucide-react"

const menuItems = [
  { label: "Dashboard", icon: LayoutGrid, to: "/dashboard" },
  { label: "All Employees", icon: Users, to: "/employees" },
  { label: "All Departments", icon: Building2, to: "/departments" },
  { label: "Attendance", icon: CalendarCheck2, to: "/attendance" },
  { label: "Payroll", icon: ClipboardList, to: "/payroll" },
  { label: "Leaves", icon: CalendarDays, to: "/leaves" },
  { label: "Holidays", icon: Calendar, to: "/holidays" },
  { label: "Settings", icon: Settings, to: "/settings" },
]

function Sidebar({ pathname, onNavigate, mobile = false }) {
  const asideClassName = mobile
    ? "h-[calc(100dvh-72px)] w-[280px] shrink-0 overflow-y-auto border-r border-slate-200 bg-[#f7f7fa] p-5"
    : "sticky top-[103px] hidden h-[calc(100dvh-103px)] w-[260px] shrink-0 self-start overflow-y-auto rounded-2xl border border-slate-200 bg-[#f7f7fa] p-5 xl:flex xl:flex-col"

  return (
    <aside className={asideClassName}>
      <nav className="space-y-1 px-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = item.to === "/employees" ? pathname.startsWith("/employees") : pathname === item.to

          return (
            <button
              key={item.to}
              type="button"
              onClick={() => onNavigate(item.to)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] ${
                isActive ? "bg-slate-100 font-semibold text-slate-800" : "text-slate-700"
              }`}
            >
              <Icon size={17} strokeWidth={1.75} />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
