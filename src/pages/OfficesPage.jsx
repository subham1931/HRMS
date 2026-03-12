import { useCallback, useEffect, useMemo, useState } from "react"
import { Pencil, Plus, Search } from "lucide-react"
import { createOffice, listOfficeDetails, updateOfficeDetails } from "../services/offices"

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

function OfficesPage() {
  const [offices, setOffices] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingOffice, setEditingOffice] = useState(null)
  const [officeName, setOfficeName] = useState("")
  const [officeActive, setOfficeActive] = useState(true)
  const [formError, setFormError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const loadOffices = useCallback(async () => {
    setIsLoading(true)
    setLoadError("")
    try {
      const rows = await listOfficeDetails()
      setOffices(rows)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load offices.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOffices()
  }, [loadOffices])

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return offices
    return offices.filter((item) => item.name.toLowerCase().includes(query))
  }, [offices, searchQuery])

  const openCreateModal = () => {
    setEditingOffice(null)
    setOfficeName("")
    setOfficeActive(true)
    setFormError("")
    setShowModal(true)
  }

  const openUpdateModal = (row) => {
    setEditingOffice(row)
    setOfficeName(row.name || "")
    setOfficeActive(Boolean(row.isActive))
    setFormError("")
    setShowModal(true)
  }

  const closeModal = () => {
    if (isSaving) return
    setShowModal(false)
    setEditingOffice(null)
    setOfficeName("")
    setOfficeActive(true)
    setFormError("")
  }

  const handleSave = async () => {
    const nextName = String(officeName || "").trim()
    if (!nextName) {
      setFormError("Office name is required.")
      return
    }

    setIsSaving(true)
    setFormError("")
    try {
      if (editingOffice?.id) {
        await updateOfficeDetails(editingOffice.id, {
          name: nextName,
          isActive: officeActive,
        })
      } else {
        await createOffice(nextName)
      }
      setShowModal(false)
      await loadOffices()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to save office.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Office Setup</h2>
          <p className="text-sm text-slate-500">Create and update office locations.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#53c4ae] px-4 py-2.5 text-sm font-medium text-white sm:w-auto"
        >
          <Plus size={16} />
          Add Office
        </button>
      </div>

      <div className="mb-4">
        <div className="relative w-full sm:max-w-[360px]">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-3 text-sm outline-none focus:border-violet-300"
            placeholder="Search office"
          />
        </div>
      </div>

      {loadError && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {loadError}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-slate-100 text-sm text-slate-400">
            <tr>
              <th className="pb-3 font-medium">Office</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Created</th>
              <th className="pb-3 font-medium">Last Updated</th>
              <th className="pb-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {!isLoading && filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 last:border-0">
                <td className="py-3.5 font-medium text-slate-800">{row.name}</td>
                <td className="py-3.5">
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      row.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {row.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3.5 text-slate-600">{formatDateTime(row.createdAt)}</td>
                <td className="py-3.5 text-slate-600">{formatDateTime(row.updatedAt)}</td>
                <td className="py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => openUpdateModal(row)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil size={14} />
                    Update
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && filteredRows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                  No offices found.
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                  Loading offices...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-[430px] rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-[20px] font-semibold tracking-tight text-slate-900">
              {editingOffice ? "Update Office" : "Add Office"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {editingOffice
                ? "Update office details and status."
                : "Create a new office location for your organization."}
            </p>

            <div className="mt-5 space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-600">Office Name</span>
                <input
                  value={officeName}
                  onChange={(event) => {
                    setOfficeName(event.target.value)
                    if (formError) setFormError("")
                  }}
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none ${
                    formError ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-violet-500"
                  }`}
                  placeholder="Enter office name"
                />
              </label>

              {editingOffice && (
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={officeActive}
                    onChange={(event) => setOfficeActive(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-violet-600"
                  />
                  Active office
                </label>
              )}
            </div>

            {formError && <p className="mt-2 text-xs text-rose-500">{formError}</p>}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600"
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
                {isSaving ? "Saving..." : editingOffice ? "Update Office" : "Create Office"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export default OfficesPage
