import { assertSupabaseConfigured, supabase } from "../lib/supabaseClient"

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase()
}

async function fetchAdminByEmail(email) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return null

  const projectionVariants = [
    "id, email, full_name, role, phone, address, is_active",
    "id, email, full_name, role, is_active",
    "id, email, full_name, is_active",
  ]

  for (const projection of projectionVariants) {
    const { data, error } = await supabase
      .from("admins")
      .select(projection)
      .eq("email", normalizedEmail)
      .maybeSingle()

    if (!error) {
      if (!data) return null
      return {
        ...data,
        role: data.role || "HR",
        phone: data.phone || "",
        address: data.address || "",
      }
    }

    const text = String(error.message || "").toLowerCase()
    const isMissingColumn = text.includes("could not find the") && text.includes("column")
    if (!isMissingColumn) {
      throw new Error(error.message || "Failed to read admin profile.")
    }
  }

  throw new Error("Failed to read admin profile.")
}

export async function isAdminEmail(email) {
  assertSupabaseConfigured()
  const data = await fetchAdminByEmail(email)
  return Boolean(data && data.is_active)
}

export async function signInAdmin(email, password) {
  assertSupabaseConfigured()
  const normalizedEmail = normalizeEmail(email)
  const plainPassword = String(password || "")

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: plainPassword,
  })
  if (error) throw new Error(error.message || "Invalid email or password.")

  const admin = await fetchAdminByEmail(data.user?.email || normalizedEmail)
  if (!admin?.is_active) {
    await supabase.auth.signOut()
    throw new Error("This account is not an active admin.")
  }

  return {
    session: data.session,
    admin,
  }
}

export async function getCurrentAdminSession() {
  assertSupabaseConfigured()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw new Error(error.message || "Unable to restore session.")

  const session = data?.session || null
  if (!session) return null

  const admin = await fetchAdminByEmail(session.user?.email)
  if (!admin?.is_active) {
    await supabase.auth.signOut()
    return null
  }
  return {
    session,
    admin,
  }
}

export async function signOutAdmin() {
  assertSupabaseConfigured()
  await supabase.auth.signOut()
}
