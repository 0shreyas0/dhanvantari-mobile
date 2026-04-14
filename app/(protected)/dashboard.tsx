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
  }, [])

  return (
    <AppShell
      title="Dashboard"
      subtitle="Manage your pharmacy inventory efficiently and track stock levels."
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#4e8cff" />
          </View>
        ) : error ? (
          <PlaceholderPanel title="Unable to load dashboard" body={error} />
        ) : data ? (
          <>
            <View style={styles.metricsRow}>
              <MetricCard
                accentColor="#16c47f"
                label="Today's Revenue"
                value={`Rs ${data.totalRevenueToday.toFixed(2)}`}
                subtitle={`Across ${data.totalSalesToday} bills`}
              />
              <MetricCard
                accentColor="#2563eb"
                label="Active Catalog"
                value={String(data.totalProducts)}
                subtitle="Unique medicines tracked"
              />
            </View>

            <View style={styles.metricsRow}>
              <MetricCard
                accentColor="#f97316"
                label="Action Required"
                value={String(data.lowStock + data.outOfStock)}
                subtitle={`${data.outOfStock} out of stock, ${data.lowStock} low`}
              />
              <MetricCard
                accentColor="#16c47f"
                label="Catalog Health"
                value={`${Math.round(data.stockHealth * 100)}%`}
                subtitle="Unique active products stocked"
              />
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Product Catalog Breakdown</Text>
              <LegendRow
                color="#34d1bf"
                label="Healthy stock"
                value={String(Math.max(data.totalProducts - data.lowStock - data.outOfStock, 0))}
              />
              <LegendRow color="#facc15" label="Low stock" value={String(data.lowStock)} />
              <LegendRow color="#ef5b8c" label="Out of stock" value={String(data.outOfStock)} />
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Catalog Availability</Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.trackFill,
                    { width: `${Math.max(6, Math.round(data.stockHealth * 100))}%` },
                  ]}
                />
              </View>
              <Text style={styles.availabilityValue}>{Math.round(data.stockHealth * 100)}%</Text>
              <Text style={styles.availabilityText}>% of unique SKUs adequately stocked</Text>
            </View>

            <InfoCard title="Expiry Alerts">
              <Text style={styles.infoLine}>
                Critical {data.expiryAlerts.critical.length} | Urgent {data.expiryAlerts.urgent.length} | Early {data.expiryAlerts.early.length}
              </Text>
            </InfoCard>

            <InfoCard title="Recent Sales">
              {data.recentTransactions.length === 0 ? (
                <Text style={styles.infoMuted}>No recent sales today yet.</Text>
              ) : (
                data.recentTransactions.map((transaction) => (
                  <View key={transaction.id} style={styles.transactionRow}>
                    <Text style={styles.transactionAmount}>Rs {transaction.amount.toFixed(2)}</Text>
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

function MetricCard({
  accentColor,
  label,
  value,
  subtitle,
}: {
  accentColor: string
  label: string
  value: string
  subtitle: string
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTopRow}>
        <Text style={styles.metricLabel}>{label}</Text>
        <View style={[styles.metricAccent, { backgroundColor: accentColor }]} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </View>
  )
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <View style={styles.legendRow}>
      <View style={styles.legendLeft}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text style={styles.legendLabel}>{label}</Text>
      </View>
      <Text style={styles.legendValue}>{value}</Text>
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
    backgroundColor: "#061024",
    borderColor: "#1a2740",
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    padding: 16,
  },
  metricTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  metricAccent: {
    borderRadius: 12,
    height: 14,
    width: 14,
  },
  metricLabel: {
    color: "#a2aec5",
    fontSize: 12,
  },
  metricValue: {
    color: "#f8fbff",
    fontSize: 22,
    fontWeight: "700",
  },
  metricSubtitle: {
    color: "#8f9ab2",
    fontSize: 13,
    marginTop: 10,
  },
  sectionCard: {
    backgroundColor: "#061024",
    borderColor: "#1a2740",
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  sectionTitle: {
    color: "#f8fbff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  legendRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  legendLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  legendDot: {
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  legendLabel: {
    color: "#a2aec5",
    fontSize: 14,
  },
  legendValue: {
    color: "#f8fbff",
    fontSize: 14,
    fontWeight: "700",
  },
  track: {
    backgroundColor: "#0a1530",
    borderRadius: 999,
    height: 14,
    overflow: "hidden",
  },
  trackFill: {
    backgroundColor: "#7357ff",
    borderRadius: 999,
    height: "100%",
  },
  availabilityValue: {
    color: "#f8fbff",
    fontSize: 40,
    fontWeight: "700",
    marginTop: 18,
    textAlign: "center",
  },
  availabilityText: {
    color: "#8f9ab2",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  infoLine: {
    color: "#f8fbff",
    fontSize: 15,
    lineHeight: 22,
  },
  infoMuted: {
    color: "#8f9ab2",
    fontSize: 15,
  },
  transactionRow: {
    borderTopColor: "#17243b",
    borderTopWidth: 1,
    paddingVertical: 10,
  },
  transactionAmount: {
    color: "#f8fbff",
    fontSize: 15,
    fontWeight: "700",
  },
  transactionMeta: {
    color: "#8f9ab2",
    fontSize: 13,
    marginTop: 4,
  },
})
