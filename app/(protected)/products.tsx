import { AppShell } from "@/components/AppShell"
import { AddBatchModal } from "@/components/AddBatchModal"
import { CreateProductModal } from "@/components/CreateProductModal"
import { PlaceholderPanel } from "@/components/PlaceholderPanel"
import { ProductListItem } from "@/components/ProductListItem"
import { createApiClient } from "@/lib/api"
import type { ProductsResponse } from "@/lib/types"
import { useAuth } from "@clerk/clerk-expo"
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
  const [createProductModalVisible, setCreateProductModalVisible] = useState(false)
  const [addBatchModalVisible, setAddBatchModalVisible] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [selectedProductName, setSelectedProductName] = useState<string | null>(null)

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
    []
  )

  useEffect(() => {
    void loadProducts("initial")
  }, [loadProducts])

  const handleAddBatch = (productId: string, productName: string) => {
    setSelectedProductId(productId)
    setSelectedProductName(productName)
    setAddBatchModalVisible(true)
  }

  return (
    <AppShell 
      title="Products" 
      subtitle="Manage your inventory."
      headerRight={
        <Pressable
          onPress={() => setCreateProductModalVisible(true)}
          style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
        >
          <Text style={styles.headerButtonText}>+ Create</Text>
        </Pressable>
      }
    >
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
          renderItem={({ item }) => (
            <ProductListItem
              product={item}
              expirySettings={data.expirySettings}
              onAddBatch={handleAddBatch}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : null}
      <CreateProductModal
        visible={createProductModalVisible}
        onClose={() => setCreateProductModalVisible(false)}
        onSuccess={() => void loadProducts("refresh")}
      />

      {selectedProductId && selectedProductName && (
        <AddBatchModal
          visible={addBatchModalVisible}
          productId={selectedProductId}
          productName={selectedProductName}
          onClose={() => setAddBatchModalVisible(false)}
          onSuccess={() => void loadProducts("refresh")}
        />
      )}
    </AppShell>
  )
}

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 220,
  },
  headerButton: {
    backgroundColor: "#4e8cff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButtonPressed: {
    opacity: 0.8,
  },
  headerButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
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
