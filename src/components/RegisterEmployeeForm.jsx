import { ArrowLeft, Calendar, Check, ChevronDown, Upload } from "lucide-react"
import { useMemo, useRef, useState } from "react"

const stepLabels = [
  "Personal & Contact Information",
  "Employment & Payroll Details",
  "Documents and Credentials",
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

const INDIA_STATE_CITIES = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Tawang", "Pasighat", "Ziro"],
  Assam: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"],
  Bihar: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Purnia"],
  Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
  Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  Haryana: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"],
  Kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kannur"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
  Manipur: ["Imphal", "Thoubal", "Churachandpur", "Bishnupur", "Ukhrul"],
  Meghalaya: ["Shillong", "Tura", "Nongpoh", "Jowai", "Baghmara"],
  Mizoram: ["Aizawl", "Lunglei", "Champhai", "Kolasib", "Serchhip"],
  Nagaland: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
  Odisha: [
    "Bhubaneswar",
    "Cuttack",
    "Rourkela",
    "Sambalpur",
    "Puri",
    "Berhampur",
    "Balasore",
    "Bhadrak",
    "Baripada",
    "Jeypore",
    "Rayagada",
    "Dhenkanal",
    "Angul",
    "Jharsuguda",
    "Bargarh",
    "Paradeep",
    "Kendrapara",
    "Jagatsinghpur",
    "Koraput",
    "Nabarangpur",
  ],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
  Sikkim: ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  Tripura: ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar", "Belonia"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Noida", "Ghaziabad", "Varanasi"],
  Uttarakhand: ["Dehradun", "Haridwar", "Haldwani", "Rishikesh", "Roorkee"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
  "Andaman and Nicobar Islands": ["Port Blair"],
  Chandigarh: ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  Delhi: ["New Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua"],
  Ladakh: ["Leh", "Kargil", "Diskit", "Nubra", "Drass"],
  Lakshadweep: ["Kavaratti", "Agatti", "Amini", "Andrott"],
  Puducherry: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
}

const getInputClass = (isDark) =>
  `w-full rounded-lg border border-transparent px-3 py-2.5 text-sm outline-none focus:border-[#53c4ae] ${
    isDark ? "bg-[#0f1720] text-slate-100" : "bg-[#f3f4f4] text-slate-700"
  }`
