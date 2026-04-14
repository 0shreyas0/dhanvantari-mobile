import { createApiClient } from "@/lib/api"
import { useAuth } from "@clerk/clerk-expo"
import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"

type CreateProductModalProps = {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateProductModal({ visible, onClose, onSuccess }: CreateProductModalProps) {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    barcode: "",
    lowStockThreshold: "10",
    batchNumber: "",
    quantity: "",
    costPrice: "",
    sellingPrice: "",
    expiryDate: "",
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      Alert.alert("Error", "Product name is required")
      return
    }
    if (!form.barcode.trim()) {
      Alert.alert("Error", "Barcode is required")
      return
    }
    if (!form.batchNumber.trim()) {
      Alert.alert("Error", "Batch number is required")
      return
    }
    if (!form.expiryDate.trim()) {
      Alert.alert("Error", "Expiry date is required (YYYY-MM-DD)")
      return
    }

    setLoading(true)
    try {
      const api = createApiClient(() => getToken())
      await api.createProduct({
        name: form.name.trim(),
        barcode: form.barcode.trim(),
        category: form.category.trim() || undefined,
        description: form.description.trim() || undefined,
        lowStockThreshold: Number(form.lowStockThreshold) || 10,
        initialBatch: {
          batchNumber: form.batchNumber.trim(),
          quantity: Number(form.quantity) || 0,
          costPrice: Number(form.costPrice) || 0,
          sellingPrice: Number(form.sellingPrice) || 0,
          expiryDate: form.expiryDate.trim(),
        },
      })

      Alert.alert("Success", "Product created successfully!")
      setForm({
        name: "",
        category: "",
        description: "",
        barcode: "",
        lowStockThreshold: "10",
        batchNumber: "",
        quantity: "",
        costPrice: "",
        sellingPrice: "",
        expiryDate: "",
      })
      onSuccess()
      onClose()
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to create product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>Create Product</Text>
            <Text style={styles.subtitle}>Add a new medicine to your inventory</Text>

            {/* Product Info */}
            <Text style={styles.sectionLabel}>Product Info</Text>
            <TextInput
              style={styles.input}
              placeholder="Product name *"
              placeholderTextColor="#5a6d8c"
              value={form.name}
              onChangeText={(v) => handleChange("name", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Category"
              placeholderTextColor="#5a6d8c"
              value={form.category}
              onChangeText={(v) => handleChange("category", v)}
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Description"
              placeholderTextColor="#5a6d8c"
              value={form.description}
              onChangeText={(v) => handleChange("description", v)}
              multiline
              numberOfLines={2}
            />
            <TextInput
              style={styles.input}
              placeholder="Barcode *"
              placeholderTextColor="#5a6d8c"
              value={form.barcode}
              onChangeText={(v) => handleChange("barcode", v)}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Low stock threshold (default: 10)"
              placeholderTextColor="#5a6d8c"
              value={form.lowStockThreshold}
              onChangeText={(v) => handleChange("lowStockThreshold", v)}
              keyboardType="decimal-pad"
            />

            {/* Batch Info */}
            <Text style={styles.sectionLabel}>Initial Batch</Text>
            <TextInput
              style={styles.input}
              placeholder="Batch number *"
              placeholderTextColor="#5a6d8c"
              value={form.batchNumber}
              onChangeText={(v) => handleChange("batchNumber", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              placeholderTextColor="#5a6d8c"
              value={form.quantity}
              onChangeText={(v) => handleChange("quantity", v)}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Cost price"
              placeholderTextColor="#5a6d8c"
              value={form.costPrice}
              onChangeText={(v) => handleChange("costPrice", v)}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Selling price"
              placeholderTextColor="#5a6d8c"
              value={form.sellingPrice}
              onChangeText={(v) => handleChange("sellingPrice", v)}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Expiry date (YYYY-MM-DD) *"
              placeholderTextColor="#5a6d8c"
              value={form.expiryDate}
              onChangeText={(v) => handleChange("expiryDate", v)}
            />

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <Pressable
                onPress={onClose}
                disabled={loading}
                style={({ pressed }) => [
                  styles.buttonSecondary,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.buttonSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={({ pressed }) => [
                  styles.buttonPrimary,
                  loading && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonPrimaryText}>Create Product</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    flex: 1,
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#061024",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    padding: 20,
  },
  scroll: {
    paddingBottom: 20,
  },
  title: {
    color: "#f8fbff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#8f9ab2",
    fontSize: 14,
    marginBottom: 20,
  },
  sectionLabel: {
    color: "#8f9ab2",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#0b1731",
    borderColor: "#1a2740",
    borderRadius: 12,
    borderWidth: 1,
    color: "#f8fbff",
    fontSize: 14,
    marginBottom: 10,
    padding: 12,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  buttonSecondary: {
    backgroundColor: "#1a2740",
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
  },
  buttonSecondaryText: {
    color: "#8f9ab2",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonPrimary: {
    backgroundColor: "#4e8cff",
    borderRadius: 12,
    flex: 1,
    paddingVertical: 12,
  },
  buttonPrimaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.7,
  },
})
