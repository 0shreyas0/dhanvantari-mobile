import { createApiClient } from "@/lib/api"
import type { BillingCartItem, BillingSearchProduct } from "@/lib/types"
import { useAuth } from "@clerk/clerk-expo"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// ── Small sub-components ─────────────────────────────────────────────────────

function SearchResultRow({
  product,
  onAdd,
  isFirst,
}: {
  product: BillingSearchProduct
  onAdd: (p: BillingSearchProduct) => void
  isFirst?: boolean
}) {
  const expired = product.isExpired
  const critical =
    !expired &&
    product.isExpiringSoon &&
    product.daysToExpiry !== null &&
    product.daysToExpiry !== undefined

  return (
    <Pressable
      onPress={() => !expired && onAdd(product)}
      style={({ pressed }) => [
        styles.searchRow,
        !isFirst && styles.rowBorder,
        expired && styles.searchRowExpired,
        pressed && !expired && styles.pressed,
      ]}
    >
      <View style={styles.searchRowLeft}>
        <View style={styles.searchRowName}>
          <Text style={[styles.searchName, expired && styles.searchNameFaded]}>{product.name}</Text>
          {expired && <View style={styles.badgeExpired}><Text style={styles.badgeExpiredText}>EXPIRED</Text></View>}
          {critical && (
            <View style={styles.badgeCritical}>
              <Text style={styles.badgeCriticalText}>CRITICAL · {product.daysToExpiry}d</Text>
            </View>
          )}
          {product.isExpiringSoon && !expired && !critical && (
            <View style={styles.badgeWarn}>
              <Text style={styles.badgeWarnText}>EXPIRING</Text>
            </View>
          )}
        </View>
        <Text style={styles.searchMeta}>
          Rs {product.price.toFixed(2)} · Stock: {product.stock}
        </Text>
      </View>
      {!expired && (
        <View style={styles.addBtn}>
          <Text style={styles.addBtnText}>+</Text>
        </View>
      )}
    </Pressable>
  )
}

function CartItemRow({
  item,
  onInc,
  onDec,
  onRemove,
  isFirst,
}: {
  item: BillingCartItem
  onInc: () => void
  onDec: () => void
  onRemove: () => void
  isFirst?: boolean
}) {
  return (
    <View style={[styles.cartRow, !isFirst && styles.rowBorder]}>
      <View style={styles.cartLeft}>
        <Text style={styles.cartName} numberOfLines={1}>{item.name}</Text>
        {item.isNearExpiry && (
          <Text style={styles.cartWarn}>⚠ Near expiry</Text>
        )}
      </View>
      <View style={styles.cartControls}>
        <Pressable onPress={onDec} style={styles.qtyBtn}>
          <Text style={styles.qtyBtnText}>−</Text>
        </Pressable>
        <Text style={styles.qtyCount}>{item.quantity}</Text>
        <Pressable onPress={onInc} style={styles.qtyBtn}>
          <Text style={styles.qtyBtnText}>+</Text>
        </Pressable>
      </View>
      <Text style={styles.cartTotal}>Rs {(item.price * item.quantity).toFixed(2)}</Text>
      <Pressable onPress={onRemove} style={styles.removeBtn} hitSlop={8}>
        <Text style={styles.removeBtnText}>✕</Text>
      </Pressable>
    </View>
  )
}

// ── Main screen ──────────────────────────────────────────────────────────────

