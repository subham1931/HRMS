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
import DepartmentDetailsPage from "./pages/DepartmentDetailsPage"
import OfficesPage from "./pages/OfficesPage"
import AttendancePage from "./pages/AttendancePage"
import PayrollPage from "./pages/PayrollPage"
import LeavesPage from "./pages/LeavesPage"
import LeaveSetupPage from "./pages/LeaveSetupPage"
import LeaveRequestDetailsPage from "./pages/LeaveRequestDetailsPage"
import LeaveCalendarPage from "./pages/LeaveCalendarPage"
import HolidaysPage from "./pages/HolidaysPage"
import SettingsPage from "./pages/SettingsPage"
import ProfilePage from "./pages/ProfilePage"
import PlaceholderPage from "./pages/PlaceholderPage"
import LandingPage from "./pages/LandingPage"
import SignInPage from "./pages/SignInPage"
import { getCurrentAdminSession, signInAdmin, signOutAdmin } from "./services/auth"

const PUBLIC_PATHS = new Set(["/", "/signin"])
const THEME_STORAGE_KEY = "hrms_appearance_theme"

function App() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [adminProfile, setAdminProfile] = useState(null)
  const [appearance, setAppearance] = useState(() => {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
      return saved === "Dark" ? "Dark" : "Light"
    } catch {
      return "Light"
    }
  })
  const isDarkDashboard = appearance === "Dark" && (pathname === "/dashboard" || pathname === "/notifications" || pathname === "/attendance" || pathname === "/employees" || pathname === "/employees/addemploye" || pathname === "/employees/editemploye" || pathname === "/payroll" || pathname === "/settings" || pathname === "/setup" || pathname === "/departments" || pathname.startsWith("/departments/") || pathname === "/offices" || pathname === "/setup/leaves" || pathname === "/leaves" || pathname === "/calendar" || pathname === "/leaves/calendar" || pathname === "/holidays" || pathname === "/profile" || pathname.startsWith("/leaves/"))
  const isDarkUi = appearance === "Dark"

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, appearance)
    } catch {
      // ignore localStorage failures
    }
  }, [appearance])

  useEffect(() => {
    let isMounted = true

    async function bootstrapAuth() {
      try {
        const auth = await getCurrentAdminSession()
        if (!isMounted) return
        setIsAuthenticated(Boolean(auth?.session))
        setAdminProfile(auth?.admin || null)
      } catch {
        if (!isMounted) return
        setIsAuthenticated(false)
        setAdminProfile(null)
      } finally {
        if (isMounted) setAuthReady(true)
      }
    }

    bootstrapAuth()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!authReady) return
    if (isAuthenticated && PUBLIC_PATHS.has(pathname)) {
      navigate("/dashboard", { replace: true })
      return
    }
    if (!isAuthenticated && !PUBLIC_PATHS.has(pathname)) {
      navigate("/signin", { replace: true })
    }
  }, [authReady, isAuthenticated, navigate, pathname])

  const handleSignIn = async (email, password) => {
    const auth = await signInAdmin(email, password)
    setIsAuthenticated(true)
    setAdminProfile(auth?.admin || null)
    navigate("/dashboard", { replace: true })
  }

  const handleLogout = async () => {
    await signOutAdmin()
    setIsAuthenticated(false)
    setAdminProfile(null)
    setMobileSidebarOpen(false)
    navigate("/signin", { replace: true })
  }

  const handlePublicNavigation = (nextPath) => {
    navigate(nextPath)
  }

  if (!authReady) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 text-slate-600">
        <p className="text-sm">Checking session...</p>
      </main>
    )
  }

  if (pathname === "/") {
    if (isAuthenticated) return null
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
    "/dashboard": <DashboardPage appearance={appearance} />,
    "/employees": <EmployeesPage appearance={appearance} />,
    "/employees/addemploye": <AddEmployeePage appearance={appearance} />,
    "/employees/editemploye": <EditEmployeePage appearance={appearance} />,
    "/departments": <DepartmentsPage appearance={appearance} />,
    "/offices": <OfficesPage appearance={appearance} />,
    "/attendance": <AttendancePage appearance={appearance} />,
    "/payroll": <PayrollPage appearance={appearance} />,
    "/jobs": <PlaceholderPage />,
    "/candidates": <PlaceholderPage />,
    "/leaves": <LeavesPage appearance={appearance} />,
    "/setup/leaves": <LeaveSetupPage appearance={appearance} />,
    "/calendar": <LeaveCalendarPage appearance={appearance} />,
    "/leaves/calendar": <LeaveCalendarPage appearance={appearance} />,
    "/holidays": <HolidaysPage appearance={appearance} />,
    "/setup": <SettingsPage appearance={appearance} onAppearanceChange={setAppearance} />,
    "/settings": <SettingsPage appearance={appearance} onAppearanceChange={setAppearance} />,
    "/notifications": <NotificationsPanel appearance={appearance} />,
    "/profile": <ProfilePage adminProfile={adminProfile} appearance={appearance} />,
  }
  const activeRouteContent = pathname === "/leaves/calendar"
    ? <LeaveCalendarPage appearance={appearance} />
    : pathname.startsWith("/departments/")
      ? <DepartmentDetailsPage appearance={appearance} />
    : pathname.startsWith("/leaves/")
      ? <LeaveRequestDetailsPage appearance={appearance} />
      : routeContent[pathname]

  const handleNavigate = (nextPath) => {
    navigate(nextPath)
    setMobileSidebarOpen(false)
  }
  const displayEmail = adminProfile?.email || ""
  const displayName = adminProfile?.full_name || (displayEmail ? displayEmail.split("@")[0] : "Admin User")
  const displayRole = (adminProfile?.role || "HR").toUpperCase()

  return (
    <main className={`min-h-screen px-0 pb-0 pt-0 lg:px-0 lg:pb-0 lg:pt-0 ${isDarkDashboard ? "bg-[#0f1720] text-slate-100" : "bg-[#f3f3f6] text-slate-900"}`}>
      <div className="mx-auto max-w-[1440px]">
        <TopNavbar
          notificationsOpen={pathname === "/notifications"}
          onNotificationClick={() => navigate("/notifications")}
          onProfileClick={() => navigate("/profile")}
          onMenuClick={() => setMobileSidebarOpen(true)}
          onLogout={handleLogout}
          userName={displayName}
          userRole={displayRole}
          appearance={appearance}
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
              <div className={`flex h-[72px] items-center justify-end border-b px-4 ${
                isDarkUi ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-[#f7f7fa]"
              }`}>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${
                    isDarkUi ? "border-slate-600 bg-[#0f1720] text-slate-300" : "border-slate-200 bg-white text-slate-600"
                  }`}
                  aria-label="Close navigation menu"
                >
                  <X size={16} />
                </button>
              </div>
              <Sidebar pathname={pathname} onNavigate={handleNavigate} mobile appearance={appearance} />
            </div>
          </div>
        )}

        <div className="flex gap-0 pt-4">
          <Sidebar pathname={pathname} onNavigate={handleNavigate} appearance={appearance} />

          <section className="min-w-0 flex-1 space-y-5 px-5 pb-5 pt-0">
            {activeRouteContent ?? <DashboardPage />}
          </section>
        </div>
      </div>
    </main>
  )
}

export default App
