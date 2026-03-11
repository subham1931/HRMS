import { ArrowRight, BriefcaseBusiness, CalendarCheck2, CheckCircle2, Clock3, ShieldCheck, Sparkles, Users } from "lucide-react"
import TopNavbar from "../components/TopNavbar"

function LandingPage({ onGetStarted }) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <TopNavbar mode="public" publicActionLabel="Sign In" onPublicAction={onGetStarted} />

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
              <CheckCircle2 size={14} />
              Modern workforce management
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
              One platform to manage people, leave, attendance, and payroll.
            </h1>
            <p className="mt-5 max-w-xl text-slate-600">
              HRMS helps teams automate daily operations, keep employee records organized, and make faster HR decisions.
            </p>
            <button
              type="button"
              onClick={onGetStarted}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 transition-transform hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5">
            {[
              { title: "Employee Directory", description: "Centralized employee profiles and documents.", icon: Users },
              { title: "Attendance Tracking", description: "Track check-ins, check-outs, and overtime in one place.", icon: CheckCircle2 },
              { title: "Secure Access", description: "Role-based access and protected HR data.", icon: ShieldCheck },
            ].map((item) => {
              const FeatureIcon = item.icon
              return (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-800">
                  <FeatureIcon size={15} />
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        <section className="mt-20">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold sm:text-3xl">Everything HR teams need</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-700">
              <Sparkles size={13} />
              Built for growing teams
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "Employee Hub", desc: "Profiles, departments, onboarding and role history.", icon: Users },
              { title: "Attendance", desc: "Track on-time, late, leave and absentee trends.", icon: CalendarCheck2 },
              { title: "Leave Workflow", desc: "Approve requests and monitor leave balance fast.", icon: Clock3 },
              { title: "Payroll Ready", desc: "Keep salary and banking details organized securely.", icon: BriefcaseBusiness },
            ].map((item) => {
              const CardIcon = item.icon
              return (
                <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <CardIcon size={16} />
                  </p>
                  <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="mt-16 grid gap-4 lg:grid-cols-3">
          {[
            ["Step 1", "Add team members", "Import or create employee records in minutes."],
            ["Step 2", "Set HR policies", "Configure departments, work models, and leave rules."],
            ["Step 3", "Operate daily", "Track attendance, process leave, and review HR insights."],
          ].map(([step, title, desc]) => (
            <div key={step} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">{step}</p>
              <h3 className="mt-2 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-xl font-semibold">Trusted by HR professionals</h3>
            <p className="mt-2 text-sm text-slate-600">
              "HRMS helped us centralize people operations and cut manual HR reporting time by half."
            </p>
            <p className="mt-4 text-sm font-medium text-emerald-700">Ananya Rao - HR Lead</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["98%", "Profile completeness"],
              ["3x", "Faster leave approvals"],
              ["40%", "Less manual HR ops"],
              ["24/7", "Workforce visibility"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-2xl font-semibold text-emerald-700">{value}</p>
                <p className="mt-1 text-xs text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h3 className="text-2xl font-semibold text-slate-900">Ready to simplify HR operations?</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Sign in to manage your workforce from onboarding to attendance and leave approvals.
          </p>
          <button
            type="button"
            onClick={onGetStarted}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900"
          >
            Continue to Sign In
            <ArrowRight size={16} />
          </button>
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-5 text-xs text-slate-500">
          <p>HRMS - Smart people operations platform</p>
        </footer>
      </section>
    </main>
  )
}

export default LandingPage
