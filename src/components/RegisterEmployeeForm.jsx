import { ArrowLeft, Calendar, Check, ChevronDown, Upload } from "lucide-react"
import { useMemo, useRef, useState } from "react"

const stepLabels = [
  "Personal & Contact Information",
  "Employment & Payroll Details",
  "Allowances, Benefits & Documents",
]

const countryCodes = [
  "+1", "+7", "+20", "+27", "+30", "+31", "+32", "+33", "+34", "+36", "+39", "+40", "+41", "+43", "+44", "+45",
  "+46", "+47", "+48", "+49", "+51", "+52", "+53", "+54", "+55", "+56", "+57", "+58", "+60", "+61", "+62", "+63",
  "+64", "+65", "+66", "+81", "+82", "+84", "+86", "+90", "+91", "+92", "+93", "+94", "+95", "+98", "+211", "+212",
  "+213", "+216", "+218", "+220", "+221", "+222", "+223", "+224", "+225", "+226", "+227", "+228", "+229", "+230",
  "+231", "+232", "+233", "+234", "+235", "+236", "+237", "+238", "+239", "+240", "+241", "+242", "+243", "+244",
  "+245", "+246", "+248", "+249", "+250", "+251", "+252", "+253", "+254", "+255", "+256", "+257", "+258", "+260",
  "+261", "+262", "+263", "+264", "+265", "+266", "+267", "+268", "+269", "+290", "+291", "+297", "+298", "+299",
  "+350", "+351", "+352", "+353", "+354", "+355", "+356", "+357", "+358", "+359", "+370", "+371", "+372", "+373",
  "+374", "+375", "+376", "+377", "+378", "+380", "+381", "+382", "+385", "+386", "+387", "+389", "+420", "+421",
  "+423", "+500", "+501", "+502", "+503", "+504", "+505", "+506", "+507", "+508", "+509", "+590", "+591", "+592",
  "+593", "+594", "+595", "+596", "+597", "+598", "+599", "+670", "+672", "+673", "+674", "+675", "+676", "+677",
  "+678", "+679", "+680", "+681", "+682", "+683", "+685", "+686", "+687", "+688", "+689", "+690", "+691", "+692",
  "+850", "+852", "+853", "+855", "+856", "+880", "+886", "+960", "+961", "+962", "+963", "+964", "+965", "+966",
  "+967", "+968", "+970", "+971", "+972", "+973", "+974", "+975", "+976", "+977", "+992", "+993", "+994", "+995",
  "+996", "+998",
]

const inputClass =
  "w-full rounded-lg border border-transparent bg-[#f3f4f4] px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#53c4ae]"
const ADD_DEPARTMENT_OPTION = "__add_new_department__"

