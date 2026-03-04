import {
  BriefcaseBusiness,
  CalendarCheck2,
  ChevronLeft,
  CircleUserRound,
  ClipboardList,
  FileClock,
  FileText,
  Lock,
  Mail,
  PenLine,
} from "lucide-react"
import { useState } from "react"

const tabs = [
  { id: "personal", label: "Personal Information", icon: CircleUserRound },
  { id: "professional", label: "Professional Information", icon: BriefcaseBusiness },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "account", label: "Account Access", icon: Lock },
]

const sideMenu = [
  { id: "profile", label: "Profile", icon: CircleUserRound },
  { id: "attendance", label: "Attendance", icon: CalendarCheck2 },
  { id: "leave", label: "Leave", icon: FileClock },
]

function FieldRow({ leftLabel, leftValue, rightLabel, rightValue }) {
  return (
    <div className="grid grid-cols-2 gap-8 border-b border-slate-200 py-3">
      <div>
        <p className="text-[12px] font-medium text-slate-400">{leftLabel}</p>
        <p className="mt-1 text-[16px] font-semibold leading-tight text-slate-800">{leftValue || "-"}</p>
      </div>
      <div>
        <p className="text-[12px] font-medium text-slate-400">{rightLabel}</p>
        <p className="mt-1 text-[16px] font-semibold leading-tight text-slate-800">{rightValue || "-"}</p>
      </div>
    </div>
  )
}

