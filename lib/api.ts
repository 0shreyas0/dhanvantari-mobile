import type {
  BillingProcessPayload,
  BillingProcessResult,
  BillingSearchProduct,
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
    updatePharmacySettings(pharmacy: {
      name: string
      phone?: string
      address?: string
      logoUrl?: string
    }) {
      return apiFetch<SettingsResponse>("/api/settings", getToken, {
        method: "PATCH",
        body: JSON.stringify({ pharmacy }),
      })
    },
    updateExpirySettings(expiry: {
      earlyWarningDays: number
      urgentWarningDays: number
      criticalDays: number
    }) {
      return apiFetch<SettingsResponse>("/api/settings", getToken, {
        method: "PATCH",
        body: JSON.stringify({ expiry }),
      })
    },
    searchBillingProducts(query: string) {
      return apiFetch<BillingSearchProduct[]>(
        `/api/billing/search?q=${encodeURIComponent(query)}`,
        getToken
      )
    },
    processBill(payload: BillingProcessPayload) {
      return apiFetch<BillingProcessResult>("/api/billing/process", getToken, {
        method: "POST",
        body: JSON.stringify(payload),
      })
    },
    sendWhatsAppReceipt(data: {
      billId: string
      customerName?: string
      customerPhone: string
      totals: {
        subtotalAmount: number
        gstAmount: number
        gstRate: number
        totalAmount: number
      }
      items: { name: string; quantity: number; price: number }[]
    }) {
      return apiFetch<any>("/api/billing/whatsapp", getToken, {
        method: "POST",
        body: JSON.stringify(data),
      })
    },
    sendEmailReceipt(data: {
      billId: string
      customerName?: string
      customerEmail: string
      totals: {
        subtotalAmount: number
        gstAmount: number
        gstRate: number
        totalAmount: number
      }
      items: { name: string; quantity: number; price: number }[]
    }) {
      return apiFetch<any>("/api/billing/email", getToken, {
        method: "POST",
        body: JSON.stringify(data),
      })
    },
    getBillPdfUrl(billId: string, token: string): string {
      return `${API_BASE_URL}/api/bill/${billId}/pdf?token=${token}`
    },
    createProduct(data: {
      name: string
      barcode: string
      category?: string
      description?: string
      lowStockThreshold?: number
      initialBatch: {
        batchNumber: string
        quantity: number
        costPrice: number
        sellingPrice: number
        expiryDate: string
      }
    }) {
      return apiFetch<any>("/api/products", getToken, {
        method: "POST",
        body: JSON.stringify(data),
      })
    },
    addBatch(productId: string, data: {
      batchNumber: string
      barcode?: string
      quantity: number
      costPrice: number
      sellingPrice: number
      expiryDate: string
    }) {
      return apiFetch<any>(`/api/products/${productId}/batches`, getToken, {
        method: "POST",
        body: JSON.stringify(data),
      })
    },
  }
}
