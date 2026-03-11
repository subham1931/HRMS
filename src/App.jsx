import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { X } from "lucide-react"
import NotificationsPanel from "./components/NotificationsPanel"
import Sidebar from "./components/Sidebar"
import TopNavbar from "./components/TopNavbar"
import DashboardPage from "./pages/DashboardPage"
import EmployeesPage from "./pages/EmployeesPage"
import AddEmployeePage from "./pages/AddEmployeePage"
import EditEmployeePage from "./pages/EditEmployeePage"
import DepartmentsPage from "./pages/DepartmentsPage"
import AttendancePage from "./pages/AttendancePage"
import PayrollPage from "./pages/PayrollPage"
import LeavesPage from "./pages/LeavesPage"
import LeaveRequestDetailsPage from "./pages/LeaveRequestDetailsPage"
import LeaveCalendarPage from "./pages/LeaveCalendarPage"
import HolidaysPage from "./pages/HolidaysPage"
import SettingsPage from "./pages/SettingsPage"
import ProfilePage from "./pages/ProfilePage"
import PlaceholderPage from "./pages/PlaceholderPage"
import LandingPage from "./pages/LandingPage"
import SignInPage from "./pages/SignInPage"

const AUTH_STORAGE_KEY = "hrms_is_authenticated"
const PUBLIC_PATHS = new Set(["/", "/signin"])

function App() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false
    return window.localStorage.getItem(AUTH_STORAGE_KEY) === "true"
  })
  useEffect(() => {
    if (pathname === "/signin" && isAuthenticated) {
      navigate("/dashboard", { replace: true })
      return
    }
    if (PUBLIC_PATHS.has(pathname)) return
    if (!isAuthenticated) {
      navigate("/signin", { replace: true })
    }
  }, [isAuthenticated, navigate, pathname])

  const handleSignIn = () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "true")
    setIsAuthenticated(true)
    navigate("/dashboard", { replace: true })
  }

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    setIsAuthenticated(false)
    setMobileSidebarOpen(false)
    navigate("/signin", { replace: true })
  }

  const handlePublicNavigation = (nextPath) => {
    navigate(nextPath)
  }

  if (pathname === "/") {
    return <LandingPage onGetStarted={() => handlePublicNavigation("/signin")} />
  }

  if (pathname === "/signin") {
    if (isAuthenticated) return null
    return (
      <SignInPage
        onSignIn={handleSignIn}
        onBackToLanding={() => handlePublicNavigation("/")}
      />
    )
  }

  const routeContent = {
    "/dashboard": <DashboardPage />,
    "/employees": <EmployeesPage />,
    "/employees/addemploye": <AddEmployeePage />,
    "/employees/editemploye": <EditEmployeePage />,
    "/departments": <DepartmentsPage />,
    "/attendance": <AttendancePage />,
    "/payroll": <PayrollPage />,
    "/jobs": <PlaceholderPage />,
    "/candidates": <PlaceholderPage />,
    "/leaves": <LeavesPage />,
    "/leaves/calendar": <LeaveCalendarPage />,
    "/holidays": <HolidaysPage />,
    "/settings": <SettingsPage />,
    "/notifications": <NotificationsPanel />,
    "/profile": <ProfilePage />,
  }
  const activeRouteContent = pathname === "/leaves/calendar"
    ? <LeaveCalendarPage />
    : pathname.startsWith("/leaves/")
      ? <LeaveRequestDetailsPage />
      : routeContent[pathname]

  const handleNavigate = (nextPath) => {
    navigate(nextPath)
    setMobileSidebarOpen(false)
  }

  return (
    <main className="min-h-screen bg-[#f3f3f6] px-0 pb-0 pt-0 text-slate-900 lg:px-0 lg:pb-0 lg:pt-0">
      <div className="mx-auto max-w-[1440px]">
        <TopNavbar
          notificationsOpen={pathname === "/notifications"}
          onNotificationClick={() => navigate("/notifications")}
          onProfileClick={() => navigate("/profile")}
          onMenuClick={() => setMobileSidebarOpen(true)}
          onLogout={handleLogout}
        />

        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex xl:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/35"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close navigation menu overlay"
            />
            <div className="relative z-10 h-full">
              <div className="flex h-[72px] items-center justify-end border-b border-slate-200 bg-[#f7f7fa] px-4">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600"
                  aria-label="Close navigation menu"
                >
                  <X size={16} />
                </button>
              </div>
              <Sidebar pathname={pathname} onNavigate={handleNavigate} mobile />
            </div>
          </div>
        )}

        <div className="flex gap-0 pt-4">
          <Sidebar pathname={pathname} onNavigate={handleNavigate} />

          <section className="min-w-0 flex-1 space-y-5 px-5 pb-5 pt-0">
            {activeRouteContent ?? <DashboardPage />}
          </section>
        </div>
      </div>
    </main>
  )
}

export default App
