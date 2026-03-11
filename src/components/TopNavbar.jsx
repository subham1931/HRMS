import { useEffect, useRef, useState } from "react"
import { Bell, ChevronDown, LogOut, Menu, UserRound } from "lucide-react"

function TopNavbar({
  onNotificationClick,
  onProfileClick,
  onMenuClick,
  onLogout,
  notificationsOpen = false,
  mode = "app",
  publicActionLabel = "Sign In",
  onPublicAction,
  showPublicAction = true,
  onBrandClick,
  userName = "Admin User",
  userRole = "Admin",
  userImage = "",
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef(null)
  const isPublic = mode === "public"
  const initials = (userName || "A")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("")

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
        {!isPublic && (
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 xl:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={onBrandClick}
          className={`flex min-w-0 items-center gap-2 text-left ${onBrandClick ? "cursor-pointer" : "cursor-default"}`}
        >
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-white shadow-sm">
            H
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[18px] font-semibold leading-none tracking-tight text-slate-900 sm:text-[20px] lg:text-[22px]">
              HRMS
            </span>
            <span className="block truncate pt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
              People Ops
            </span>
          </span>
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {isPublic && showPublicAction ? (
          <button
            type="button"
            onClick={onPublicAction}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            {publicActionLabel}
          </button>
        ) : !isPublic ? (
          <>
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
                {userImage ? (
                  <img src={userImage} alt={userName} className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">
                    {initials || "A"}
                  </span>
                )}
                <ChevronDown size={13} className={`text-slate-400 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`} />
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5 md:flex"
                aria-label="Open profile menu"
                aria-expanded={mobileMenuOpen}
              >
                {userImage ? (
                  <img src={userImage} alt={userName} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                    {initials || "A"}
                  </span>
                )}
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
                    onClick={() => {
                      setMobileMenuOpen(false)
                      onLogout?.()
                    }}
                    className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-[#F55353]"
                  >
                    <LogOut size={17} />
                    <span className="text-[15px] leading-none">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </header>
  )
}

export default TopNavbar