const ADD_OFFICE_OPTION = "__add_new_office__"
const EMPLOYMENT_TYPE_LEGACY_VALUES = new Set(["full-time", "part-time", "internship", "freelance", "contract", "temporary", "permanent"])
const getValidEmploymentType = (...values) => {
  const match = values.find((value) => EMPLOYMENT_TYPE_LEGACY_VALUES.has((value || "").toLowerCase()))
  return match || ""
}
const todayIsoDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, "0")
  const day = `${now.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

const createDefaultForm = () => ({
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
  joinDate: todayIsoDate(),
  officeLocation: "",
  jobTitle: "",
  department: "",
  employmentType: "",
  workModel: "On-Site",
  salary: "",
  bankName: "e.g. Barclays UK",
  bankAccount: "e.g. 12345678",
  loginEmail: "",
  activeEmployee: true,
  sendWelcomeEmail: false,
})

const emptyDocs = { cv: "", id: "", contract: "", offerLetter: "" }

const createInitialState = (initialData) => {
  if (!initialData) {
    return {
      form: createDefaultForm(),
      documents: { ...emptyDocs },
      profileImage: "",
    }
  }

  const parts = (initialData.name || "").trim().split(/\s+/)
  const form = {
    ...createDefaultForm(),
    firstName: initialData.firstName || parts[0] || "",
    lastName: initialData.lastName || parts.slice(1).join(" ") || "",
    dob: initialData.dob || "",
    gender: initialData.gender || "",
    email: initialData.email || "",
    phone: initialData.mobile || "",
    address: initialData.address || "",
    city: initialData.city || "",
    state: initialData.state || "",
    zipCode: initialData.zipCode || "",
    employeeId: initialData.employeeId || createDefaultForm().employeeId,
    joinDate: initialData.joiningDate || "",
    officeLocation: initialData.officeLocation || "",
    jobTitle: initialData.designation || "",
    department: initialData.department || "",
    employmentType: getValidEmploymentType(initialData.employmentType, initialData.status),
    workModel: initialData.type || "On-Site",
    salary: initialData.salary || "",
    bankName: initialData.bankName || "e.g. Barclays UK",
    bankAccount: initialData.bankAccount || "e.g. 12345678",
    activeEmployee: (initialData.status || "").toLowerCase() !== "inactive",
  }
  const incomingDocs = initialData.documents || {}
  const mapDoc = (value) => (typeof value === "string" ? value : value?.name || "")
  return {
    form,
    documents: {
      cv: mapDoc(incomingDocs.cv),
      id: mapDoc(incomingDocs.id),
      contract: mapDoc(incomingDocs.contract),
      offerLetter: mapDoc(incomingDocs.offerLetter),
    },
    profileImage: initialData.profileImage || "",
  }
}

function RegisterEmployeeForm({
  appearance = "Light",
  departmentOptions = [],
  officeOptions = [],
  onCancel,
  onSubmit,
  onAddOffice,
  initialData = null,
  submitError = "",
  isSubmitting = false,
}) {
  const isDark = appearance === "Dark"
  const inputClass = getInputClass(isDark)
  const initialState = createInitialState(initialData)
  const [stepIndex, setStepIndex] = useState(0)
  const [showOfficeModal, setShowOfficeModal] = useState(false)
  const [newOfficeName, setNewOfficeName] = useState("")
  const [officeModalError, setOfficeModalError] = useState("")
  const [form, setForm] = useState(() => initialState.form)
  const [documents, setDocuments] = useState(() => initialState.documents)
  const [errors, setErrors] = useState({})
  const inputRefs = useRef({})
  const profileInputRef = useRef(null)
  const [profileImage, setProfileImage] = useState(() => initialState.profileImage)

  const resolvedDepartments = useMemo(() => departmentOptions, [departmentOptions])
  const resolvedOffices = useMemo(() => officeOptions, [officeOptions])
  const stateOptions = useMemo(() => Object.keys(INDIA_STATE_CITIES), [])
  const cityOptions = useMemo(() => {
    if (!form.state) return []
    const cities = INDIA_STATE_CITIES[form.state] || []
    if (form.city && !cities.includes(form.city)) {
      return [form.city, ...cities]
    }
    return cities
  }, [form.city, form.state])
  const generatedUserName = useMemo(() => {
    const first = (form.firstName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "")
    const last = (form.lastName || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "")
    const base = first || last || "employee"
    const dob = form.dob || ""
    const day = dob.split("-")[2]
    const idDigits = String(form.employeeId || "").replace(/[^0-9]/g, "").slice(-2)
    const suffix = day || idDigits || "01"
    return `${base}${suffix}`
  }, [form.dob, form.employeeId, form.firstName, form.lastName])
  const generatedOfficeEmail = useMemo(() => {
    return `${generatedUserName}@meensou.com`
  }, [generatedUserName])
  const generatedPassword = useMemo(() => generatedUserName, [generatedUserName])
  const isEditMode = Boolean(initialData)
  const requiredFieldsByStep = {
    0: ["firstName", "lastName", "phone", "email", "dob", "gender", "address", "state", "city", "zipCode"],
    1: ["joinDate", "jobTitle", "department", "employmentType"],
  }
  const fieldLabels = {
    firstName: "First Name",
    lastName: "Last Name",
    phone: "Mobile Number",
    email: "Email Address",
    dob: "Date of Birth",
    gender: "Gender",
    address: "Address",
    state: "State",
    city: "City",
    zipCode: "Zip Code",
    joinDate: "Join Date",
    jobTitle: "Job Title",
    department: "Department",
    employmentType: "Employment Type",
  }

  const setField = (key) => (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: "" }))
  }
  const handleDepartmentChange = (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, department: value }))
    setErrors((prev) => ({ ...prev, department: "" }))
  }
  const handleOfficeChange = (event) => {
    const { value } = event.target
    if (value === ADD_OFFICE_OPTION) {
      setOfficeModalError("")
      setNewOfficeName("")
      setShowOfficeModal(true)
      return
    }
    setForm((prev) => ({ ...prev, officeLocation: value }))
  }
  const handleStateChange = (event) => {
    const nextState = event.target.value
    const validCities = INDIA_STATE_CITIES[nextState] || []
    setForm((prev) => ({
      ...prev,
      state: nextState,
      city: validCities.includes(prev.city) ? prev.city : "",
    }))
    setErrors((prev) => ({ ...prev, state: "", city: "" }))
  }
  const handleCityChange = (event) => {
    const { value } = event.target
    setForm((prev) => ({ ...prev, city: value }))
    setErrors((prev) => ({ ...prev, city: "" }))
  }
  const handleCreateOffice = () => {
    const normalized = newOfficeName.trim()
    if (!normalized) {
      setOfficeModalError("Office name is required")
      return
    }
    const exists = resolvedOffices.some((item) => item.toLowerCase() === normalized.toLowerCase())
    if (exists) {
      setOfficeModalError("Office already exists")
      return
    }
    if (typeof onAddOffice === "function") {
      onAddOffice(normalized)
    }
    setForm((prev) => ({ ...prev, officeLocation: normalized }))
    setShowOfficeModal(false)
    setNewOfficeName("")
    setOfficeModalError("")
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
      employmentType: form.employmentType,
      mobile: form.phone,
      email: form.email,
      dob: form.dob,
      gender: form.gender,
      address: form.address,
      city: form.city,
      state: form.state,
      zipCode: form.zipCode,
      salary: form.salary,
      bankName: form.bankName,
      bankAccount: form.bankAccount,
      profileImage,
      userName: generatedUserName,
      officeEmail: generatedOfficeEmail || form.email,
      generatedPassword,
      joiningDate: form.joinDate,
      officeLocation: form.officeLocation,
      documents: { ...documents },
    }
    onSubmit(payload)
  }
  const validateStep = (step) => {
    const requiredFields = requiredFieldsByStep[step] || []
    if (requiredFields.length === 0) return true

    const nextErrors = {}
    requiredFields.forEach((field) => {
      const raw = form[field]
      if (!String(raw ?? "").trim()) {
        nextErrors[field] = `${fieldLabels[field] || "This field"} is required.`
      }
    })
    setErrors((prev) => {
      const cleared = { ...prev }
      requiredFields.forEach((field) => {
        delete cleared[field]
      })
      return { ...cleared, ...nextErrors }
    })
    return Object.keys(nextErrors).length === 0
  }

  const uploadBox = (key, label) => (
    <div className="grid gap-3 md:grid-cols-[150px_1fr]">
      <p className={`pt-3 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{label}</p>
      <button
        type="button"
        onClick={() => inputRefs.current[key]?.click()}
        className={`flex items-center gap-3 rounded-xl border border-dashed px-4 py-3 text-left text-sm ${
          isDark ? "border-slate-600 bg-[#0f1720] text-slate-400" : "border-slate-300 bg-[#f7f7f7] text-slate-500"
        }`}
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#def4ec] text-[#53c4ae]">
          <Upload size={14} />
        </span>
        <span>
          <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>Click to Upload</span> or drag & drop
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
    <>
      <div className={`mx-auto rounded-2xl border text-sm ${isDark ? "border-slate-700 bg-[#111a24] text-slate-100" : "border-slate-200 bg-white text-slate-800"}`}>
        <div className="grid md:grid-cols-[240px_1fr]">
        <aside className={`border-r p-6 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <button
            type="button"
            onClick={onCancel}
            className={`mb-4 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
              isDark ? "border-slate-700 bg-[#0f1720] text-slate-300 hover:bg-[#0b1320]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ArrowLeft size={13} />
            Back
          </button>
          <h2 className={`text-2xl font-semibold leading-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}>{isEditMode ? "Edit Employee" : "Register New Employee"}</h2>
          <p className={`mt-2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {isEditMode
              ? "Update employee details and save profile changes."
              : "Enter all required employment details to formally add a new member to your organization."}
          </p>
          <div className={`relative mt-8 rounded-2xl p-4 ${isDark ? "border border-slate-700 bg-[#0f1720]" : "bg-[#f8faf9]"}`}>
            <div className="space-y-5">
              {stepLabels.map((label, index) => {
                const active = index === stepIndex
                const done = index < stepIndex
                return (
                  <div key={label} className="relative flex items-start gap-3">
                    <div className="relative w-7 shrink-0">
                      {index < stepLabels.length - 1 && (
                        <span className={`pointer-events-none absolute left-1/2 top-6 h-[calc(100%+24px)] w-[2px] -translate-x-1/2 ${isDark ? "bg-slate-700" : "bg-slate-200"}`}>
                          <span
                            className={`absolute inset-0 origin-top bg-[#53c4ae] transition-transform duration-500 ease-out ${
                              done ? "scale-y-100" : "scale-y-0"
                            }`}
                          />
                        </span>
                      )}
                      <span
                        className={`relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors duration-300 ${
                          done || active
                            ? "border-[#53c4ae] bg-[#53c4ae] text-white"
                            : isDark ? "border-slate-600 bg-[#111a24] text-slate-400" : "border-slate-300 bg-white text-slate-500"
                        }`}
                      >
                        {done ? <Check size={12} className="text-white" /> : index + 1}
                      </span>
                    </div>
                    <div>
                      <p className={`text-sm leading-5 transition-colors duration-300 ${active || done ? (isDark ? "font-semibold text-slate-200" : "font-semibold text-slate-700") : "text-slate-400"}`}>
                        {label}
                      </p>
                      <p className={`text-xs ${active ? "text-[#2f6f63]" : "text-slate-400"}`}>
                        {index === 0 && "Personal details"}
                        {index === 1 && "Role and payroll setup"}
                        {index === 2 && "Documents and access"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </aside>

        <section className="p-6 md:p-8">
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-400"}`}>Step {stepIndex + 1}/3</p>
          <h3 className={`mt-2 text-2xl font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{stepLabels[stepIndex]}</h3>
          <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {stepIndex === 0 && "Enter the employee's personal details and primary contact information to initiate their HR record"}
            {stepIndex === 1 && "Provide essential employment data and payroll setup to configure the employee's role and compensation"}
            {stepIndex === 2 && "Configure employee perks, attach required documents, and finalize their status within the system"}
          </p>
          <div className={`mt-4 border-b ${isDark ? "border-slate-700" : "border-slate-200"}`} />

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
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
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
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
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
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                    <span>Mobile Number <span className="text-rose-500">*</span></span>
                    <div className={`flex rounded-lg ${isDark ? "bg-[#0f1720]" : "bg-[#f3f4f4]"} ${errors.phone ? "border border-rose-400" : ""}`}>
                      <select
                        value={form.phoneCode}
                        onChange={setField("phoneCode")}
                        className={`cursor-pointer rounded-l-lg border-r bg-transparent px-2.5 py-2.5 text-sm outline-none ${
                          isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"
                        }`}
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
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
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
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
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
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
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
                <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
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
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                    <span>State <span className="text-rose-500">*</span></span>
                    <div className="relative">
                      <select
                        required
                        value={form.state}
                        onChange={handleStateChange}
                        className={`${inputClass} appearance-none pr-8 ${errors.state ? "border-rose-400" : ""}`}
                      >
                        <option value="" disabled>
                          Select state
                        </option>
                        {stateOptions.map((stateName) => (
                          <option key={stateName} value={stateName}>
                            {stateName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    {errors.state ? <span className="text-xs text-rose-500">{errors.state}</span> : null}
                  </label>
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                    <span>City <span className="text-rose-500">*</span></span>
                    <div className="relative">
                      <select
                        required
                        value={form.city}
                        onChange={handleCityChange}
                        disabled={!form.state}
                        className={`${inputClass} appearance-none pr-8 ${errors.city ? "border-rose-400" : ""} disabled:cursor-not-allowed ${
                          isDark ? "disabled:bg-[#0b1320] disabled:text-slate-500" : "disabled:bg-slate-100 disabled:text-slate-400"
                        }`}
                      >
                        <option value="" disabled>
                          {form.state ? "Select city" : "Select state first"}
                        </option>
                        {cityOptions.map((cityName) => (
                          <option key={`${form.state}-${cityName}`} value={cityName}>
                            {cityName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    {errors.city ? <span className="text-xs text-rose-500">{errors.city}</span> : null}
                  </label>
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
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
                <h4 className={`text-base font-semibold ${isDark ? "text-slate-100" : "text-slate-700"}`}>Employment Details</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                    <span>Employee ID</span>
                    <input value={form.employeeId} onChange={setField("employeeId")} className={inputClass} />
                    <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>*Auto-generated</span>
                  </label>
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                    <span>Join Date <span className="text-rose-500">*</span></span>
                    <div className="relative">
                      <input required type="date" value={form.joinDate} onChange={setField("joinDate")} className={`${inputClass} pr-9 ${errors.joinDate ? "border-rose-400" : ""}`} />
                      <Calendar size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    {errors.joinDate ? <span className="text-xs text-rose-500">{errors.joinDate}</span> : null}
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
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
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                    <span>Department <span className="text-rose-500">*</span></span>
                    <div className="relative">
                      <select required value={form.department} onChange={handleDepartmentChange} className={`${inputClass} appearance-none pr-8 ${errors.department ? "border-rose-400" : ""}`}>
                        <option value="">Select Department</option>
                        {resolvedDepartments.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </label>
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
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

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1 text-sm text-slate-500">
                    <span>Office Location</span>
                    <div className="relative">
                      <select
                        value={form.officeLocation}
                        onChange={handleOfficeChange}
                        className={`${inputClass} appearance-none pr-8`}
                      >
                        <option value="">Select office location</option>
                        {resolvedOffices.map((item) => (
                          <option key={item} value={item}>{item}</option>
                        ))}
                        <option value={ADD_OFFICE_OPTION}>+ Add new office</option>
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </label>
                </div>

                <div className="grid gap-2 md:grid-cols-3">
                  {["On-Site", "Hybrid", "Remote"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, workModel: item }))}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm ${
                        form.workModel === item
                          ? isDark
                            ? "border-[#53c4ae] bg-emerald-900/25 text-emerald-200"
                            : "border-[#53c4ae] bg-[#edf7f3]"
                          : isDark
                            ? "border-transparent bg-[#0f1720] text-slate-300"
                            : "border-transparent bg-[#f3f4f4] text-slate-600"
                      }`}
                    >
                      <span>{item}</span>
                      <span className={`h-3.5 w-3.5 rounded-full border ${
                        form.workModel === item
                          ? "border-[#53c4ae] bg-[#53c4ae]"
                          : isDark
                            ? "border-slate-600 bg-[#111a24]"
                            : "border-slate-300 bg-white"
                      }`} />
                    </button>
                  ))}
                </div>

                <h4 className={`pt-2 text-base font-semibold ${isDark ? "text-slate-100" : "text-slate-700"}`}>Payroll Info</h4>
                <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                  <span>Salary</span>
                  <div className="relative">
                    <input
                      value={form.salary}
                      onChange={setField("salary")}
                      placeholder="e.g. INR 50,000"
                      className={`${inputClass} pr-24`}
                    />
                    <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>INR /month</span>
                  </div>
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                    <span>Bank Name</span>
                    <input value={form.bankName} onChange={setField("bankName")} className={inputClass} />
                  </label>
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                    <span>Bank Account Number</span>
                    <input value={form.bankAccount} onChange={setField("bankAccount")} className={inputClass} />
                  </label>
                </div>
              </>
            )}

            {stepIndex === 2 && (
              <>
                <h4 className={`text-base font-semibold ${isDark ? "text-slate-100" : "text-slate-700"}`}>Documents</h4>
                <div className="space-y-3">
                  {uploadBox("cv", "CV & Portfolio (if Any)")}
                  {uploadBox("id", "ID")}
                  {uploadBox("contract", "Contract Agreement")}
                  {uploadBox("offerLetter", "Offer Letter")}
                </div>

                <h4 className={`pt-3 text-base font-semibold ${isDark ? "text-slate-100" : "text-slate-700"}`}>Credentials</h4>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Set login access details for user account sign-in.</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                    <span>Username</span>
                    <input
                      value={generatedUserName}
                      placeholder="Auto-generated from first name and DOB"
                      readOnly
                      className={`${inputClass} ${isDark ? "bg-[#0b1320] text-slate-300" : "bg-slate-100 text-slate-600"}`}
                    />
                  </label>
                  <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                    <span>Office Email</span>
                    <input
                      type="email"
                      value={generatedOfficeEmail}
                      placeholder="Auto-generated from first name"
                      readOnly
                      className={`${inputClass} ${isDark ? "bg-[#0b1320] text-slate-300" : "bg-slate-100 text-slate-600"}`}
                    />
                  </label>
                </div>
                <label className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                  <span>Password</span>
                  <input
                    type="text"
                    value={generatedPassword}
                    placeholder="Auto-generated from username"
                    readOnly
                    className={`${inputClass} ${isDark ? "bg-[#0b1320] text-slate-300" : "bg-slate-100 text-slate-600"}`}
                  />
                </label>

                <div className="pt-3">
                  <div className={`space-y-3 rounded-xl border p-3 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-[#f8faf9]"}`}>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, activeEmployee: !prev.activeEmployee }))}
                      className="flex w-full items-center justify-between"
                    >
                      <span className="text-left">
                        <span className={`block text-sm font-medium ${isDark ? "text-slate-100" : "text-slate-700"}`}>Active Employee</span>
                        <span className={`block text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Mark this employee as currently active</span>
                      </span>
                      <span className={`relative h-5 w-9 rounded-full transition-colors ${form.activeEmployee ? "bg-[#53c4ae]" : "bg-slate-300"}`}>
                        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.activeEmployee ? "translate-x-4" : "translate-x-0"}`} />
                      </span>
                    </button>

                    <div className={`border-t ${isDark ? "border-slate-700" : "border-slate-200"}`} />

                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, sendWelcomeEmail: !prev.sendWelcomeEmail }))}
                      className="flex w-full items-center justify-between"
                    >
                      <span className="text-left">
                        <span className={`block text-sm font-medium ${isDark ? "text-slate-100" : "text-slate-700"}`}>Send Welcome Email</span>
                        <span className={`block text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>Automatically notify employee after submit</span>
                      </span>
                      <span className={`relative h-5 w-9 rounded-full transition-colors ${form.sendWelcomeEmail ? "bg-[#53c4ae]" : "bg-slate-300"}`}>
                        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${form.sendWelcomeEmail ? "translate-x-4" : "translate-x-0"}`} />
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className={`mt-8 border-t pt-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <div className="flex justify-end">
              <div className="flex items-center gap-2">
                {stepIndex > 0 && (
                  <button type="button" onClick={() => setStepIndex((prev) => prev - 1)} className="rounded-xl bg-[#dceac7] px-5 py-2 text-sm font-medium text-slate-700">
                    Previous
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (stepIndex === stepLabels.length - 1) {
                      if (!validateStep(0)) {
                        setStepIndex(0)
                        return
                      }
                      if (!validateStep(1)) {
                        setStepIndex(1)
                        return
                      }
                      handleSubmit()
                      return
                    }
                    if (!validateStep(stepIndex)) return
                    setStepIndex((prev) => prev + 1)
                  }}
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#53c4ae] px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Saving..."
                    : stepIndex === stepLabels.length - 1
                      ? (isEditMode ? "Update" : "Register Employee")
                      : "Next"}
                </button>
              </div>
            </div>
            {submitError ? (
              <p className="mt-2 text-right text-sm text-rose-500">{submitError}</p>
            ) : null}
          </div>
          </section>
        </div>
      </div>
      {showOfficeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`w-full max-w-md rounded-2xl border p-5 ${isDark ? "border-slate-700 bg-[#0f1720]" : "border-slate-200 bg-white"}`}>
            <h4 className={`text-base font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Add New Office</h4>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Create an office location and save it for future employees.</p>
            <label className="mt-4 block space-y-1">
              <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>Office Name</span>
              <input
                value={newOfficeName}
                onChange={(event) => {
                  setNewOfficeName(event.target.value)
                  setOfficeModalError("")
                }}
                placeholder="Enter office name"
                className={`${inputClass} ${officeModalError ? "border-rose-400" : ""}`}
                autoFocus
              />
              {officeModalError ? <span className="text-xs text-rose-500">{officeModalError}</span> : null}
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowOfficeModal(false)
                  setNewOfficeName("")
                  setOfficeModalError("")
                }}
                className={`rounded-lg border px-4 py-2 text-sm ${isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-600"}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateOffice}
                className="rounded-lg bg-[#53c4ae] px-4 py-2 text-sm font-medium text-white"
              >
                Add Office
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RegisterEmployeeForm
