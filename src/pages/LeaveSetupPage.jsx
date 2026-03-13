import { useCallback, useEffect, useMemo, useState } from "react"
import { Pencil, Plus, Search } from "lucide-react"
import { createLeaveType, listLeaveTypes, updateLeaveType } from "../services/leaveTypes"

function formatDateTime(value) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function LeaveSetupPage({ appearance = "Light" }) {
  const isDark = appearance === "Dark"
  const [leaveTypes, setLeaveTypes] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingLeaveType, setEditingLeaveType] = useState(null)
  const [leaveTypeName, setLeaveTypeName] = useState("")
  const [annualLimit, setAnnualLimit] = useState("12")
  const [earnedPerMonth, setEarnedPerMonth] = useState("0")
  const [isPaid, setIsPaid] = useState(true)
  const [isActive, setIsActive] = useState(true)
  const [formError, setFormError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const loadTypes = useCallback(async () => {
    setIsLoading(true)
    setLoadError("")
    try {
      const rows = await listLeaveTypes()
      setLeaveTypes(rows)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load leave setup.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTypes()
  }, [loadTypes])

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return leaveTypes
    return leaveTypes.filter((item) => item.name.toLowerCase().includes(query))
  }, [leaveTypes, searchQuery])

  const openCreateModal = () => {
    setEditingLeaveType(null)
    setLeaveTypeName("")
    setAnnualLimit("12")
    setEarnedPerMonth("0")
    setIsPaid(true)
    setIsActive(true)
    setFormError("")
    setShowModal(true)
  }

  const openUpdateModal = (row) => {
    setEditingLeaveType(row)
    setLeaveTypeName(row.name || "")
    setAnnualLimit(String(row.annualLimit ?? 0))
    setEarnedPerMonth(String(row.earnedPerMonth ?? 0))
    setIsPaid(Boolean(row.isPaid))
    setIsActive(Boolean(row.isActive))
    setFormError("")
    setShowModal(true)
  }

  const closeModal = () => {
    if (isSaving) return
    setShowModal(false)
    setEditingLeaveType(null)
    setLeaveTypeName("")
    setAnnualLimit("12")
    setEarnedPerMonth("0")
    setIsPaid(true)
    setIsActive(true)
    setFormError("")
  }

  const handleSave = async () => {
    const name = String(leaveTypeName || "").trim()
    const limit = Number(annualLimit)
    const monthlyEarn = Number(earnedPerMonth)
    const isEarnedLeave = name.toLowerCase().includes("earned")
    if (!name) {
      setFormError("Leave type name is required.")
      return
    }
    if (!Number.isFinite(limit) || limit < 0) {
      setFormError("Annual days must be 0 or more.")
      return
    }
    if (!Number.isFinite(monthlyEarn) || monthlyEarn < 0) {
      setFormError("Earn per month must be 0 or more.")
      return
    }
    if (isEarnedLeave && monthlyEarn <= 0) {
      setFormError("Set monthly earning days for Earned Leave.")
      return
    }

    setIsSaving(true)
    setFormError("")
    try {
      if (editingLeaveType?.id) {
        await updateLeaveType(editingLeaveType.id, {
          name,
          annualLimit: limit,
          earnedPerMonth: monthlyEarn,
          isPaid,
          isActive,
        })
      } else {
        await createLeaveType({ name, annualLimit: limit, earnedPerMonth: monthlyEarn, isPaid })
      }
      setShowModal(false)
      await loadTypes()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to save leave setup.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <article className={`rounded-2xl border p-3 sm:p-4 ${isDark ? "border-slate-700 bg-[#111a24]" : "border-slate-200 bg-white"}`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className={`text-lg font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>Leave Setup</h2>
          <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Configure leave types, annual limits, and status.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#53c4ae] px-4 py-2.5 text-sm font-medium text-white sm:w-auto"
        >
          <Plus size={16} />
          Add Leave Type
        </button>
      </div>

      <div className="mb-4">
        <div className="relative w-full sm:max-w-[360px]">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className={`w-full rounded-xl border py-2.5 pl-11 pr-3 text-sm outline-none focus:border-violet-300 ${
              isDark ? "border-slate-700 bg-[#0f1720] text-slate-100" : "border-slate-200 bg-white"
            }`}
            placeholder="Search leave type"
          />
        </div>
      </div>

      {loadError && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {loadError}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead className={`border-b text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-100 text-slate-400"}`}>
            <tr>
              <th className="pb-3 font-medium">Leave Type</th>
              <th className="pb-3 font-medium">Annual Days</th>
              <th className="pb-3 font-medium">Earn/Month</th>
              <th className="pb-3 font-medium">Paid/Unpaid</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Last Updated</th>
              <th className="pb-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {!isLoading && filteredRows.map((row) => (
              <tr key={row.id} className={`border-b last:border-0 ${isDark ? "border-slate-700" : "border-slate-100"}`}>
                <td className={`py-3.5 font-medium ${isDark ? "text-slate-100" : "text-slate-800"}`}>{row.name}</td>
                <td className={`py-3.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{row.annualLimit}</td>
                <td className={`py-3.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{row.earnedPerMonth > 0 ? row.earnedPerMonth : "-"}</td>
                <td className={`py-3.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>{row.isPaid ? "Paid" : "Unpaid"}</td>
                <td className="py-3.5">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      row.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {row.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className={`py-3.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{formatDateTime(row.updatedAt)}</td>
                <td className="py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => openUpdateModal(row)}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                      isDark ? "border-slate-700 text-slate-200 hover:bg-[#0f1720]" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Pencil size={14} />
                    Update
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && filteredRows.length === 0 && (
              <tr>
                <td colSpan={7} className={`py-10 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  No leave types found.
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={7} className={`py-10 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Loading leave setup...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className={`w-full max-w-[440px] rounded-2xl p-5 shadow-xl ${isDark ? "border border-slate-700 bg-[#0f1720]" : "bg-white"}`}>
            <h3 className={`text-[20px] font-semibold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              {editingLeaveType ? "Update Leave Type" : "Add Leave Type"}
            </h3>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {editingLeaveType
                ? "Update leave policy details."
                : "Create a new leave type for employees."}
            </p>

            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>Leave Type Name</span>
                <input
                  value={leaveTypeName}
                  onChange={(event) => {
                    setLeaveTypeName(event.target.value)
                    if (formError) setFormError("")
                  }}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                    formError
                      ? "border-rose-400 focus:border-rose-500"
                      : isDark
                        ? "border-slate-700 bg-[#111a24] text-slate-100 focus:border-violet-500"
                        : "border-slate-200 bg-white focus:border-violet-500"
                  }`}
                  placeholder="e.g. Casual Leave"
                />
              </label>

              <label className="block space-y-1.5">
                <span className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>Annual Days</span>
                <input
                  type="number"
                  min={0}
                  value={annualLimit}
                  onChange={(event) => setAnnualLimit(event.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-violet-500 ${
                    isDark ? "border-slate-700 bg-[#111a24] text-slate-100" : "border-slate-200 bg-white"
                  }`}
                />
              </label>

              <label className="block space-y-1.5">
                <span className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>Earn Per Month (days)</span>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={earnedPerMonth}
                  onChange={(event) => setEarnedPerMonth(event.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-violet-500 ${
                    isDark ? "border-slate-700 bg-[#111a24] text-slate-100" : "border-slate-200 bg-white"
                  }`}
                />
                <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Use this for Earned Leave type monthly accrual.</span>
              </label>

              <label className={`inline-flex items-center gap-2 text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(event) => setIsPaid(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-violet-600"
                />
                Paid leave type
              </label>

              {editingLeaveType && (
                <label className={`inline-flex items-center gap-2 text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(event) => setIsActive(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-violet-600"
                  />
                  Active leave type
                </label>
              )}
            </div>

            {formError && <p className="mt-2 text-xs text-rose-500">{formError}</p>}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className={`rounded-xl border px-5 py-2.5 text-sm font-medium ${
                  isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"
                }`}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-[#53c4ae] px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : editingLeaveType ? "Update Leave Type" : "Create Leave Type"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export default LeaveSetupPage
