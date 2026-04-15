import { Pressable, StyleSheet, Text, View } from "react-native"
import { ExpiryBadge } from "@/components/ExpiryBadge"
import { DEFAULT_EXPIRY_SETTINGS, type ExpirySettings } from "@/lib/expiry"
import type { Product } from "@/lib/types"

type ProductListItemProps = {
  product: Product
  expirySettings?: ExpirySettings
  onAddBatch?: (productId: string, productName: string) => void
}

export function ProductListItem({
  product,
  expirySettings = DEFAULT_EXPIRY_SETTINGS,
  onAddBatch,
}: ProductListItemProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.meta}>{product.category || "Uncategorized"}</Text>
        </View>
        <View style={[styles.badge, badgeStyles(product.status)]}>
          <Text style={styles.badgeText}>{product.status}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <Metric label="Active Stock" value={String(product.activeStock)} />
        <Metric label="Total Stock" value={String(product.totalStock)} />
        <Metric label="Price" value={`Rs ${product.price.toFixed(2)}`} />
      </View>

      <Text style={styles.batchHeading}>Batches</Text>
      {product.batches.map((batch) => (
        <View key={batch.id} style={styles.batchRow}>
          <View style={styles.batchCopy}>
            <Text style={styles.batchTitle}>{batch.batchNumber}</Text>
            <Text style={styles.batchMeta}>
              Qty {batch.quantity} · {batch.barcode}
            </Text>
          </View>
          <ExpiryBadge expiryDate={batch.expiryDate} settings={expirySettings} />
        </View>
      ))}

      <Pressable
        onPress={() => onAddBatch?.(product.id, product.name)}
        style={({ pressed }) => [styles.addBatchButton, pressed && styles.addBatchButtonPressed]}
      >
        <Text style={styles.addBatchButtonText}>+ Add Batch</Text>
      </Pressable>
    </View>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  )
}

function badgeStyles(status: string) {
  if (status === "Low Stock") {
    return { backgroundColor: "#3a250b", borderColor: "#9a5a10" }
  }

  if (status === "Out of Stock" || status === "Recalled") {
    return { backgroundColor: "#341117", borderColor: "#7f1d1d" }
  }

  return { backgroundColor: "#072036", borderColor: "#14539f" }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#061024",
    borderColor: "#1a2740",
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    color: "#f8fbff",
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    color: "#8f9ab2",
    fontSize: 14,
    marginTop: 4,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: "#f8fbff",
    fontSize: 12,
    fontWeight: "700",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: "#0b1731",
    borderRadius: 14,
    flex: 1,
    padding: 12,
  },
  metricLabel: {
    color: "#8f9ab2",
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: "#f8fbff",
    fontSize: 16,
    fontWeight: "700",
  },
  batchHeading: {
    color: "#f8fbff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  batchRow: {
    alignItems: "center",
    borderTopColor: "#17243b",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  batchCopy: {
    flex: 1,
    paddingRight: 10,
  },
  batchTitle: {
    color: "#f8fbff",
    fontSize: 14,
    fontWeight: "600",
  },
  batchMeta: {
    color: "#8f9ab2",
    fontSize: 12,
    marginTop: 4,
  },
  addBatchButton: {
    backgroundColor: "#4e8cff",
    borderRadius: 12,
    marginTop: 12,
    paddingVertical: 10,
  },
  addBatchButtonPressed: {
    opacity: 0.8,
  },
  addBatchButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
})
