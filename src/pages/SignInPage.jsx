import { useState } from "react"
import { CheckCircle2, LockKeyhole, Mail } from "lucide-react"
import TopNavbar from "../components/TopNavbar"

function SignInPage({ onSignIn, onBackToLanding }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password.trim()) {
      setError("Please enter email and password.")
      return
    }
    setError("")
    onSignIn?.(normalizedEmail)
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <TopNavbar mode="public" showPublicAction={false} onBrandClick={onBackToLanding} />

        <div className="grid min-h-[calc(100dvh-8.5rem)] w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.05fr_1fr]">
        <section className="relative hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 p-10 text-slate-900 lg:block">
          <h2 className="mt-10 text-4xl font-semibold leading-tight">
            Welcome back to your
            {" "}
            <span className="text-emerald-700">HR command center</span>
          </h2>
          <p className="mt-4 max-w-md text-sm text-slate-600">
            Manage employees, attendance, and leave requests with secure access to your workspace.
          </p>
          <div className="mt-8 space-y-3 rounded-2xl border border-emerald-100 bg-white/70 p-4">
            {[
              "Centralized employee records",
              "Fast leave approvals and visibility",
              "Role-based secure HR operations",
            ].map((item) => (
              <p key={item} className="inline-flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 size={15} className="text-emerald-600" />
                {item}
              </p>
            ))}
          </div>
        </section>

        <section className="flex items-center p-5 sm:p-8 lg:p-10">
          <article className="w-full">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Sign In to HRMS</h1>
            <p className="mt-1.5 text-sm text-slate-500">Use your work credentials to continue.</p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-600">Email</span>
                <div className="relative">
                  <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-emerald-400"
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-600">Password</span>
                <div className="relative">
                  <LockKeyhole size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-emerald-400"
                  />
                </div>
              </label>

              {error ? <p className="text-sm text-rose-500">{error}</p> : null}

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
              >
                Sign In
              </button>
            </form>
          </article>
        </section>
      </div>
      </div>
    </main>
  )
}

export default SignInPage
