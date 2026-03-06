import { useEffect, useState } from "react"

function EmployeeFilterModal({ open, initialFilters, departmentOptions = [], onClose, onApply }) {
  const [selectedDepartments, setSelectedDepartments] = useState(initialFilters.departments ?? [])
  const [selectedEmploymentType, setSelectedEmploymentType] = useState(initialFilters.employmentType ?? "")
  const [selectedWorkModel, setSelectedWorkModel] = useState(initialFilters.workModel ?? initialFilters.type ?? "")

  useEffect(() => {
    if (!open) return
    setSelectedDepartments(initialFilters.departments ?? [])
    setSelectedEmploymentType(initialFilters.employmentType ?? "")
    setSelectedWorkModel(initialFilters.workModel ?? initialFilters.type ?? "")
  }, [open, initialFilters])

  if (!open) return null

  const toggleDepartment = (value) => {
    setSelectedDepartments((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[390px] rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-[20px] font-semibold tracking-tight text-slate-900">Filter</h3>

        <div className="my-4 border-t border-slate-200" />

        <div>
          <p className="mb-3 text-[16px] font-semibold tracking-tight text-slate-900">Department</p>
          {departmentOptions.length === 0 ? (
            <p className="text-sm text-slate-500">No departments available.</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {departmentOptions.map((department) => (
                <label key={department} className="inline-flex items-center gap-2 text-[13px] text-slate-800">
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
          <p className="mb-2 text-[16px] font-semibold tracking-tight text-slate-900">Employment Type</p>
          <select
            value={selectedEmploymentType}
            onChange={(event) => setSelectedEmploymentType(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#53c4ae]"
          >
            <option value="">All Employment Types</option>
            {["Full-Time", "Part-Time", "Internship", "Freelance", "Contract", "Temporary", "Permanent"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-[16px] font-semibold tracking-tight text-slate-900">Work Model</p>
          <select
            value={selectedWorkModel}
            onChange={(event) => setSelectedWorkModel(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#53c4ae]"
          >
            <option value="">All Work Models</option>
            {["On-Site", "Hybrid", "Remote", "Office", "Work from Home"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700"
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