function RegisterEmployeeForm({ departmentOptions = [], onCancel, onSubmit, onAddDepartment }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    email: "",
    phoneCode: "+91",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    employeeId: `EMP-${Date.now().toString().slice(-4)}`,
    joinDate: "2035-06-19",
    jobTitle: "",
    department: "",
    employmentType: "",
    workModel: "On-Site",
    salary: "",
    bankName: "e.g. Barclays UK",
    bankAccount: "e.g. 12345678",
    taxId: "e.g. AB123456C",
    activeEmployee: true,
    sendWelcomeEmail: false,
  })
  const [allowances, setAllowances] = useState({
    transportation: true,
    meal: true,
    internet: false,
  })
  const [benefits, setBenefits] = useState({
    healthInsurance: true,
    lifeInsurance: true,
    companyDevice: true,
    trainingProgram: true,
    tuition: false,
    fitnessMembership: true,
    mentalHealthSupport: false,
  })
  const [documents, setDocuments] = useState({
    cv: "",
    id: "",
    contract: "",
    offerLetter: "",
  })
  const [errors, setErrors] = useState({})
  const inputRefs = useRef({})
  const profileInputRef = useRef(null)
  const [profileImage, setProfileImage] = useState("")

  const resolvedDepartments = useMemo(() => departmentOptions, [departmentOptions])
  const allBenefitsSelected = useMemo(() => Object.values(benefits).every(Boolean), [benefits])

  const setField = (key) => (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: "" }))
  }
  const handleDepartmentChange = (event) => {
    const { value } = event.target
    if (value === ADD_DEPARTMENT_OPTION) {
      const nextDepartment = window.prompt("Enter new department name")
      const normalized = (nextDepartment || "").trim()
      if (!normalized) return
      if (typeof onAddDepartment === "function") {
        onAddDepartment(normalized)
      }
      setForm((prev) => ({ ...prev, department: normalized }))
      setErrors((prev) => ({ ...prev, department: "" }))
      return
    }
    setForm((prev) => ({ ...prev, department: value }))
    setErrors((prev) => ({ ...prev, department: "" }))
  }

  const validateStep = () => {
    const nextErrors = {}
    if (stepIndex === 0) {
      if (!form.firstName.trim()) nextErrors.firstName = "First name is required"
      if (!form.lastName.trim()) nextErrors.lastName = "Last name is required"
      if (!form.phone.trim()) nextErrors.phone = "Mobile number is required"
      if (!form.dob) nextErrors.dob = "Date of birth is required"
      if (!form.gender) nextErrors.gender = "Gender is required"
      if (!form.email.trim()) nextErrors.email = "Email is required"
      if (!form.address.trim()) nextErrors.address = "Please provide a valid mailing address"
      if (!form.city.trim()) nextErrors.city = "City is required"
      if (!form.state.trim()) nextErrors.state = "State is required"
      if (!form.zipCode.trim()) nextErrors.zipCode = "Zip code is required"
    }
    if (stepIndex === 1) {
      if (!form.joinDate) nextErrors.joinDate = "Join date is required"
      if (!form.jobTitle.trim()) nextErrors.jobTitle = "Job title is required"
      if (!form.department.trim()) nextErrors.department = "Department is required"
      if (!form.employmentType.trim()) nextErrors.employmentType = "Employment type is required"
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = () => {
    const fullName = `${form.firstName} ${form.lastName}`.trim()
    const payload = {
      name: fullName || "New Employee",
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      employeeId: form.employeeId || `EMP${Date.now().toString().slice(-6)}`,
      department: form.department || "Operations",
      designation: form.jobTitle || "Employee",
      type: form.workModel || "On-Site",
      status: form.activeEmployee ? "Active" : "Inactive",
      mobile: form.phone,
      email: form.email,
      dob: form.dob,
      address: form.address,
      city: form.city,
      state: form.state,
      zipCode: form.zipCode,
      profileImage,
      officeEmail: form.email,
      joiningDate: form.joinDate,
      documents: {
        ...documents,
        allowances,
        benefits,
      },
    }
    onSubmit(payload)
  }

  const uploadBox = (key, label) => (
    <div className="grid gap-3 md:grid-cols-[150px_1fr]">
      <p className="pt-3 text-sm text-slate-600">{label}</p>
      <button
        type="button"
        onClick={() => inputRefs.current[key]?.click()}
        className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-[#f7f7f7] px-4 py-3 text-left text-sm text-slate-500"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#def4ec] text-[#53c4ae]">
          <Upload size={14} />
        </span>
        <span>
          <span className="font-semibold text-slate-700">Click to Upload</span> or drag & drop
          <span className="block text-xs text-slate-400">PDF, DOC, PNG, JPG (max. 2.5 MB)</span>
          {documents[key] ? <span className="block text-xs font-medium text-emerald-600">{documents[key]}</span> : null}
        </span>
        <input
          ref={(element) => {
            inputRefs.current[key] = element
          }}
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (!file) return
            setDocuments((prev) => ({ ...prev, [key]: file.name }))
          }}
        />
      </button>
    </div>
  )

  return (
    <div className="mx-auto rounded-2xl border border-slate-200 bg-white text-sm text-slate-800">
      <div className="grid md:grid-cols-[240px_1fr]">
        <aside className="border-r border-slate-200 p-6">
          <button
            type="button"
            onClick={onCancel}
            className="mb-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={13} />
            Back
          </button>
          <h2 className="text-2xl font-semibold leading-tight text-slate-800">Register New Employee</h2>
          <p className="mt-2 text-xs text-slate-500">
            Enter all required employment details to formally add a new member to your organization.
          </p>
          <div className="mt-10">
            {stepLabels.map((label, index) => {
              const active = index === stepIndex
              const done = index < stepIndex
              return (
                <div key={label} className="relative flex items-start gap-3 pb-7 last:pb-0">
                  {index < stepLabels.length - 1 && (
                    <span className="absolute left-[8px] bottom-[-28px] top-[9px] w-px overflow-hidden bg-slate-200">
                      <span
                        className={`absolute inset-x-0 top-0 h-full origin-top bg-[#53c4ae] transition-transform duration-500 ease-out ${
                          done ? "scale-y-100" : "scale-y-0"
                        }`}
                      />
                    </span>
                  )}
                  <span className={`relative z-10 mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border transition-colors duration-300 ${
                    active || done ? "border-[#53c4ae] bg-[#53c4ae]" : "border-slate-300 bg-white"
                  }`}>
                    {active && !done ? <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-[#53c4ae]/35" /> : null}
                    {done ? <Check size={10} className="text-white" /> : null}
                  </span>
                  <p className={`text-sm leading-5 transition-colors duration-300 ${active || done ? "font-semibold text-slate-700" : "text-slate-400"}`}>{label}</p>
                </div>
              )
            })}
          </div>
        </aside>

        <section className="p-6 md:p-8">
          <p className="text-xs text-slate-400">Step {stepIndex + 1}/3</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-800">{stepLabels[stepIndex]}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {stepIndex === 0 && "Enter the employee's personal details and primary contact information to initiate their HR record"}
            {stepIndex === 1 && "Provide essential employment data and payroll setup to configure the employee's role and compensation"}
            {stepIndex === 2 && "Configure employee perks, attach required documents, and finalize their status within the system"}
          </p>
          <div className="mt-4 border-b border-slate-200" />

          <div className="mt-5 space-y-5">
            {stepIndex === 0 && (
              <>
                <h4 className="text-base font-semibold text-slate-700">Personal Info</h4>
                <div className="mb-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    className="inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-[#f3f4f4] text-slate-400"
                  >
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <Upload size={16} />
                    )}
                  </button>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Profile Photo</p>
                    <button type="button" onClick={() => profileInputRef.current?.click()} className="text-xs text-[#53c4ae]">
                      Click to upload
                    </button>
                  </div>
                  <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (!file) return
                      const reader = new FileReader()
                      reader.onload = () => setProfileImage(String(reader.result ?? ""))
                      reader.readAsDataURL(file)
                    }}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>First Name <span className="text-rose-500">*</span></span>
                    <input
                      required
                      value={form.firstName}
                      onChange={setField("firstName")}
                      placeholder="Enter first name"
                      className={`${inputClass} ${errors.firstName ? "border-rose-400" : ""}`}
                    />
                    {errors.firstName ? <span className="text-xs text-rose-500">{errors.firstName}</span> : null}
                  </label>
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>Last Name <span className="text-rose-500">*</span></span>
                    <input
                      required
                      value={form.lastName}
                      onChange={setField("lastName")}
                      placeholder="Enter last name"
                      className={`${inputClass} ${errors.lastName ? "border-rose-400" : ""}`}
                    />
                    {errors.lastName ? <span className="text-xs text-rose-500">{errors.lastName}</span> : null}
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>Mobile Number <span className="text-rose-500">*</span></span>
                    <div className={`flex rounded-lg bg-[#f3f4f4] ${errors.phone ? "border border-rose-400" : ""}`}>
                      <select
                        value={form.phoneCode}
                        onChange={setField("phoneCode")}
                        className="cursor-pointer rounded-l-lg border-r border-slate-200 bg-transparent px-2.5 py-2.5 text-sm text-slate-600 outline-none"
                      >
                        {countryCodes.map((code) => (
                          <option key={`phone-${code}`} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                      <input
                        required
                        value={form.phone}
                        onChange={setField("phone")}
                        placeholder="Enter mobile number"
                        className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                      />
                    </div>
                    {errors.phone ? <span className="text-xs text-rose-500">{errors.phone}</span> : null}
                  </label>
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>Email Address <span className="text-rose-500">*</span></span>
                    <input
                      required
                      value={form.email}
                      onChange={setField("email")}
                      placeholder="Enter email address"
                      className={`${inputClass} ${errors.email ? "border-rose-400" : ""}`}
                    />
                    {errors.email ? <span className="text-xs text-rose-500">{errors.email}</span> : null}
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>Date of Birth <span className="text-rose-500">*</span></span>
                    <div className="relative">
                      <input
                        type="date"
                        required
                        value={form.dob}
                        onChange={setField("dob")}
                        placeholder="Select date of birth"
                        className={`${inputClass} pr-9 ${errors.dob ? "border-rose-400" : ""}`}
                      />
                      <Calendar size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    {errors.dob ? <span className="text-xs text-rose-500">{errors.dob}</span> : null}
                  </label>
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>Gender <span className="text-rose-500">*</span></span>
                    <div className="relative">
                      <select required value={form.gender} onChange={setField("gender")} className={`${inputClass} appearance-none pr-8 ${errors.gender ? "border-rose-400" : ""}`}>
                        <option value="" disabled>
                          Select gender
                        </option>
                        {["Male", "Female", "Prefer not to say"].map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    {errors.gender ? <span className="text-xs text-rose-500">{errors.gender}</span> : null}
                  </label>
                </div>
                <label className="space-y-1 text-sm text-slate-500">
                  <span>Address <span className="text-rose-500">*</span></span>
                  <input
                    required
                    value={form.address}
                    onChange={setField("address")}
                    placeholder="Enter address"
                    className={`${inputClass} ${errors.address ? "border-rose-400" : ""}`}
                  />
                  {errors.address ? <span className="text-xs text-rose-500">{errors.address}</span> : null}
                </label>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>City <span className="text-rose-500">*</span></span>
                    <input
                      required
                      value={form.city}
                      onChange={setField("city")}
                      placeholder="Enter city"
                      className={`${inputClass} ${errors.city ? "border-rose-400" : ""}`}
                    />
                    {errors.city ? <span className="text-xs text-rose-500">{errors.city}</span> : null}
                  </label>
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>State <span className="text-rose-500">*</span></span>
                    <input
                      required
                      value={form.state}
                      onChange={setField("state")}
                      placeholder="Enter state"
                      className={`${inputClass} ${errors.state ? "border-rose-400" : ""}`}
                    />
                    {errors.state ? <span className="text-xs text-rose-500">{errors.state}</span> : null}
                  </label>
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>Zip Code <span className="text-rose-500">*</span></span>
                    <input
                      required
                      value={form.zipCode}
                      onChange={setField("zipCode")}
                      placeholder="Enter zip code"
                      className={`${inputClass} ${errors.zipCode ? "border-rose-400" : ""}`}
                    />
                    {errors.zipCode ? <span className="text-xs text-rose-500">{errors.zipCode}</span> : null}
                  </label>
                </div>
              </>
            )}

            {stepIndex === 1 && (
              <>
                <h4 className="text-base font-semibold text-slate-700">Employment Details</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>Employee ID</span>
                    <input value={form.employeeId} onChange={setField("employeeId")} className={inputClass} />
                    <span className="text-xs text-slate-400">*Auto-generated</span>
                  </label>
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>Join Date <span className="text-rose-500">*</span></span>
                    <div className="relative">
                      <input required type="date" value={form.joinDate} onChange={setField("joinDate")} className={`${inputClass} pr-9 ${errors.joinDate ? "border-rose-400" : ""}`} />
                      <Calendar size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    {errors.joinDate ? <span className="text-xs text-rose-500">{errors.joinDate}</span> : null}
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>Job Title <span className="text-rose-500">*</span></span>
                    <input
                      required
                      value={form.jobTitle}
                      onChange={setField("jobTitle")}
                      placeholder="Select job title"
                      className={`${inputClass} ${errors.jobTitle ? "border-rose-400" : ""}`}
                    />
                    {errors.jobTitle ? <span className="text-xs text-rose-500">{errors.jobTitle}</span> : null}
                  </label>
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>Department <span className="text-rose-500">*</span></span>
                    <div className="relative">
                      <select required value={form.department} onChange={handleDepartmentChange} className={`${inputClass} appearance-none pr-8 ${errors.department ? "border-rose-400" : ""}`}>
                        <option value="">Select Department</option>
                        {resolvedDepartments.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                        <option value={ADD_DEPARTMENT_OPTION}>+ Add new department</option>
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </label>
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>Employment Type <span className="text-rose-500">*</span></span>
                    <div className="relative">
                      <select required value={form.employmentType} onChange={setField("employmentType")} className={`${inputClass} appearance-none pr-8 ${errors.employmentType ? "border-rose-400" : ""}`}>
                        <option value="" disabled>
                          Select employment type
                        </option>
                        {["Full-Time", "Part-Time", "Internship", "Freelance"].map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    {errors.employmentType ? <span className="text-xs text-rose-500">{errors.employmentType}</span> : null}
                  </label>
                </div>

                <div className="grid gap-2 md:grid-cols-3">
                  {["On-Site", "Hybrid", "Remote"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, workModel: item }))}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm ${
                        form.workModel === item ? "border-[#53c4ae] bg-[#edf7f3]" : "border-transparent bg-[#f3f4f4] text-slate-600"
                      }`}
                    >
                      <span>{item}</span>
                      <span className={`h-3.5 w-3.5 rounded-full border ${
                        form.workModel === item ? "border-[#53c4ae] bg-[#53c4ae]" : "border-slate-300 bg-white"
                      }`} />
                    </button>
                  ))}
                </div>

                <h4 className="pt-2 text-base font-semibold text-slate-700">Payroll Info</h4>
                <label className="space-y-1 text-sm text-slate-500">
                  <span>Salary</span>
                  <div className="relative">
                    <input
                      value={form.salary}
                      onChange={setField("salary")}
                      placeholder="e.g. INR 50,000"
                      className={`${inputClass} pr-24`}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">INR /month</span>
                  </div>
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>Bank Name</span>
                    <input value={form.bankName} onChange={setField("bankName")} className={inputClass} />
                  </label>
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>Bank Account Number</span>
                    <input value={form.bankAccount} onChange={setField("bankAccount")} className={inputClass} />
                  </label>
                </div>
                <label className="space-y-1 text-sm text-slate-500">
                  <span>Tax Identification Number (NPWP)</span>
                  <input value={form.taxId} onChange={setField("taxId")} className={inputClass} />
                </label>
              </>
            )}

            {stepIndex === 2 && (
              <>
                <h4 className="text-base font-semibold text-slate-700">Allowances</h4>
                <div className="space-y-2 text-sm text-slate-600">
                  {[
                    { key: "transportation", label: "Transportation" },
                    { key: "meal", label: "Meal" },
                    { key: "internet", label: "Internet (Remote & Hybrid only)" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setAllowances((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className="inline-flex items-center gap-2"
                    >
                      <span className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border ${
                        allowances[item.key] ? "border-[#53c4ae] bg-[#53c4ae]" : "border-slate-300 bg-white"
                      }`}>
                        {allowances[item.key] ? <Check size={10} className="text-white" /> : null}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                <h4 className="pt-3 text-base font-semibold text-slate-700">Benefits</h4>
                <button
                  type="button"
                  onClick={() => {
                    const next = !allBenefitsSelected
                    setBenefits((prev) => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: next }), {}))
                  }}
                  className="inline-flex items-center gap-2 text-sm text-slate-600"
                >
                  <span className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border ${
                    allBenefitsSelected ? "border-[#53c4ae] bg-[#53c4ae]" : "border-slate-300 bg-white"
                  }`}>
                    {allBenefitsSelected ? <Check size={10} className="text-white" /> : null}
                  </span>
                  Select All
                </button>

                <div className="mt-2 grid gap-5 border-t border-slate-200 pt-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500">Insurance</p>
                    {[
                      { key: "healthInsurance", label: "Health Insurance" },
                      { key: "lifeInsurance", label: "Life Insurance" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setBenefits((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className="inline-flex items-center gap-2 text-sm text-slate-600"
                      >
                        <span className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border ${
                          benefits[item.key] ? "border-[#53c4ae] bg-[#53c4ae]" : "border-slate-300 bg-white"
                        }`}>
                          {benefits[item.key] ? <Check size={10} className="text-white" /> : null}
                        </span>
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500">Work-Related Perks</p>
                    <button
                      type="button"
                      onClick={() => setBenefits((prev) => ({ ...prev, companyDevice: !prev.companyDevice }))}
                      className="inline-flex items-center gap-2 text-sm text-slate-600"
                    >
                      <span className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border ${
                        benefits.companyDevice ? "border-[#53c4ae] bg-[#53c4ae]" : "border-slate-300 bg-white"
                      }`}>
                        {benefits.companyDevice ? <Check size={10} className="text-white" /> : null}
                      </span>
                      Company Device
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500">Development & Wellness</p>
                    {[
                      { key: "trainingProgram", label: "Training Program" },
                      { key: "tuition", label: "Tuition" },
                      { key: "fitnessMembership", label: "Fitness Membership" },
                      { key: "mentalHealthSupport", label: "Mental Health Support" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setBenefits((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className="inline-flex items-center gap-2 text-sm text-slate-600"
                      >
                        <span className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border ${
                          benefits[item.key] ? "border-[#53c4ae] bg-[#53c4ae]" : "border-slate-300 bg-white"
                        }`}>
                          {benefits[item.key] ? <Check size={10} className="text-white" /> : null}
                        </span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <h4 className="pt-3 text-base font-semibold text-slate-700">Documents</h4>
                <div className="space-y-3">
                  {uploadBox("cv", "CV & Portfolio (if Any)")}
                  {uploadBox("id", "ID")}
                  {uploadBox("contract", "Contract Agreement")}
                  {uploadBox("offerLetter", "Offer Letter")}
                </div>

                <div className="pt-3 text-sm text-slate-700">
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, activeEmployee: !prev.activeEmployee }))}
                    className="flex items-center gap-2"
                  >
                    <span className={`relative h-4 w-7 rounded-full transition-colors ${form.activeEmployee ? "bg-[#53c4ae]" : "bg-slate-300"}`}>
                      <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${form.activeEmployee ? "translate-x-3.5" : "translate-x-0.5"}`} />
                    </span>
                    Active Employee
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, sendWelcomeEmail: !prev.sendWelcomeEmail }))}
                    className="mt-2 flex items-center gap-2"
                  >
                    <span className={`relative h-4 w-7 rounded-full transition-colors ${form.sendWelcomeEmail ? "bg-[#53c4ae]" : "bg-slate-300"}`}>
                      <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${form.sendWelcomeEmail ? "translate-x-3.5" : "translate-x-0.5"}`} />
                    </span>
                    Send Welcome Email
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 border-t border-slate-200 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-6 text-sm font-medium text-[#2f6f63]">
                <button type="button">Save as Draft</button>
                <button type="button" onClick={onCancel}>Discard</button>
              </div>
              <div className="flex items-center gap-2">
                {stepIndex > 0 && (
                  <button type="button" onClick={() => setStepIndex((prev) => prev - 1)} className="rounded-xl bg-[#dceac7] px-5 py-2 text-sm font-medium text-slate-700">
                    Previous
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (!validateStep()) return
                    if (stepIndex === stepLabels.length - 1) {
                      handleSubmit()
                      return
                    }
                    setStepIndex((prev) => prev + 1)
                  }}
                  className="rounded-xl bg-[#53c4ae] px-5 py-2 text-sm font-medium text-white"
                >
                  {stepIndex === stepLabels.length - 1 ? "Submit" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default RegisterEmployeeForm
