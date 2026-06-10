// localStorage-based auth + data store (no backend needed)

export interface LocalUser {
  id: string
  email: string
  first_name: string
  last_name: string
  password: string
  created_at: string
}

export interface LocalTremorTest {
  id: string
  user_id: string
  test_type: string
  hand: string
  score: number
  duration_seconds: number
  created_at: string
}

export interface LocalDailySurvey {
  id: string
  user_id: string
  tremor_severity: number
  sleep_quality: number
  stress_level: number
  caffeine_intake: number
  medication_taken: boolean
  notes: string | null
  created_at: string
}

const USERS_KEY = "mytremor_users"
const CURRENT_USER_KEY = "mytremor_current_user"
const TESTS_KEY = "mytremor_tests"
const SURVEYS_KEY = "mytremor_surveys"
const GUEST_ID = "guest"

function isBrowser() {
  return typeof window !== "undefined"
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  if (!isBrowser()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function uuid() {
  return "id_" + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// --- Users / auth ---

export function getAllUsers(): LocalUser[] {
  return readJSON<LocalUser[]>(USERS_KEY, [])
}

export function getCurrentUser(): LocalUser | null {
  return readJSON<LocalUser | null>(CURRENT_USER_KEY, null)
}

// Returns either the logged-in user's id, or "guest". Use this so tests/surveys
// always have somewhere to live, even without an account.
export function getEffectiveUserId(): string {
  const user = getCurrentUser()
  return user ? user.id : GUEST_ID
}

export function signUp(input: {
  email: string
  password: string
  first_name: string
  last_name: string
}): { user?: LocalUser; error?: string } {
  const email = input.email.trim().toLowerCase()
  if (!email || !input.password) return { error: "Email and password are required." }
  if (input.password.length < 6) return { error: "Password must be at least 6 characters." }

  const users = getAllUsers()
  if (users.some((u) => u.email === email)) {
    return { error: "An account with that email already exists." }
  }

  const user: LocalUser = {
    id: uuid(),
    email,
    first_name: input.first_name,
    last_name: input.last_name,
    password: input.password,
    created_at: new Date().toISOString(),
  }
  users.push(user)
  writeJSON(USERS_KEY, users)
  writeJSON(CURRENT_USER_KEY, user)
  return { user }
}

export function signIn(email: string, password: string): { user?: LocalUser; error?: string } {
  const normalized = email.trim().toLowerCase()
  const users = getAllUsers()
  const user = users.find((u) => u.email === normalized && u.password === password)
  if (!user) return { error: "Invalid email or password." }
  writeJSON(CURRENT_USER_KEY, user)
  return { user }
}

export function signOut() {
  if (!isBrowser()) return
  window.localStorage.removeItem(CURRENT_USER_KEY)
}

// --- Tremor tests ---

export function getTestsForUser(userId: string): LocalTremorTest[] {
  const all = readJSON<LocalTremorTest[]>(TESTS_KEY, [])
  return all.filter((t) => t.user_id === userId)
}

export function saveTest(input: Omit<LocalTremorTest, "id" | "created_at">): LocalTremorTest {
  const all = readJSON<LocalTremorTest[]>(TESTS_KEY, [])
  const record: LocalTremorTest = {
    ...input,
    id: uuid(),
    created_at: new Date().toISOString(),
  }
  all.push(record)
  writeJSON(TESTS_KEY, all)
  return record
}

// --- Daily surveys ---

export function getSurveysForUser(userId: string): LocalDailySurvey[] {
  const all = readJSON<LocalDailySurvey[]>(SURVEYS_KEY, [])
  return all.filter((s) => s.user_id === userId)
}

export function saveSurvey(
  input: Omit<LocalDailySurvey, "id" | "created_at">
): { survey?: LocalDailySurvey; error?: string } {
  const all = readJSON<LocalDailySurvey[]>(SURVEYS_KEY, [])
  const record: LocalDailySurvey = {
    ...input,
    id: uuid(),
    created_at: new Date().toISOString(),
  }
  all.push(record)
  writeJSON(SURVEYS_KEY, all)
  return { survey: record }
}

// --- Auth state subscription (so navigation can react to login/logout) ---

type AuthListener = (user: LocalUser | null) => void
const listeners = new Set<AuthListener>()

export function onAuthChange(cb: AuthListener) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function notifyAuthChange() {
  const user = getCurrentUser()
  listeners.forEach((cb) => cb(user))
}
