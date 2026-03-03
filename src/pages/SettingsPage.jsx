import { useState } from "react"
import { ChevronDown } from "lucide-react"

function SettingsPage() {
  const [appearance, setAppearance] = useState("Light")
  const [language, setLanguage] = useState("English")
  const [toggles, setToggles] = useState({
    twoFactor: true,
    mobilePush: true,
    desktop: true,
    email: true,
  })

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="divide-y divide-slate-100">
        <div className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className="text-[18px] font-semibold leading-tight text-slate-900 sm:text-[16px]">Appearance</p>
            <p className="mt-1 text-[14px] text-slate-400 sm:text-[13px]">Customize how your theme looks on your device</p>
          </div>
          <div className="relative">
            <select
              value={appearance}
              onChange={(event) => setAppearance(event.target.value)}
              className="appearance-none rounded-lg bg-slate-100 py-2 pl-3 pr-8 text-[13px] text-slate-700 outline-none"
            >
              <option>Light</option>
              <option>Dark</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 py-3">
          <div>
            <p className="text-[18px] font-semibold leading-tight text-slate-900 sm:text-[16px]">Language</p>
            <p className="mt-1 text-[14px] text-slate-400 sm:text-[13px]">Select your language</p>
          </div>
          <div className="relative">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="appearance-none rounded-lg bg-slate-100 py-2 pl-3 pr-8 text-[13px] text-slate-700 outline-none"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>German</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        <SettingToggle
          id="two-factor-toggle"
          title="Two-factor Authentication"
          subtitle="Keep your account secure by enabling 2FA via mail"
          checked={toggles.twoFactor}
          onChange={(nextChecked) => setToggles((prev) => ({ ...prev, twoFactor: nextChecked }))}
        />
        <SettingToggle
          id="mobile-push-toggle"
          title="Mobile Push Notifications"
          subtitle="Receive push notification"
          checked={toggles.mobilePush}
          onChange={(nextChecked) => setToggles((prev) => ({ ...prev, mobilePush: nextChecked }))}
        />
        <SettingToggle
          id="desktop-toggle"
          title="Desktop Notification"
          subtitle="Receive push notification in desktop"
          checked={toggles.desktop}
          onChange={(nextChecked) => setToggles((prev) => ({ ...prev, desktop: nextChecked }))}
        />
        <SettingToggle
          id="email-toggle"
          title="Email Notifications"
          subtitle="Receive email notification"
          checked={toggles.email}
          onChange={(nextChecked) => setToggles((prev) => ({ ...prev, email: nextChecked }))}
        />
      </div>
    </article>
  )
}

function SettingToggle({ id, title, subtitle, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-[18px] font-semibold leading-tight text-slate-900 sm:text-[16px]">{title}</p>
        <p className="mt-1 text-[14px] text-slate-400 sm:text-[13px]">{subtitle}</p>
      </div>

      <label htmlFor={id} className="inline-flex cursor-pointer items-center">
        <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span className="relative h-7 w-12 rounded-full bg-slate-300 transition-colors peer-checked:bg-emerald-500 peer-focus-visible:outline-2 peer-focus-visible:outline-emerald-400">
          <span className="absolute top-1 h-5 w-5 rounded-full bg-white transition-transform peer-checked:translate-x-6 translate-x-1" />
        </span>
      </label>
    </div>
  )
}

export default SettingsPage
