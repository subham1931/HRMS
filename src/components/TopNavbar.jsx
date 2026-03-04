import { useEffect, useRef, useState } from "react"
import { Bell, ChevronDown, LogOut, Menu, UserRound } from "lucide-react"

function TopNavbar({ onNotificationClick, onProfileClick, onMenuClick, notificationsOpen = false }) {
  const userName = "Priya Sharma"
  const userRole = "HR Manager"
  const userImage = "https://i.pravatar.cc/80?img=47"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef(null)

  useEffect(() => {
    if (!mobileMenuOpen) return

    function handleOutsideClick(event) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [mobileMenuOpen])

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between rounded-2xl border border-slate-200 bg-[#f7f7fa] px-3 py-3 sm:px-4 sm:py-3.5 lg:px-5 lg:py-4">
      <div className="flex min-w-0 items-center gap-2 font-semibold">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 xl:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={16} />
        </button>
        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 sm:h-7 sm:w-7">∞</span>
        <span className="truncate text-[20px] tracking-tight sm:text-[22px] lg:text-[24px]">HRMS</span>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onNotificationClick}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border sm:h-10 sm:w-10 ${
            notificationsOpen ? "border-violet-200 bg-violet-50 text-violet-600" : "border-slate-200 bg-white text-slate-500"
          }`}
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>
        <div ref={mobileMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 md:hidden"
            aria-label="Open profile menu"
            aria-expanded={mobileMenuOpen}
          >
            <img src={userImage} alt={userName} className="h-7 w-7 rounded-full object-cover" />
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5 md:flex"
            aria-label="Open profile menu"
            aria-expanded={mobileMenuOpen}
          >
            <img src={userImage} alt={userName} className="h-8 w-8 rounded-full object-cover" />
            <span className="text-left">
              <span className="block text-sm font-semibold leading-none">{userName}</span>
              <span className="mt-1 block text-xs text-slate-500">{userRole}</span>
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {mobileMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] z-40 min-w-[205px] rounded-2xl bg-white p-3 shadow-md">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  onProfileClick?.()
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-[#2E2E2E]"
              >
                <UserRound size={17} />
                <span className="text-[15px] leading-none">My Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-[#F55353]"
              >
                <LogOut size={17} />
                <span className="text-[15px] leading-none">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopNavbar
