import { BriefcaseBusiness, Calendar, ChevronDown, CircleUserRound, FileText, Lock, Upload } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

const steps = [
  { id: "personal", label: "Personal Information", icon: CircleUserRound },
  { id: "professional", label: "Professional Information", icon: BriefcaseBusiness },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "access", label: "Account Access", icon: Lock },
]

const fieldInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-violet-500"

function TextField({ label, placeholder, value, onChange, invalid, required = false, readOnly = false }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-600">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      <input
        autoComplete="off"
        required={required}
        readOnly={readOnly}
        className={`${fieldInputClass} ${readOnly ? "bg-slate-50 text-slate-600" : ""} ${invalid ? "border-rose-400 focus:border-rose-500" : ""}`}
        placeholder={placeholder || label}
        value={value}
        onChange={onChange}
      />
    </label>
  )
}

function SelectField({ label, placeholder, value, onChange, options = [], invalid, required = false }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-600">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      <div className="relative">
        <select
          required={required}
          className={`${fieldInputClass} appearance-none pr-9 ${value ? "text-slate-700" : "text-slate-400"} ${
            invalid ? "border-rose-400 focus:border-rose-500" : ""
          }`}
          value={value}
          onChange={onChange}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  )
}

function DateField({ label, placeholder, value, onChange, invalid, required = false }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-600">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      <div className="relative">
        <input
          type="date"
          required={required}
          placeholder={placeholder || label}
          className={`${fieldInputClass} appearance-none pr-9 scheme-light [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 ${
            invalid ? "border-rose-400 focus:border-rose-500" : ""
          }`}
          value={value}
          onChange={onChange}
        />
        <Calendar size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>
    </label>
  )
}

const documentSections = [
  {
    title: "Educational Certificates",
    cards: [
      "Upload 10th Certificate",
      "Upload 12th Certificate",
      "Upload Graduation Certificate",
      "Upload Post Graduation Certificate",
    ],
  },
  {
    title: "ID Proof",
    cards: ["Upload Aadhaar Card", "Upload PAN Card"],
  },
  {
    title: "Bank Details",
    cards: ["Upload Bank Details"],
  },
]

function DocumentsGrid({ uploadedDocs, setUploadedDocs }) {
  const fileInputRefs = useRef({})

  return (
    <div className="space-y-6">
      {documentSections.map((section) => (
        <div key={section.title}>
          <h4 className="mb-3 text-sm font-semibold text-slate-800">{section.title}</h4>
          <div className="grid gap-4 md:grid-cols-2">
            {section.cards.map((label) => (
              <div key={label} className="space-y-2">
                <p className="text-sm text-slate-600">{label}</p>
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[label]?.click()}
                  className="flex h-32 w-full flex-col items-center justify-center rounded-xl border border-dashed border-violet-300 bg-slate-50 text-slate-500"
                >
                  <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white">
                    <Upload size={18} />
                  </span>
                  <p className="text-sm">
                    Drag & Drop or <span className="font-medium text-violet-400">choose file</span> to upload
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Supported formats : Jpeg, png, pdf</p>
                  {uploadedDocs[label]?.name && (
                    <p className="mt-1 truncate text-xs font-medium text-emerald-600">{uploadedDocs[label].name}</p>
                  )}
                </button>
                <input
                  ref={(element) => {
                    fileInputRefs.current[label] = element
                  }}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      setUploadedDocs((prev) => ({
                        ...prev,
                        [label]: {
                          name: file.name,
                          type: file.type || "",
                          dataUrl: String(reader.result ?? ""),
                        },
                      }))
                    }
                    reader.readAsDataURL(file)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const emptyPersonalData = {
  firstName: "",
  lastName: "",
  mobile: "",
  email: "",
  dob: "",
  maritalStatus: "",
  gender: "",
  nationality: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
}

const emptyProfessionalData = {
  employeeId: "",
  userName: "",
  employeeType: "",
  email: "",
  department: "",
  designation: "",
  workingDays: "",
  joiningDate: "",
  officeLocation: "",
}

const defaultDepartmentOptions = []

function EmployeeOnboardingModal({
  open,
  onClose,
  onAddEmployee,
  onEditEmployee,
  initialData = null,
  departmentOptions = defaultDepartmentOptions,
  presetDepartment = "",
}) {
  const [stepIndex, setStepIndex] = useState(0)
  const [personalTouched, setPersonalTouched] = useState(false)
  const [profilePreview, setProfilePreview] = useState("")
  const profileInputRef = useRef(null)
  const [personalData, setPersonalData] = useState(emptyPersonalData)
  const [professionalData, setProfessionalData] = useState(emptyProfessionalData)
  const [uploadedDocs, setUploadedDocs] = useState({})

  const currentStep = useMemo(() => steps[stepIndex], [stepIndex])
  const isLastStep = stepIndex === steps.length - 1
  const requiredPersonalFields = useMemo(
    () => ["firstName", "lastName", "mobile", "email", "dob", "maritalStatus", "gender", "nationality"],
    [],
  )
  const isPersonalComplete = requiredPersonalFields.every((key) => personalData[key].toString().trim() !== "")

  const setField = (field) => (event) => {
    const { value } = event.target
    setPersonalData((prev) => ({ ...prev, [field]: value }))
  }
  const setProfessionalField = (field) => (event) => {
    const { value } = event.target
    setProfessionalData((prev) => ({ ...prev, [field]: value }))
  }
  const generatedUserName = useMemo(() => {
    const firstName = personalData.firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, "")
    const dob = personalData.dob.trim()
    if (!firstName || !dob) return ""
    const dayPart = dob.split("-")[2] || ""
    return `${firstName}${dayPart}`
  }, [personalData.firstName, personalData.dob])

  const generatedOfficeEmail = useMemo(() => {
    const firstName = personalData.firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, "")
    if (!firstName) return ""
    return `${firstName}@mensou.com`
  }, [personalData.firstName])

  const accountEmail = generatedOfficeEmail || personalData.email.trim() || professionalData.email.trim()
  const generatedPassword = useMemo(() => {
    const cleanEmployeeId = professionalData.employeeId.trim().replace(/\s+/g, "")
    const cleanName = `${personalData.firstName} ${personalData.lastName}`.trim().toLowerCase().replace(/\s+/g, "")
    if (!cleanEmployeeId || !cleanName) return ""

    const source = `${cleanName}${cleanEmployeeId}`.replace(/[^a-z0-9]/gi, "")
    let hash = 0
    for (let i = 0; i < source.length; i += 1) {
      hash = (hash * 31 + source.charCodeAt(i)) >>> 0
    }
    const shortPassword = hash.toString(36).toLowerCase().padStart(6, "0").slice(0, 6)
    return shortPassword
  }, [personalData.firstName, personalData.lastName, professionalData.employeeId])

  const isFieldInvalid = (field) => personalTouched && personalData[field].toString().trim() === ""
  const isEditMode = Boolean(initialData)

  useEffect(() => {
    if (!open) return
    if (initialData) {
      const parts = (initialData.name || "").trim().split(/\s+/)
      const firstName = initialData.firstName || parts[0] || ""
      const lastName = initialData.lastName || parts.slice(1).join(" ") || ""
      setPersonalData({
        ...emptyPersonalData,
        firstName,
        lastName,
        mobile: initialData.mobile || "",
        email: initialData.email || "",
        dob: initialData.dob || "",
        maritalStatus: initialData.maritalStatus || "",
        gender: initialData.gender || "",
        nationality: initialData.nationality || "",
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        zipCode: initialData.zipCode || "",
      })
      setProfessionalData({
        ...emptyProfessionalData,
        employeeId: initialData.employeeId || "",
        userName: initialData.userName || "",
        employeeType: initialData.type || "",
        email: initialData.officeEmail || "",
        department: initialData.department || "",
        designation: initialData.designation || "",
        workingDays: initialData.workingDays || "",
        joiningDate: initialData.joiningDate || "",
        officeLocation: initialData.officeLocation || "",
      })
      setProfilePreview(initialData.profileImage || "")
      setUploadedDocs(initialData.documents || {})
    } else {
      setPersonalData(emptyPersonalData)
      setProfessionalData({
        ...emptyProfessionalData,
        department: presetDepartment || "",
      })
      setProfilePreview("")
      setUploadedDocs({})
    }
    setStepIndex(0)
    setPersonalTouched(false)
  }, [open, initialData, presetDepartment])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/65 p-4">
      <div className="mx-auto max-h-[calc(100dvh-2rem)] max-w-5xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-800">
        <div className="mb-5 flex flex-wrap items-center gap-6 border-b border-slate-200 pb-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            const active = index === stepIndex
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  // Temporarily allow free step navigation during development.
                  setStepIndex(index)
                }}
                className={`inline-flex items-center gap-2 border-b-2 pb-2 text-sm ${
                  active ? "border-violet-500 text-violet-600" : "border-transparent text-slate-400"
                }`}
              >
                <Icon size={16} />
                {step.label}
              </button>
            )
          })}
        </div>

        <div className="space-y-4">
          {currentStep.id === "personal" && (
            <>
              <div className="flex justify-center">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    className="inline-flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border border-slate-200 text-slate-400"
                  >
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile preview" className="h-full w-full object-cover" />
                    ) : (
                      <CircleUserRound size={24} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    className="mt-2 inline-flex items-center rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-600"
                  >
                    {profilePreview ? "Change Photo" : "Add Photo"}
                  </button>
                  <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = () => setProfilePreview(String(reader.result ?? ""))
                      reader.readAsDataURL(file)
                    }}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <TextField label="First Name" placeholder="Enter first name" value={personalData.firstName} onChange={setField("firstName")} invalid={isFieldInvalid("firstName")} required />
                <TextField label="Last Name" placeholder="Enter last name" value={personalData.lastName} onChange={setField("lastName")} invalid={isFieldInvalid("lastName")} required />
                <TextField label="Mobile Number" placeholder="Enter mobile number" value={personalData.mobile} onChange={setField("mobile")} invalid={isFieldInvalid("mobile")} required />
                <TextField label="Email Address" placeholder="Enter email address" value={personalData.email} onChange={setField("email")} invalid={isFieldInvalid("email")} required />
                <DateField label="Date of Birth" placeholder="Select date of birth" value={personalData.dob} onChange={setField("dob")} invalid={isFieldInvalid("dob")} required />
                <SelectField
                  label="Marital Status"
                  placeholder="Select marital status"
                  value={personalData.maritalStatus}
                  onChange={setField("maritalStatus")}
                  options={["Single", "Married", "Divorced", "Widowed"]}
                  invalid={isFieldInvalid("maritalStatus")}
                  required
                />
                <SelectField
                  label="Gender"
                  placeholder="Select gender"
                  value={personalData.gender}
                  onChange={setField("gender")}
                  options={["Male", "Female", "Other"]}
                  invalid={isFieldInvalid("gender")}
                  required
                />
                <SelectField
                  label="Nationality"
                  placeholder="Select nationality"
                  value={personalData.nationality}
                  onChange={setField("nationality")}
                  options={["Indian", "American", "Canadian", "Other"]}
                  invalid={isFieldInvalid("nationality")}
                  required
                />
              </div>
              <TextField label="Address" placeholder="Enter address" value={personalData.address} onChange={setField("address")} invalid={isFieldInvalid("address")} />
              <div className="grid gap-4 md:grid-cols-3">
                <TextField label="City" placeholder="Enter city" value={personalData.city} onChange={setField("city")} invalid={isFieldInvalid("city")} />
                <TextField label="State" placeholder="Enter state" value={personalData.state} onChange={setField("state")} invalid={isFieldInvalid("state")} />
                <TextField label="ZIP Code" placeholder="Enter ZIP code" value={personalData.zipCode} onChange={setField("zipCode")} invalid={isFieldInvalid("zipCode")} />
              </div>
              {/* Temporarily hidden during development:
                  <p className="text-sm text-rose-500">Please fill all required personal information fields to continue.</p>
              */}
            </>
          )}

          {currentStep.id === "professional" && (
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Employee ID"
                placeholder="Enter employee ID"
                value={professionalData.employeeId}
                onChange={setProfessionalField("employeeId")}
                readOnly={isEditMode}
                required
              />
              <TextField
                label="User Name"
                placeholder="Auto-generated from first name and DOB"
                value={generatedUserName}
                readOnly
                required
              />
              <SelectField
                label="Employment Type"
                placeholder="Select employment type"
                value={professionalData.employeeType}
                onChange={setProfessionalField("employeeType")}
                options={["Office", "Remote", "Work from Home", "Contract"]}
                required
              />
              <TextField
                label="Office Email Address"
                placeholder="Auto-generated from first name"
                value={generatedOfficeEmail}
                readOnly
                required
              />
              <SelectField
                label="Department"
                placeholder="Select department"
                value={professionalData.department}
                onChange={setProfessionalField("department")}
                options={departmentOptions}
                required
              />
              <TextField
                label="Designation"
                placeholder="Enter designation"
                value={professionalData.designation}
                onChange={setProfessionalField("designation")}
                required
              />
              <SelectField
                label="Working Days"
                placeholder="Select working days"
                value={professionalData.workingDays}
                onChange={setProfessionalField("workingDays")}
                options={["Monday - Friday", "Monday - Saturday", "Rotational"]}
                required
              />
              <DateField
                label="Joining Date"
                placeholder="Select joining date"
                value={professionalData.joiningDate}
                onChange={setProfessionalField("joiningDate")}
                required
              />
              <div className="md:col-span-2">
                <SelectField
                  label="Office Location"
                  placeholder="Select office location"
                  value={professionalData.officeLocation}
                  onChange={setProfessionalField("officeLocation")}
                  options={["Kolkata", "Bangalore"]}
                  required
                />
              </div>
            </div>
          )}

          {currentStep.id === "documents" && <DocumentsGrid uploadedDocs={uploadedDocs} setUploadedDocs={setUploadedDocs} />}

          {currentStep.id === "access" && (
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Employee Email Address"
                placeholder="Email from personal information"
                value={accountEmail}
                readOnly
              />
              <TextField
                label="Generated Password"
                placeholder="Password will auto-generate"
                value={generatedPassword}
                readOnly
              />
              {!generatedPassword && (
                <p className="md:col-span-2 text-sm text-amber-600">
                  Enter Employee ID and Joining Date in Professional Information, and Email in Personal Information to generate password.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-500"
          >
            Cancel
          </button>
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
              className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-600"
            >
              Previous
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              // Temporarily allow progressing without required personal fields.

              if (isLastStep) {
                const fullName = `${personalData.firstName} ${personalData.lastName}`.trim()
                const payload = {
                  name: fullName || "New Employee",
                  employeeId: professionalData.employeeId || initialData?.employeeId || `EMP${Date.now().toString().slice(-6)}`,
                  department: professionalData.department || "Design",
                  designation: professionalData.designation || "UI/UX Designer",
                  type: professionalData.employeeType || "Office",
                  status: initialData?.status || "Permanent",
                  mobile: personalData.mobile,
                  email: personalData.email,
                  dob: personalData.dob,
                  maritalStatus: personalData.maritalStatus,
                  gender: personalData.gender,
                  nationality: personalData.nationality,
                  address: personalData.address,
                  city: personalData.city,
                  state: personalData.state,
                  zipCode: personalData.zipCode,
                  userName: generatedUserName,
                  officeEmail: generatedOfficeEmail,
                  workingDays: professionalData.workingDays,
                  joiningDate: professionalData.joiningDate,
                  officeLocation: professionalData.officeLocation,
                  generatedPassword,
                  profileImage: profilePreview,
                  documents: uploadedDocs,
                }

                if (isEditMode && typeof onEditEmployee === "function") {
                  onEditEmployee(payload)
                } else if (typeof onAddEmployee === "function") {
                  onAddEmployee(payload)
                }
                onClose()
                setStepIndex(0)
                setPersonalTouched(false)
                setPersonalData(emptyPersonalData)
                setProfilePreview("")
                setProfessionalData(emptyProfessionalData)
                setUploadedDocs({})
                return
              }
              setStepIndex((prev) => prev + 1)
            }}
            className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-medium text-white"
          >
            {isLastStep ? (isEditMode ? "Save" : "Add") : "Next"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmployeeOnboardingModal
