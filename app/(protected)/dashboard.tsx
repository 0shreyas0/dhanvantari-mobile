import { AppShell } from "@/components/AppShell"
import { InfoCard } from "@/components/InfoCard"
import { PlaceholderPanel } from "@/components/PlaceholderPanel"
import { createApiClient } from "@/lib/api"
import type { DashboardResponse } from "@/lib/types"
import { useAuth } from "@clerk/clerk-expo"
import { useEffect, useState } from "react"
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native"

export default function DashboardScreen() {
  const { getToken } = useAuth()
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const api = createApiClient(() => getToken())
        const response = await api.getDashboard()
        if (isMounted) setData(response)
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load dashboard.")
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    void load()

    return () => {
      isMounted = false
    }
  }, [getToken])

  return (
    <AppShell
      title="Dashboard"
      subtitle="Inventory overview and today's business summary."
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#2f5d44" />
          </View>
        ) : error ? (
          <PlaceholderPanel title="Unable to load dashboard" body={error} />
        ) : data ? (
          <>
            <View style={styles.metricsRow}>
              <MetricCard label="Today's Revenue" value={`Rs ${data.totalRevenueToday.toFixed(2)}`} />
              <MetricCard label="Sales Today" value={String(data.totalSalesToday)} />
            </View>
            <View style={styles.metricsRow}>
              <MetricCard label="Active Catalog" value={String(data.totalProducts)} />
              <MetricCard
                label="Catalog Health"
                value={`${Math.round(data.stockHealth * 100)}%`}
              />
            </View>

            <InfoCard title="Action Required">
              <Text style={styles.infoLine}>
                {data.lowStock} low stock | {data.outOfStock} out of stock
              </Text>
            </InfoCard>

            <InfoCard title="Expiry Alerts">
              <Text style={styles.infoLine}>
                Critical {data.expiryAlerts.critical.length} | Urgent {data.expiryAlerts.urgent.length}
                {" "}| Early {data.expiryAlerts.early.length}
              </Text>
            </InfoCard>

            <InfoCard title="Recent Sales">
              {data.recentTransactions.length === 0 ? (
                <Text style={styles.infoMuted}>No recent sales yet.</Text>
              ) : (
                data.recentTransactions.map((transaction) => (
                  <View key={transaction.id} style={styles.transactionRow}>
                    <Text style={styles.transactionAmount}>
                      Rs {transaction.amount.toFixed(2)}
                    </Text>
                    <Text style={styles.transactionMeta}>
                      {transaction.customerName || "Anonymous Walk-in"}
                    </Text>
                  </View>
                ))
              )}
            </InfoCard>
          </>
        ) : null}
      </ScrollView>
    </AppShell>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 220,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    backgroundColor: "#ffffff",
    borderColor: "#ddd7cb",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    padding: 16,
  },
  metricLabel: {
    color: "#6d746f",
    fontSize: 12,
    marginBottom: 6,
  },
  metricValue: {
    color: "#1d2a22",
    fontSize: 22,
    fontWeight: "700",
  },
  infoLine: {
    color: "#1d2a22",
    fontSize: 15,
    lineHeight: 22,
  },
  infoMuted: {
    color: "#6d746f",
    fontSize: 15,
  },
  transactionRow: {
    borderTopColor: "#ece6da",
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  transactionAmount: {
    color: "#1d2a22",
    fontSize: 15,
    fontWeight: "700",
  },
  transactionMeta: {
    color: "#6d746f",
    fontSize: 13,
    marginTop: 4,
  },
})