export default function BillingScreen() {
  const { getToken } = useAuth()

  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<BillingSearchProduct[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const [cart, setCart] = useState<BillingCartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")

  const [isProcessing, setIsProcessing] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [lastBillId, setLastBillId] = useState<string | null>(null)
  const [lastTotal, setLastTotal] = useState(0)

  // Critical-expiry confirmation
  const [pendingProduct, setPendingProduct] = useState<BillingSearchProduct | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setSearchResults([])
        return
      }
      setIsSearching(true)
      try {
        const api = createApiClient(() => getToken())
        const results = await api.searchBillingProducts(q.trim())
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    [getToken]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => void doSearch(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, doSearch])

  const addToCart = (product: BillingSearchProduct, confirmed = false) => {
    if (product.isExpired) {
      Alert.alert("Expired Medicine", `${product.name} is expired and cannot be added to a bill.`)
      return
    }

    const isCritical =
      product.isExpiringSoon &&
      product.daysToExpiry !== null &&
      product.daysToExpiry !== undefined &&
      product.daysToExpiry <= 7

    if (isCritical && !confirmed) {
      setPendingProduct(product)
      return
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id)
      if (existing) {
        return prev.map((c) =>
          c.id === product.id
            ? { ...c, quantity: Math.min(c.quantity + 1, product.stock) }
            : c
        )
      }
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          isNearExpiry: isCritical || (product.isExpiringSoon ?? false),
        },
      ]
    })
  }

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id !== id) return c
          const newQty = c.quantity + delta
          return { ...c, quantity: Math.max(0, Math.min(newQty, c.stock)) }
        })
        .filter((c) => c.quantity > 0)
    )
  }

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.id !== id))

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0)

  const handleProcessBill = async () => {
    if (cart.length === 0) return
    setIsProcessing(true)
    try {
      const api = createApiClient(() => getToken())
      const result = await api.processBill({
        items: cart.map((c) => ({ medicineId: c.id, quantity: c.quantity, price: c.price })),
        customer:
          customerName || customerPhone
            ? { name: customerName || undefined, phone: customerPhone || undefined }
            : undefined,
      })
      if (result.success && result.billId) {
        setLastBillId(result.billId)
        setLastTotal(subtotal)
        setSuccessModal(true)
        setCart([])
        setCustomerName("")
        setCustomerPhone("")
        setQuery("")
        setSearchResults([])
      } else {
        Alert.alert("Failed", result.error ?? "Could not process bill.")
      }
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "An unexpected error occurred.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Page header */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Billing</Text>
            <Text style={styles.pageSubtitle}>Search products, build a bill, and checkout.</Text>
          </View>

          {/* ── Search ─────────────────────────────────────────────────── */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputRow}>
              {isSearching ? (
                <ActivityIndicator size="small" color="#4e8cff" style={styles.searchIcon} />
              ) : (
                <Text style={styles.searchIcon}>🔍</Text>
              )}
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name or barcode…"
                placeholderTextColor="#3d4f6b"
                style={styles.searchInput}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {query.length > 0 && (
                <Pressable onPress={() => { setQuery(""); setSearchResults([]) }} hitSlop={8}>
                  <Text style={styles.searchClear}>✕</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Search results */}
          {searchResults.length > 0 && (
            <View style={styles.resultsCard}>
              {searchResults.map((p, idx) => (
                <SearchResultRow key={p.id} product={p} onAdd={(prod) => addToCart(prod)} isFirst={idx === 0} />
              ))}
            </View>
          )}

          {query.length > 0 && searchResults.length === 0 && !isSearching && (
            <View style={styles.emptySearch}>
              <Text style={styles.emptySearchText}>No products found for "{query}"</Text>
            </View>
          )}

          {/* ── Cart ───────────────────────────────────────────────────── */}
          {cart.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Current Bill</Text>
                <Text style={styles.sectionBadge}>{cart.length} item{cart.length !== 1 ? "s" : ""}</Text>
              </View>

              <View style={styles.cartCard}>
                {cart.map((item, idx) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    isFirst={idx === 0}
                    onInc={() => updateQty(item.id, 1)}
                    onDec={() => updateQty(item.id, -1)}
                    onRemove={() => removeFromCart(item.id)}
                  />
                ))}

                {/* Summary */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>Rs {subtotal.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryTotalLabel}>Total</Text>
                  <Text style={styles.summaryTotalValue}>Rs {subtotal.toFixed(2)}</Text>
                </View>
              </View>

              {/* Customer info */}
              <View style={styles.customerCard}>
                <Text style={styles.sectionTitle}>Customer (optional)</Text>
                <TextInput
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Customer name"
                  placeholderTextColor="#3d4f6b"
                  style={[styles.customerInput, { marginBottom: 10 }]}
                />
                <TextInput
                  value={customerPhone}
                  onChangeText={setCustomerPhone}
                  placeholder="Phone number"
                  placeholderTextColor="#3d4f6b"
                  keyboardType="phone-pad"
                  style={styles.customerInput}
                />
              </View>

              {/* Process button */}
              <Pressable
                onPress={handleProcessBill}
                disabled={isProcessing}
                style={({ pressed }) => [
                  styles.processBtn,
                  isProcessing && styles.processBtnDisabled,
                  pressed && styles.pressed,
                ]}
              >
                {isProcessing ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.processBtnText}>Create Bill</Text>
                )}
              </Pressable>
            </>
          )}

          {cart.length === 0 && query.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🧾</Text>
              <Text style={styles.emptyStateTitle}>No items in bill</Text>
              <Text style={styles.emptyStateBody}>
                Search products above to start adding items to the current bill.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Critical expiry confirmation ──────────────────────────────── */}
      <Modal
        visible={!!pendingProduct}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingProduct(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>Near-Expiry Medicine</Text>
            <Text style={styles.modalBody}>
              <Text style={styles.modalHighlight}>{pendingProduct?.name}</Text>
              {"\n"}
              {pendingProduct?.daysToExpiry != null
                ? `Expires in ${pendingProduct.daysToExpiry} days.`
                : "This medicine is in its critical expiry window."}{"\n\n"}
              Are you sure you want to add it to the bill?
            </Text>
            <View style={styles.modalBtns}>
              <Pressable
                onPress={() => setPendingProduct(null)}
                style={[styles.modalBtn, styles.modalBtnCancel]}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (pendingProduct) addToCart(pendingProduct, true)
                  setPendingProduct(null)
                }}
                style={[styles.modalBtn, styles.modalBtnConfirm]}
              >
                <Text style={styles.modalBtnConfirmText}>Add Anyway</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Success modal ────────────────────────────────────────────── */}
      <Modal
        visible={successModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalSuccessIcon}>✅</Text>
            <Text style={styles.modalTitle}>Bill Created!</Text>
            <Text style={styles.modalBody}>
              The bill has been saved and inventory has been updated.
            </Text>

            <View style={styles.successDetails}>
              {lastBillId && (
                <View style={styles.successRow}>
                  <Text style={styles.successKey}>Bill ID</Text>
                  <Text style={styles.successVal}>{lastBillId.slice(-8).toUpperCase()}</Text>
                </View>
              )}
              <View style={[styles.successRow, styles.successRowLast]}>
                <Text style={styles.successKey}>Total Paid</Text>
                <Text style={[styles.successVal, styles.successTotal]}>
                  Rs {lastTotal.toFixed(2)}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setSuccessModal(false)}
              style={({ pressed }) => [styles.processBtn, pressed && styles.pressed]}
            >
              <Text style={styles.processBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: "#030817", flex: 1 },
  kav: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingBottom: 32, paddingTop: 12 },

  pageHeader: { marginBottom: 18 },
  pageTitle: { color: "#f8fbff", fontSize: 26, fontWeight: "700", letterSpacing: -0.4 },
  pageSubtitle: { color: "#8f9ab2", fontSize: 14, lineHeight: 20, marginTop: 4 },

  // Search
  searchContainer: {
    backgroundColor: "#061024",
    borderColor: "#1a2740",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  searchInputRow: { alignItems: "center", flexDirection: "row", height: 50 },
  searchIcon: { marginRight: 8 },
  searchInput: { color: "#f8fbff", flex: 1, fontSize: 15 },
  searchClear: { color: "#3d4f6b", fontSize: 16, paddingHorizontal: 4 },
  rowBorder: { borderTopColor: "#17233b", borderTopWidth: 1 },

  // Results
  resultsCard: {
    backgroundColor: "#061024",
    borderColor: "#1a2740",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  searchRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchRowExpired: { opacity: 0.5 },
  searchRowLeft: { flex: 1, paddingRight: 10 },
  searchRowName: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 3 },
  searchName: { color: "#f8fbff", fontSize: 14, fontWeight: "600" },
  searchNameFaded: { color: "#8f9ab2" },
  searchMeta: { color: "#8f9ab2", fontSize: 12 },

  badgeExpired: {
    backgroundColor: "#341117",
    borderColor: "#7f1d1d",
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeExpiredText: { color: "#ef5b5b", fontSize: 10, fontWeight: "700" },
  badgeCritical: {
    backgroundColor: "#2a0e19",
    borderColor: "#6b1a35",
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeCriticalText: { color: "#ef5b8c", fontSize: 10, fontWeight: "700" },
  badgeWarn: {
    backgroundColor: "#231a08",
    borderColor: "#6b4a10",
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeWarnText: { color: "#f59e0b", fontSize: 10, fontWeight: "700" },

  addBtn: {
    alignItems: "center",
    backgroundColor: "#0d1e3d",
    borderColor: "#1a3565",
    borderRadius: 10,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  addBtnText: { color: "#4e8cff", fontSize: 20, fontWeight: "700", lineHeight: 24 },

  emptySearch: { alignItems: "center", paddingVertical: 20 },
  emptySearchText: { color: "#6b7fa3", fontSize: 14 },

  // Section header
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 14,
  },
  sectionTitle: { color: "#f8fbff", fontSize: 16, fontWeight: "700" },
  sectionBadge: {
    backgroundColor: "#0d1e3d",
    borderColor: "#1a3565",
    borderRadius: 8,
    borderWidth: 1,
    color: "#4e8cff",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  // Cart
  cartCard: {
    backgroundColor: "#061024",
    borderColor: "#1a2740",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  cartRow: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cartLeft: { flex: 1, paddingRight: 8 },
  cartName: { color: "#f8fbff", fontSize: 14, fontWeight: "600" },
  cartWarn: { color: "#f59e0b", fontSize: 11, marginTop: 2 },
  cartControls: { alignItems: "center", flexDirection: "row", gap: 8, marginRight: 10 },
  qtyBtn: {
    alignItems: "center",
    backgroundColor: "#0b1731",
    borderColor: "#17233b",
    borderRadius: 8,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  qtyBtnText: { color: "#f8fbff", fontSize: 16, fontWeight: "700" },
  qtyCount: { color: "#f8fbff", fontSize: 15, fontWeight: "700", minWidth: 20, textAlign: "center" },
  cartTotal: { color: "#f8fbff", fontSize: 13, fontWeight: "600", marginRight: 10, minWidth: 70, textAlign: "right" },
  removeBtn: { padding: 4 },
  removeBtnText: { color: "#3d4f6b", fontSize: 14 },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopColor: "#17233b",
    borderTopWidth: 1,
  },
  summaryLabel: { color: "#8f9ab2", fontSize: 14 },
  summaryValue: { color: "#f8fbff", fontSize: 14, fontWeight: "600" },
  summaryTotal: { paddingVertical: 12 },
  summaryTotalLabel: { color: "#f8fbff", fontSize: 16, fontWeight: "700" },
  summaryTotalValue: { color: "#4e8cff", fontSize: 18, fontWeight: "700" },

  // Customer
  customerCard: {
    backgroundColor: "#061024",
    borderColor: "#1a2740",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  customerInput: {
    backgroundColor: "#0b1731",
    borderColor: "#17233b",
    borderRadius: 12,
    borderWidth: 1,
    color: "#f8fbff",
    fontSize: 15,
    height: 48,
    paddingHorizontal: 14,
  },

  // Process
  processBtn: {
    alignItems: "center",
    backgroundColor: "#4e8cff",
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
    marginBottom: 8,
  },
  processBtnDisabled: { backgroundColor: "#1a3565" },
  processBtnText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  pressed: { opacity: 0.75 },

  // Empty state
  emptyState: { alignItems: "center", marginTop: 60, paddingHorizontal: 20 },
  emptyStateIcon: { fontSize: 48, marginBottom: 14 },
  emptyStateTitle: { color: "#f8fbff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  emptyStateBody: { color: "#8f9ab2", fontSize: 14, lineHeight: 20, textAlign: "center" },

  // Modals
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: "#061024",
    borderColor: "#1a2740",
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    width: "100%",
  },
  modalIcon: { fontSize: 36, marginBottom: 12, textAlign: "center" },
  modalSuccessIcon: { fontSize: 40, marginBottom: 12, textAlign: "center" },
  modalTitle: { color: "#f8fbff", fontSize: 18, fontWeight: "700", marginBottom: 10, textAlign: "center" },
  modalBody: { color: "#8f9ab2", fontSize: 14, lineHeight: 22, marginBottom: 20, textAlign: "center" },
  modalHighlight: { color: "#f8fbff", fontWeight: "700" },
  modalBtns: { flexDirection: "row", gap: 10 },
  modalBtn: { alignItems: "center", borderRadius: 12, flex: 1, height: 46, justifyContent: "center" },
  modalBtnCancel: { backgroundColor: "#0b1731", borderColor: "#17233b", borderWidth: 1 },
  modalBtnCancelText: { color: "#8f9ab2", fontSize: 15, fontWeight: "600" },
  modalBtnConfirm: { backgroundColor: "#4a1630", borderColor: "#7f1d1d", borderWidth: 1 },
  modalBtnConfirmText: { color: "#ef5b8c", fontSize: 15, fontWeight: "700" },

  successDetails: {
    backgroundColor: "#0b1731",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  successRow: {
    borderTopColor: "#17233b",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  successRowLast: {},
  successKey: { color: "#8f9ab2", fontSize: 13 },
  successVal: { color: "#f8fbff", fontSize: 13, fontWeight: "700" },
  successTotal: { color: "#4e8cff", fontSize: 16 },
})
