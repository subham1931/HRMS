import { Lock, UserRound } from "lucide-react"

const notificationItems = [
  {
    title: "Leave Request",
    subtitle: "@Robert Fox has applied for leave",
    time: "Just Now",
    avatar: "https://i.pravatar.cc/80?img=12",
  },
  {
    title: "Check In Issue",
    subtitle: "@Alexa shared a message regarding check in issue",
    time: "11:16 AM",
    avatar: null,
  },
  {
    title: 'Applied job for "Sales Manager" Position',
    subtitle: "@shane Watson has applied for job",
    time: "09:00 AM",
    avatar: "icon-user",
  },
  {
    title: "Robert Fox has share his feedback",
    subtitle: '"It was an amazing experience with your organisation"',
    time: "Yesterday",
    avatar: "https://i.pravatar.cc/80?img=13",
  },
  {
    title: "Password Update successfully",
    subtitle: "Your password has been updated successfully",
    time: "Yesterday",
    avatar: "icon-lock",
  },
]

function NotificationsPanel() {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-3">
      {notificationItems.map((item, index) => (
        <div
          key={`${item.title}-${index}`}
          className={`flex items-center justify-between gap-3 px-2 py-3 ${index !== notificationItems.length - 1 ? "border-b border-slate-100" : ""}`}
        >
          <div className="flex items-center gap-3">
            {item.avatar?.startsWith("http") ? (
              <img src={item.avatar} alt={item.title} className="h-9 w-9 rounded-full object-cover" />
            ) : item.avatar === "icon-user" ? (
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-500">
                <UserRound size={16} />
              </span>
            ) : item.avatar === "icon-lock" ? (
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-500">
                <Lock size={16} />
              </span>
            ) : (
              <span className="inline-flex h-9 w-9 rounded-full bg-transparent" />
            )}

            <div>
              <p className="text-[22px] font-semibold text-slate-900 sm:text-[16px]">{item.title}</p>
              <p className="mt-0.5 text-[18px] text-slate-400 sm:text-[14px]">{item.subtitle}</p>
            </div>
          </div>

          <p className="text-[17px] text-slate-400 sm:text-[13px]">{item.time}</p>
        </div>
      ))}
    </article>
  )
}

export default NotificationsPanel
