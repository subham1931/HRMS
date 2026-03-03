import { useLocation, useNavigate } from "react-router-dom"
import NotificationsPanel from "./components/NotificationsPanel"
import Sidebar from "./components/Sidebar"
import TopNavbar from "./components/TopNavbar"
import DashboardPage from "./pages/DashboardPage"
import EmployeesPage from "./pages/EmployeesPage"
import DepartmentsPage from "./pages/DepartmentsPage"
import AttendancePage from "./pages/AttendancePage"
import PayrollPage from "./pages/PayrollPage"
import HolidaysPage from "./pages/HolidaysPage"
import SettingsPage from "./pages/SettingsPage"
import PlaceholderPage from "./pages/PlaceholderPage"

function App() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const routeContent = {
    "/dashboard": <DashboardPage />,
    "/employees": <EmployeesPage />,
    "/departments": <DepartmentsPage />,
    "/attendance": <AttendancePage />,
    "/payroll": <PayrollPage />,
    "/jobs": <PlaceholderPage />,
    "/candidates": <PlaceholderPage />,
    "/leaves": <PlaceholderPage />,
    "/holidays": <HolidaysPage />,
    "/settings": <SettingsPage />,
    "/notifications": <NotificationsPanel />,
  }

  const handleNavigate = (nextPath) => navigate(nextPath)

  return (
    <main className="min-h-screen bg-[#f3f3f6] px-0 pb-0 pt-0 text-slate-900 lg:px-0 lg:pb-0 lg:pt-0">
      <div className="mx-auto max-w-[1440px]">
        <TopNavbar
          notificationsOpen={pathname === "/notifications"}
          onNotificationClick={() => navigate("/notifications")}
        />

        <div className="flex gap-0 pt-4">
          <Sidebar pathname={pathname} onNavigate={handleNavigate} />

          <section className="min-w-0 flex-1 space-y-5 px-5 pb-5 pt-0">
            {routeContent[pathname] ?? <DashboardPage />}
          </section>
        </div>
      </div>
    </main>
  )
}

export default App
