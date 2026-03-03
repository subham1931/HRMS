import { useEffect, useState } from "react"

const departmentOptions = [
  "Design",
  "HR",
  "Sales",
  "Business Analyst",
  "Project Manager",
  "Java",
  "Python",
  "React JS",
  "Account",
  "Nods JS",
]

function EmployeeFilterModal({ open, initialFilters, onClose, onApply }) {
  const [selectedDepartments, setSelectedDepartments] = useState(initialFilters.departments ?? [])
  const [selectedType, setSelectedType] = useState(initialFilters.type ?? "")

  useEffect(() => {
    if (!open) return
    setSelectedDepartments(initialFilters.departments ?? [])
    setSelectedType(initialFilters.type ?? "")
  }, [open, initialFilters])

  if (!open) return null

  const toggleDepartment = (value) => {
    setSelectedDepartments((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/35 p-4">
      <div className="mx-auto mt-8 w-full max-w-[390px] rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-[20px] font-semibold tracking-tight text-slate-900">Filter</h3>

        <div className="my-4 border-t border-slate-200" />

        <div>
          <p className="mb-3 text-[16px] font-semibold tracking-tight text-slate-900">Department</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            {departmentOptions.map((department) => (
              <label key={department} className="inline-flex items-center gap-2 text-[13px] text-slate-800">
                <input
                  type="checkbox"
                  checked={selectedDepartments.includes(department)}
                  onChange={() => toggleDepartment(department)}
                  className="h-5 w-5 rounded-md border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                {department}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-[16px] font-semibold tracking-tight text-slate-900">Select Type</p>
          <div className="flex flex-wrap items-center gap-6">
            <label className="inline-flex items-center gap-2 text-[13px] text-slate-800">
              <input
                type="radio"
                name="employeeType"
                value="Office"
                checked={selectedType === "Office"}
                onChange={(event) => setSelectedType(event.target.value)}
                className="h-5 w-5 border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              Office
            </label>
            <label className="inline-flex items-center gap-2 text-[13px] text-slate-800">
              <input
                type="radio"
                name="employeeType"
                value="Work from Home"
                checked={selectedType === "Work from Home"}
                onChange={(event) => setSelectedType(event.target.value)}
                className="h-5 w-5 border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              Work from Home
            </label>
          </div>
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
                type: selectedType,
              })
            }
            className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmployeeFilterModal
