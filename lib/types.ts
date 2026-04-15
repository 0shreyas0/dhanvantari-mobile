export type ExpirySettings = {
  earlyWarningDays: number
  urgentWarningDays: number
  criticalDays: number
}

export type ProductBatch = {
  id: string
  barcode: string
  batchNumber: string
  quantity: number
  costPrice: number
  sellingPrice: number
  expiryDate: string
  isRecalled: boolean
}

export type Product = {
  id: string
  name: string
  barcodes: string
  category: string | null
  description: string | null
  totalStock: number
  activeStock: number
  price: number
  lowStockThreshold: number
  status: string
  recalledCount: number
  expiryDate: string | null
  batches: ProductBatch[]
}

export type ProductsResponse = {
  pharmacyName: string
  expirySettings: ExpirySettings
  products: Product[]
}

export type DashboardAlert = {
  id: string
  medicineId: string
  name: string
  batchNumber: string
  expiryDate: string
  daysRemaining: number
  quantity: number
}

export type DashboardResponse = {
  inStock: number
  lowStock: number
  outOfStock: number
  totalProducts: number
  stockHealth: number
  totalRevenueToday: number
  totalSalesToday: number
  recentTransactions: {
    id: string
    amount: number
    items: number
    time: string
    customerName: string | null
  }[]
  expiryAlerts: {
    critical: DashboardAlert[]
    urgent: DashboardAlert[]
    early: DashboardAlert[]
  }
  expirySettings: ExpirySettings
}

export type FinanceResponse = {
  summary: {
    totalRevenue: number
    averageOrderValue: number
    expiredLoss: number
    recalledLoss: number
    totalLoss: number
    totalBills: number
  }
  bills: {
    id: string
    customerName: string | null
    customerPhone: string | null
    totalAmount: number
    subtotalAmount: number
    gstRate: number
    gstAmount: number
    createdAt: string
    items: {
      medicineId: string
      medicineName: string
      quantity: number
      price: number
    }[]
    itemsText: string
    pdfUrl: string
  }[]
}

export type SettingsResponse = {
  pharmacy: {
    name: string
    phone: string | null
    address: string | null
    logoUrl: string | null
  }
  expiry: ExpirySettings
}

export type UploadLogoResponse = {
  logoUrl: string
}

// ── Billing / POS ────────────────────────────────────────────────────────────

export type BillingSearchProduct = {
  id: string
  name: string
  barcodes: string
  stock: number
  price: number
  isExpired: boolean
  isExpiringSoon: boolean
  expiryDate: string | null
  daysToExpiry: number | null
}

export type BillingCartItem = BillingSearchProduct & {
  quantity: number
  isNearExpiry: boolean
}

export type BillingProcessPayload = {
  items: { medicineId: string; quantity: number; price: number }[]
  customer?: { name?: string; phone?: string }
}

export type BillingProcessResult = {
  success: boolean
  billId?: string
  pdfUrl?: string
  error?: string
}
