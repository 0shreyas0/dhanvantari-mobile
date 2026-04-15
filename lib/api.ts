import type {
  BillingProcessPayload,
  BillingProcessResult,
  BillingSearchProduct,
  DashboardResponse,
  FinanceResponse,
  ProductsResponse,
  SettingsResponse,
  UploadLogoResponse,
} from "@/lib/types"

type GetToken = () => Promise<string | null>

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim()
const isEasBuild = process.env.EAS_BUILD === "1" || process.env.EAS_BUILD === "true"
const isProductionBuild = process.env.NODE_ENV === "production" || isEasBuild

if (!API_BASE_URL) {
  throw new Error(
    "Missing EXPO_PUBLIC_API_BASE_URL. Set it locally in mobile/.env for development, or provide it as an EAS secret for production builds."
  )
}

if (isProductionBuild && /(localhost|127\.0\.0\.1)/.test(API_BASE_URL)) {
  throw new Error(
    "EAS/production builds cannot use a localhost API URL. Set EXPO_PUBLIC_API_BASE_URL to your deployed web server URL."
  )
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

async function createFormDataRequest<T>(
  path: string,
  getToken: GetToken,
  file: { uri: string; name: string; type: string }
): Promise<T> {
  const token = await getToken()
  if (!token) {
    throw new Error("No active Clerk session token found")
  }

  const formData = new FormData()
  formData.append("logo", {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
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
    uploadLogo(file: { uri: string; name: string; type: string }) {
      return createFormDataRequest<UploadLogoResponse>("/api/settings/logo", getToken, file)
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
