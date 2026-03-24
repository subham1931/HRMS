import { ChevronDown } from "lucide-react"
import { useState } from "react"

function EmployeeFilterModal({ open, initialFilters, departmentOptions = [], onClose, onApply, appearance = "Light" }) {
  const isDark = appearance === "Dark"
  const [selectedDepartments, setSelectedDepartments] = useState(initialFilters.departments ?? [])
  const [selectedEmploymentType, setSelectedEmploymentType] = useState(initialFilters.employmentType ?? "")
  const [selectedWorkModel, setSelectedWorkModel] = useState(initialFilters.workModel ?? initialFilters.type ?? "")

  if (!open) return null

  const toggleDepartment = (value) => {
    setSelectedDepartments((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className={`w-full max-w-[390px] rounded-2xl p-5 shadow-xl ${isDark ? "border border-slate-700 bg-[#0f1720]" : "bg-white"}`}>
        <h3 className={`text-[20px] font-semibold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>Filter</h3>

        <div className={`my-4 border-t ${isDark ? "border-slate-700" : "border-slate-200"}`} />

        <div>
          <p className={`mb-3 text-[16px] font-semibold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>Department</p>
          {departmentOptions.length === 0 ? (
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>No departments available.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {departmentOptions.map((department) => (
                <label key={department} className={`inline-flex items-center gap-2 text-[13px] ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(department)}
                    onChange={() => toggleDepartment(department)}
                    className="h-5 w-5 rounded-md border-slate-300 text-[#53c4ae] focus:ring-[#53c4ae]"
                  />
                  {department}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className={`mb-2 text-[16px] font-semibold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>Employment Type</p>
          <div className="relative">
            <select
              value={selectedEmploymentType}
              onChange={(event) => setSelectedEmploymentType(event.target.value)}
              className={`w-full appearance-none rounded-xl border py-2.5 pl-3 pr-11 text-sm outline-none focus:border-[#53c4ae] ${
                isDark ? "border-slate-700 bg-[#111a24] text-slate-100" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <option value="">All Employment Types</option>
              {["Full-Time", "Part-Time", "Internship", "Freelance", "Contract", "Temporary", "Permanent"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              aria-hidden
              className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`}
            />
          </div>
        </div>

        <div className="mt-6">
          <p className={`mb-2 text-[16px] font-semibold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>Work Model</p>
          <div className="relative">
            <select
              value={selectedWorkModel}
              onChange={(event) => setSelectedWorkModel(event.target.value)}
              className={`w-full appearance-none rounded-xl border py-2.5 pl-3 pr-11 text-sm outline-none focus:border-[#53c4ae] ${
                isDark ? "border-slate-700 bg-[#111a24] text-slate-100" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <option value="">All Work Models</option>
              {["On-Site", "Hybrid", "Remote", "Office", "Work from Home"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              aria-hidden
              className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`}
            />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium ${
              isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onApply({
                departments: selectedDepartments,
                employmentType: selectedEmploymentType,
                workModel: selectedWorkModel,
              })
            }
            className="flex-1 rounded-xl bg-[#53c4ae] px-4 py-3 text-sm font-medium text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmployeeFilterModal
