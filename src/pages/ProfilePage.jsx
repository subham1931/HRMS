import { Mail, MapPin, Phone, UserRound } from "lucide-react"

function ProfilePage() {
  const profile = {
    name: "Priya Sharma",
    role: "HR Manager",
    email: "priya.sharma@mensou.com",
    phone: "+91 98765 43210",
    location: "Bangalore, India",
    image: "https://i.pravatar.cc/240?img=47",
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[20px] font-semibold tracking-tight text-slate-800 sm:text-[24px]">My Profile</h2>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/40 p-4 sm:p-5">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <img src={profile.image} alt={profile.name} className="h-20 w-20 rounded-full object-cover sm:h-24 sm:w-24" />
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