function EmployeeDetailsView({ employee, onBack, onEditProfile, backLabel = "Back" }) {
  const [activeTab, setActiveTab] = useState("personal")
  const [activeMenu, setActiveMenu] = useState("profile")
  const isLegacyEmployee = Array.isArray(employee)
  const [legacyName, legacyEmployeeId, legacyDepartment, legacyDesignation, legacyType] = isLegacyEmployee ? employee : []
  const name = isLegacyEmployee ? legacyName : employee?.name
  const employeeId = isLegacyEmployee ? legacyEmployeeId : employee?.employeeId
  const department = isLegacyEmployee ? legacyDepartment : employee?.department
  const designation = isLegacyEmployee ? legacyDesignation : employee?.designation
  const type = isLegacyEmployee ? legacyType : employee?.type
  const firstName = name?.split(" ")[0] ?? "-"
  const lastName = name?.split(" ").slice(1).join(" ") || "-"
  const email = isLegacyEmployee
    ? `${name?.toLowerCase().replace(/\s+/g, ".")}@example.com`
    : employee?.officeEmail || employee?.email || `${name?.toLowerCase().replace(/\s+/g, ".")}@example.com`
  const mobile = isLegacyEmployee ? "-" : employee?.mobile || "-"
  const dateOfBirth = isLegacyEmployee ? "-" : employee?.dob || "-"
  const maritalStatus = isLegacyEmployee ? "-" : employee?.maritalStatus || "-"
  const gender = isLegacyEmployee ? "-" : employee?.gender || "-"
  const nationality = isLegacyEmployee ? "-" : employee?.nationality || "-"
  const address = isLegacyEmployee ? "-" : employee?.address || "-"
  const city = isLegacyEmployee ? "-" : employee?.city || "-"
  const state = isLegacyEmployee ? "-" : employee?.state || "-"
  const zipCode = isLegacyEmployee ? "-" : employee?.zipCode || "-"
  const workingDays = isLegacyEmployee ? "Monday - Friday" : employee?.workingDays || "-"
  const joiningDate = isLegacyEmployee ? "Jan 03, 2020" : employee?.joiningDate || "-"
  const officeLocation = isLegacyEmployee ? "-" : employee?.officeLocation || "-"
  const generatedPassword = isLegacyEmployee ? "-" : employee?.generatedPassword || "-"
  const userName = isLegacyEmployee ? "-" : employee?.userName || "-"
  const uploadedDocuments = isLegacyEmployee ? [] : Object.entries(employee?.documents || {})
  const attendanceHistory = [
    ["July 01, 2023", "09:28 AM", "07:00 PM", "00:30 Min", "09:02 Hrs", "On Time"],
    ["July 02, 2023", "09:20 AM", "07:00 PM", "00:20 Min", "09:20 Hrs", "On Time"],
    ["July 03, 2023", "09:25 AM", "07:00 PM", "00:30 Min", "09:05 Hrs", "On Time"],
    ["July 04, 2023", "09:45 AM", "07:00 PM", "00:40 Min", "08:35 Hrs", "Late"],
    ["July 05, 2023", "10:00 AM", "07:00 PM", "00:30 Min", "08:30 Hrs", "Late"],
    ["July 06, 2023", "09:28 AM", "07:00 PM", "00:30 Min", "09:02 Hrs", "On Time"],
    ["July 07, 2023", "09:30 AM", "07:00 PM", "00:15 Min", "09:15 Hrs", "On Time"],
    ["July 08, 2023", "09:52 AM", "07:00 PM", "00:45 Min", "08:23 Hrs", "Late"],
    ["July 09, 2023", "09:10 AM", "07:00 PM", "00:30 Min", "09:02 Hrs", "On Time"],
    ["July 10, 2023", "09:48 AM", "07:00 PM", "00:42 Min", "08:30 Hrs", "Late"],
  ]
  const leaveHistory = [
    ["July 01, 2023", "July 05 - July 08", "3 Days", "Mark Willians", "Pending"],
    ["Apr 05, 2023", "Apr 06 - Apr 10", "4 Days", "Mark Willians", "Approved"],
    ["Mar 12, 2023", "Mar 14 - Mar 16", "2 Days", "Mark Willians", "Approved"],
    ["Feb 01, 2023", "Feb 02 - Feb 10", "8 Days", "Mark Willians", "Approved"],
    ["Jan 01, 2023", "Jan 16 - Jan 19", "3 Days", "Mark Willians", "Reject"],
  ]

  return (
    <div className="rounded-2xl bg-white p-5">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
      >
        <ChevronLeft size={15} />
        {backLabel}
      </button>

      <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onBack} className="h-16 w-16 rounded-xl bg-[linear-gradient(135deg,#f2d7cc,#d7d7d7)]" aria-label="Back to table" />
          <div>
            <p className="text-[24px] font-semibold leading-tight tracking-tight text-slate-900">{name}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <p className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                <BriefcaseBusiness size={14} className="text-slate-500" />
                <span className="font-medium text-slate-700">{designation}</span>
              </p>
              <p className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5">
                <Mail size={14} className="text-slate-500" />
                <span className="text-slate-700">{email}</span>
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onEditProfile}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-[13px] font-medium text-white"
        >
          <PenLine size={14} />
          Edit Profile
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[170px_1fr]">
        <aside className="h-fit rounded-xl border border-slate-200 p-2">
          {sideMenu.map((item, index) => {
            const Icon = item.icon
            const active = item.id === activeMenu

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveMenu(item.id)}
                className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] ${
                  active ? "bg-violet-600 text-white" : "text-slate-700"
                }`}
              >
                <Icon size={14} />
                {item.label}
              </button>
            )
          })}
        </aside>

        <section>
          {activeMenu === "profile" && (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-6 border-b border-slate-200 pb-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const active = tab.id === activeTab

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 border-b-2 pb-2 text-sm ${
                        active ? "border-violet-600 text-violet-600" : "border-transparent text-slate-500"
                      }`}
                    >
                      <Icon size={15} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {activeTab === "personal" && (
                <div>
                  <FieldRow leftLabel="First Name" leftValue={firstName} rightLabel="Last Name" rightValue={lastName} />
                  <FieldRow leftLabel="Mobile Number" leftValue={mobile} rightLabel="Email Address" rightValue={email} />
                  <FieldRow leftLabel="Date of Birth" leftValue={dateOfBirth} rightLabel="Marital Status" rightValue={maritalStatus} />
                  <FieldRow leftLabel="Gender" leftValue={gender} rightLabel="Nationality" rightValue={nationality} />
                  <FieldRow leftLabel="Address" leftValue={address} rightLabel="City" rightValue={city} />
                  <FieldRow leftLabel="State" leftValue={state} rightLabel="Zip Code" rightValue={zipCode} />
                </div>
              )}

              {activeTab === "professional" && (
                <div>
                  <FieldRow leftLabel="Employee ID" leftValue={employeeId} rightLabel="Department" rightValue={department} />
                  <FieldRow leftLabel="Designation" leftValue={designation} rightLabel="Employee Type" rightValue={type} />
                  <FieldRow leftLabel="Working Days" leftValue={workingDays} rightLabel="Joining Date" rightValue={joiningDate} />
                  <FieldRow leftLabel="Office Location" leftValue={officeLocation} rightLabel="Status" rightValue={isLegacyEmployee ? "Permanent" : employee?.status || "-"} />
                </div>
              )}

              {activeTab === "documents" && (
                <div className="grid gap-4 md:grid-cols-2">
                  {uploadedDocuments.length > 0 ? (
                    uploadedDocuments.map(([label, doc]) => (
                      <div key={label} className="rounded-xl border border-slate-200 p-4">
                        <p className="text-sm font-medium text-slate-700">{label}</p>
                        <p className="mt-2 truncate text-xs text-slate-600">{doc?.name || "Uploaded document"}</p>
                        {doc?.dataUrl && (
                          <a
                            href={doc.dataUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600"
                          >
                            View Document
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 md:col-span-2">
                      No uploaded documents yet.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "account" && (
                <div>
                  <FieldRow leftLabel="Email Address" leftValue={email} rightLabel="Password" rightValue={generatedPassword} />
                  <FieldRow leftLabel="User Name" leftValue={userName} rightLabel="Employee ID" rightValue={employeeId} />
                </div>
              )}
            </>
          )}

          {activeMenu === "attendance" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Check In</th>
                    <th className="pb-3 font-medium">Check Out</th>
                    <th className="pb-3 font-medium">Break</th>
                    <th className="pb-3 font-medium">Working Hours</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory.map((item) => (
                    <tr key={item[0]} className="border-t border-slate-200">
                      <td className="py-3 text-slate-700">{item[0]}</td>
                      <td className="py-3 text-slate-700">{item[1]}</td>
                      <td className="py-3 text-slate-700">{item[2]}</td>
                      <td className="py-3 text-slate-700">{item[3]}</td>
                      <td className="py-3 text-slate-700">{item[4]}</td>
                      <td className="py-3">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            item[5] === "On Time" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                          }`}
                        >
                          {item[5]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeMenu === "leave" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Duration</th>
                    <th className="pb-3 font-medium">Days</th>
                    <th className="pb-3 font-medium">Reporting Manager</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveHistory.map((item) => (
                    <tr key={`${item[0]}-${item[1]}`} className="border-t border-slate-200">
                      <td className="py-3 text-slate-700">{item[0]}</td>
                      <td className="py-3 text-slate-700">{item[1]}</td>
                      <td className="py-3 text-slate-700">{item[2]}</td>
                      <td className="py-3 text-slate-700">{item[3]}</td>
                      <td className="py-3">
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            item[4] === "Approved"
                              ? "bg-emerald-50 text-emerald-600"
                              : item[4] === "Pending"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-rose-50 text-rose-500"
                          }`}
                        >
                          {item[4]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default EmployeeDetailsView
