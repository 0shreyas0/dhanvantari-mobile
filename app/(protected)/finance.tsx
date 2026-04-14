import { AppShell } from "@/components/AppShell"
import { PlaceholderPanel } from "@/components/PlaceholderPanel"
import { createApiClient } from "@/lib/api"
import type { FinanceResponse } from "@/lib/types"
import { useAuth } from "@clerk/clerk-expo"
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native"

type Bill = FinanceResponse["bills"][number]

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub: string
  accent: string
}) {
  return (
    <View style={[styles.metricCard, { borderLeftColor: accent, borderLeftWidth: 3 }]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
      <Text style={styles.metricSub}>{sub}</Text>
    </View>
  )
}

function BillRow({ bill, onDownload }: { bill: Bill; onDownload: (bill: Bill) => void }) {
  const date = new Date(bill.createdAt)
  const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  const timeStr = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })

  return (
    <View style={styles.billCard}>
      <View style={styles.billTop}>
        <View style={styles.billLeft}>
          <Text style={styles.billAmount}>Rs {bill.totalAmount.toFixed(2)}</Text>
          <Text style={styles.billCustomer}>
            {bill.customerName ?? "Anonymous Walk-in"}
          </Text>
          {bill.customerPhone ? (
            <Text style={styles.billPhone}>{bill.customerPhone}</Text>
          ) : null}
        </View>
        <View style={styles.billRight}>
          <Text style={styles.billDate}>{dateStr}</Text>
          <Text style={styles.billTime}>{timeStr}</Text>
        </View>
      </View>
      {bill.itemsText ? (
        <Text style={styles.billItems} numberOfLines={2}>
          {bill.itemsText}
        </Text>
      ) : null}
      <Pressable
        onPress={() => onDownload(bill)}
        style={({ pressed }) => [styles.downloadButton, pressed && styles.downloadButtonPressed]}
      >
        <Text style={styles.downloadButtonText}>📥 Download PDF</Text>
      </Pressable>
    </View>
  )
}

export default function FinanceScreen() {
  const { getToken } = useAuth()
  const [data, setData] = useState<FinanceResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (mode === "initial") setLoading(true)
      else setRefreshing(true)
      setError(null)
      try {
        const api = createApiClient(() => getToken())
        const response = await api.getFinance()
        setData(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load finance data.")
      } finally {
        if (mode === "initial") setLoading(false)
        else setRefreshing(false)
      }
    },
    []
  )

  useEffect(() => {
    void load("initial")
  }, [load])

  return (
    <AppShell
      title="Finance"
      subtitle="Track your sales history, revenue, and customer invoices."
    >
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4e8cff" />
        </View>
      ) : error ? (
        <PlaceholderPanel title="Unable to load finance" body={error} />
      ) : data ? (
        <FlatList
          data={data.bills}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load("refresh")}
              tintColor="#4e8cff"
            />
          }
          ListHeaderComponent={
            <>
              {/* Metric cards — 2 per row */}
              <View style={styles.metricsGrid}>
                <MetricCard
                  label="Lifetime Revenue"
                  value={`Rs ${data.summary.totalRevenue.toFixed(2)}`}
                  sub={`Across ${data.summary.totalBills} sales`}
                  accent="#4e8cff"
                />
                <MetricCard
                  label="Average Order"
                  value={`Rs ${data.summary.averageOrderValue.toFixed(2)}`}
                  sub="Per transaction"
                  accent="#16c47f"
                />
              </View>
              <View style={styles.metricsGrid}>
                <MetricCard
                  label="Expired Loss"
                  value={`Rs ${data.summary.expiredLoss.toFixed(2)}`}
                  sub="Dead batch cost"
                  accent="#f97316"
                />
                <MetricCard
                  label="Recalled Loss"
                  value={`Rs ${data.summary.recalledLoss.toFixed(2)}`}
                  sub="Frozen capital"
                  accent="#ef5b8c"
                />
              </View>

              {/* Section label */}
              <Text style={styles.sectionLabel}>Transaction History</Text>
            </>
          }
          ListEmptyComponent={
            <PlaceholderPanel
              title="No transactions yet"
              body="Start billing on the POS to see transaction history here."
            />
          }
          renderItem={({ item }) => <BillRow bill={item} />}
          contentContainerStyle={styles.listContent}
        />
      ) : null}
    </AppShell>
  )
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  metricCard: {
    backgroundColor: "#061024",
    borderColor: "#1a2740",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  metricLabel: {
    color: "#8f9ab2",
    fontSize: 12,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  metricSub: {
    color: "#8f9ab2",
    fontSize: 12,
    marginTop: 6,
  },
  sectionLabel: {
    color: "#f8fbff",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  billCard: {
    backgroundColor: "#061024",
    borderColor: "#1a2740",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  billTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  billLeft: {
    flex: 1,
    paddingRight: 12,
  },
  billRight: {
    alignItems: "flex-end",
  },
  billAmount: {
    color: "#f8fbff",
    fontSize: 17,
    fontWeight: "700",
  },
  billCustomer: {
    color: "#a2aec5",
    fontSize: 13,
    marginTop: 3,
  },
  billPhone: {
    color: "#6b7fa3",
    fontSize: 12,
    marginTop: 2,
  },
  billDate: {
    color: "#8f9ab2",
    fontSize: 12,
    fontWeight: "600",
  },
  billTime: {
    color: "#6b7fa3",
    fontSize: 12,
    marginTop: 2,
  },
  billItems: {
    borderTopColor: "#17243b",
    borderTopWidth: 1,
    color: "#6b7fa3",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
    paddingTop: 10,
  },
})
