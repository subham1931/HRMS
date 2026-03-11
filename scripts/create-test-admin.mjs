import fs from "node:fs"
import path from "node:path"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "web-app/.env"),
]
const envPath = envCandidates.find((candidate) => fs.existsSync(candidate))
if (envPath) {
  dotenv.config({ path: envPath, override: true, quiet: true })
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL (or VITE_SUPABASE_URL) and/or SUPABASE_SERVICE_ROLE_KEY.")
  process.exit(1)
}

const email = (process.env.TEST_ADMIN_EMAIL || "admin@hrms.test").trim().toLowerCase()
const password = process.env.TEST_ADMIN_PASSWORD || "Admin@123456"
const fullName = process.env.TEST_ADMIN_NAME || "Test Admin"
const role = process.env.TEST_ADMIN_ROLE || "HR"
const phone = process.env.TEST_ADMIN_PHONE || "+91 98765 43210"
const address = process.env.TEST_ADMIN_ADDRESS || "Bangalore, India"

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function resolveUserIdByEmail(targetEmail) {
  let page = 1
  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw new Error(error.message || "Failed to list users.")
    const found = (data?.users || []).find((user) => (user.email || "").toLowerCase() === targetEmail)
    if (found) return found.id
    if (!data?.users?.length) break
    page += 1
  }
  return null
}

async function run() {
  let userId = null
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "admin", full_name: fullName },
  })

  if (createError) {
    const maybeExists = createError.message?.toLowerCase().includes("already")
    if (!maybeExists) throw new Error(createError.message || "Unable to create auth user.")
    userId = await resolveUserIdByEmail(email)
    if (!userId) throw new Error("Admin auth user exists but could not resolve user id.")
  } else {
    userId = created?.user?.id || null
  }

  const basePayload = {
    user_id: userId,
    email,
    full_name: fullName,
    role,
    phone,
    address,
    is_active: true,
  }

  const payload = { ...basePayload }
  while (true) {
    const { error: upsertError } = await supabase
      .from("admins")
      .upsert(payload, { onConflict: "email" })

    if (!upsertError) break

    const message = String(upsertError.message || "")
    const match = message.match(/Could not find the '([^']+)' column/i)
    if (match?.[1] && Object.prototype.hasOwnProperty.call(payload, match[1])) {
      delete payload[match[1]]
      continue
    }
    throw new Error(upsertError.message || "Failed to upsert admins table row.")
  }

  console.log("Test admin ready:")
  console.log(`- Email: ${email}`)
  console.log(`- Password: ${password}`)
  console.log(`- Role: ${role}`)
  console.log(`- Phone: ${phone}`)
  console.log(`- Address: ${address}`)
}

run().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
