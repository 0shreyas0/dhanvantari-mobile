import { AppShell } from "@/components/AppShell"
import { PlaceholderPanel } from "@/components/PlaceholderPanel"
import { ProductListItem } from "@/components/ProductListItem"
import { createApiClient } from "@/lib/api"
import type { ProductsResponse } from "@/lib/types"
import { useAuth } from "@clerk/clerk-expo"
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native"

export default function ProductsScreen() {
  const { getToken } = useAuth()
  const [data, setData] = useState<ProductsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadProducts = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (mode === "initial") setLoading(true)
      if (mode === "refresh") setRefreshing(true)
      setError(null)

      try {
        const api = createApiClient(() => getToken())
        const response = await api.getProducts()
        setData(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load products.")
      } finally {
        if (mode === "initial") setLoading(false)
        if (mode === "refresh") setRefreshing(false)
      }
    },
    [getToken]
  )

  useEffect(() => {
    void loadProducts("initial")
  }, [loadProducts])

  return (
    <AppShell title="Products" subtitle="Manage your inventory.">
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4e8cff" />
        </View>
      ) : error ? (
        <PlaceholderPanel title="Unable to load products" body={error} />
      ) : data ? (
        <FlatList
          data={data.products}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                void loadProducts("refresh")
              }}
              tintColor="#4e8cff"
            />
          }
          ListHeaderComponent={
            <View style={styles.headerCard}>
              <Text style={styles.headerTitle}>{data.pharmacyName}</Text>
              <Text style={styles.headerMeta}>
                {data.products.length} products · early {data.expirySettings.earlyWarningDays}d · urgent {data.expirySettings.urgentWarningDays}d · critical {data.expirySettings.criticalDays}d
              </Text>
            </View>
          }
          ListEmptyComponent={
            <PlaceholderPanel
              title="No products found"
              body="This account does not have inventory yet."
            />
          }
          renderItem={({ item }) => <ProductListItem product={item} />}
          showsVerticalScrollIndicator={false}
        />
      ) : null}
    </AppShell>
  )
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 220,
  },
  headerCard: {
    backgroundColor: "#061024",
    borderColor: "#1a2740",
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  headerTitle: {
    color: "#f8fbff",
    fontSize: 18,
    fontWeight: "700",
  },
  headerMeta: {
    color: "#8f9ab2",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
})
