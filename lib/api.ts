import type {
  DashboardResponse,
  FinanceResponse,
  ProductsResponse,
  SettingsResponse,
} from "@/lib/types"

type GetToken = () => Promise<string | null>

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

if (!API_BASE_URL) {
  throw new Error("Missing EXPO_PUBLIC_API_BASE_URL in mobile/.env")
}

async function apiFetch<T>(path: string, getToken: GetToken, init?: RequestInit): Promise<T> {
  const token = await getToken()

  if (!token) {
    throw new Error("No active Clerk session token found")
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? String(payload.error)
        : `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export function createApiClient(getToken: GetToken) {
  return {
    getDashboard() {
      return apiFetch<DashboardResponse>("/api/dashboard", getToken)
    },
    getProducts() {
      return apiFetch<ProductsResponse>("/api/products", getToken)
    },
    getFinance() {
      return apiFetch<FinanceResponse>("/api/finance", getToken)
    },
    getSettings() {
      return apiFetch<SettingsResponse>("/api/settings", getToken)
    },
  }
}
