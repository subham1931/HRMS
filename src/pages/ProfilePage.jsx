import { Mail, MapPin, Phone, UserRound } from "lucide-react"

function ProfilePage({ adminProfile = null }) {
  const email = adminProfile?.email || "admin@hrms.test"
  const image = adminProfile?.profile_image || adminProfile?.avatar_url || ""
  const initials = (adminProfile?.full_name || "Admin User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("")
  const profile = {
    name: adminProfile?.full_name || "Admin User",
    role: (adminProfile?.role || "HR").toUpperCase(),
    email,
    phone: adminProfile?.phone || "+91 98765 43210",
    location: adminProfile?.address || "Bangalore, India",
    image,
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[20px] font-semibold tracking-tight text-slate-800 sm:text-[24px]">My Profile</h2>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/40 p-4 sm:p-5">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          {profile.image ? (
            <img src={profile.image} alt={profile.name} className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24" />
          ) : (
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-xl font-semibold text-emerald-700 sm:h-24 sm:w-24 sm:text-2xl">
              {initials || "A"}
            </span>
          )}
          <div>
            <p className="text-[20px] font-semibold leading-tight text-slate-800">{profile.name}</p>
            <p className="mt-1 text-sm text-slate-500">{profile.role}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-700">
            <Mail size={16} className="text-slate-500" />
            <span className="text-sm">{profile.email}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-700">
            <Phone size={16} className="text-slate-500" />
            <span className="text-sm">{profile.phone}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-700 sm:col-span-2">
            <MapPin size={16} className="text-slate-500" />
            <span className="text-sm">{profile.location}</span>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2 font-medium text-slate-700">
            <UserRound size={16} />
            Profile settings can be connected here next.
          </span>
        </div>
      </div>
    </article>
  )
}

export default ProfilePage
