import { Bell, ChevronDown } from "lucide-react"

function TopNavbar({ onNotificationClick, notificationsOpen = false }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between rounded-2xl border border-slate-200 bg-[#f7f7fa] px-5 py-4">
      <div className="flex items-center gap-2 text-xl font-semibold">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-600">∞</span>
        <span className="text-[24px] tracking-tight">HRMS</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onNotificationClick}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${
            notificationsOpen ? "border-violet-200 bg-violet-50 text-violet-600" : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          <Bell size={16} />
        </button>
        <button type="button" className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5 md:flex">
          <span className="h-8 w-8 rounded-full bg-violet-100" />
          <span className="text-left">
            <span className="block text-sm font-semibold leading-none">Robert Allen</span>
            <span className="mt-1 block text-xs text-slate-500">HR Manager</span>
          </span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
      </div>
    </header>
  )
}

export default TopNavbar
