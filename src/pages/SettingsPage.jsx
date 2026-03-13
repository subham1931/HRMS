import { useState } from "react"
import { ChevronDown } from "lucide-react"

function SettingsPage({ appearance = "Light", onAppearanceChange }) {
  const isDark = appearance === "Dark"
  const [language, setLanguage] = useState("English")
  const [toggles, setToggles] = useState({
    twoFactor: true,
    mobilePush: true,
    desktop: true,
    email: true,
  })

  return (
    <article className={`rounded-2xl border p-3 sm:p-4 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
      <div className={`divide-y ${isDark ? "divide-slate-700" : "divide-slate-100"}`}>
        <div className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className={`text-[18px] font-semibold leading-tight sm:text-[16px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>Appearance</p>
            <p className={`mt-1 text-[14px] sm:text-[13px] ${isDark ? "text-slate-400" : "text-slate-400"}`}>Customize how your theme looks on your device</p>
          </div>
          <div className="relative">
            <select
              value={appearance}
              onChange={(event) => onAppearanceChange?.(event.target.value)}
              className={`appearance-none rounded-lg py-2 pl-3 pr-8 text-[13px] outline-none ${
                isDark ? "bg-[#0f1720] text-slate-200" : "bg-slate-100 text-slate-700"
              }`}
            >
              <option>Light</option>
              <option>Dark</option>
            </select>
            <ChevronDown size={14} className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className={`text-[18px] font-semibold leading-tight sm:text-[16px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>Language</p>
            <p className={`mt-1 text-[14px] sm:text-[13px] ${isDark ? "text-slate-400" : "text-slate-400"}`}>Select your language</p>
          </div>
          <div className="relative">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className={`appearance-none rounded-lg py-2 pl-3 pr-8 text-[13px] outline-none ${
                isDark ? "bg-[#0f1720] text-slate-200" : "bg-slate-100 text-slate-700"
              }`}
            >
              <option>English</option>
              <option>Spanish</option>
              <option>German</option>
            </select>
            <ChevronDown size={14} className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
          </div>
        </div>

        <SettingToggle
          id="two-factor-toggle"
          title="Two-factor Authentication"
          subtitle="Keep your account secure by enabling 2FA via mail"
          checked={toggles.twoFactor}
          onChange={(nextChecked) => setToggles((prev) => ({ ...prev, twoFactor: nextChecked }))}
          isDark={isDark}
        />
        <SettingToggle
          id="mobile-push-toggle"
          title="Mobile Push Notifications"
          subtitle="Receive push notification"
          checked={toggles.mobilePush}
          onChange={(nextChecked) => setToggles((prev) => ({ ...prev, mobilePush: nextChecked }))}
          isDark={isDark}
        />
        <SettingToggle
          id="desktop-toggle"
          title="Desktop Notification"
          subtitle="Receive push notification in desktop"
          checked={toggles.desktop}
          onChange={(nextChecked) => setToggles((prev) => ({ ...prev, desktop: nextChecked }))}
          isDark={isDark}
        />
        <SettingToggle
          id="email-toggle"
          title="Email Notifications"
          subtitle="Receive email notification"
          checked={toggles.email}
          onChange={(nextChecked) => setToggles((prev) => ({ ...prev, email: nextChecked }))}
          isDark={isDark}
        />
      </div>
    </article>
  )
}

function SettingToggle({ id, title, subtitle, checked, onChange, isDark = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className={`text-[18px] font-semibold leading-tight sm:text-[16px] ${isDark ? "text-slate-100" : "text-slate-900"}`}>{title}</p>
        <p className={`mt-1 text-[14px] sm:text-[13px] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{subtitle}</p>
      </div>

      <label htmlFor={id} className="inline-flex cursor-pointer items-center">
        <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span className={`relative h-7 w-12 rounded-full transition-colors peer-checked:bg-emerald-500 peer-focus-visible:outline-2 peer-focus-visible:outline-emerald-400 ${
          isDark ? "bg-slate-600" : "bg-slate-300"
        }`}>
          <span className="absolute top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-6 translate-x-1" />
        </span>
      </label>
    </div>
  )
}

export default SettingsPage
