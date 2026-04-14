import { StyleSheet, Text, View } from "react-native"
import type { Product } from "@/lib/types"

type ProductListItemProps = {
  product: Product
}

export function ProductListItem({ product }: ProductListItemProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.meta}>
            {product.category || "Uncategorized"} | {product.status}
          </Text>
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
              Qty {batch.quantity} | {batch.barcode}
            </Text>
          </View>
          <Text style={styles.batchExpiry}>
            {new Date(batch.expiryDate).toLocaleDateString()}
          </Text>
        </View>
      ))}
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
    return { backgroundColor: "#fff0d8", borderColor: "#efc77f" }
  }

  if (status === "Out of Stock" || status === "Recalled") {
    return { backgroundColor: "#ffe2de", borderColor: "#e2a59b" }
  }

  return { backgroundColor: "#dce9d7", borderColor: "#96b18a" }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#ddd7cb",
    borderRadius: 18,
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
    color: "#1d2a22",
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    color: "#5d655f",
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
    color: "#1d2a22",
    fontSize: 12,
    fontWeight: "700",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    backgroundColor: "#f7f4ed",
    borderRadius: 14,
    flex: 1,
    padding: 12,
  },
  metricLabel: {
    color: "#6d746f",
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    color: "#1d2a22",
    fontSize: 16,
    fontWeight: "700",
  },
  batchHeading: {
    color: "#1d2a22",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  batchRow: {
    alignItems: "center",
    borderTopColor: "#ece6da",
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
    color: "#1d2a22",
    fontSize: 14,
    fontWeight: "600",
  },
  batchMeta: {
    color: "#6d746f",
    fontSize: 12,
    marginTop: 4,
  },
  batchExpiry: {
    color: "#47544d",
    fontSize: 12,
    fontWeight: "600",
  },
})
