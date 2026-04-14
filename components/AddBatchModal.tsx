import { createApiClient } from "@/lib/api"
import { useAuth } from "@clerk/clerk-expo"
import { useState } from "react"
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

type AddBatchModalProps = {
  visible: boolean
  productId: string
  productName: string
  onClose: () => void
  onSuccess: () => void
}

export function AddBatchModal({
  visible,
  productId,
  productName,
  onClose,
  onSuccess,
}: AddBatchModalProps) {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    batchNumber: "",
    barcode: "",
    quantity: "",
    costPrice: "",
    sellingPrice: "",
    expiryDate: "",
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
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
      await api.addBatch(productId, {
        batchNumber: form.batchNumber.trim(),
        barcode: form.barcode.trim() || undefined,
        quantity: Number(form.quantity) || 0,
        costPrice: Number(form.costPrice) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
        expiryDate: form.expiryDate.trim(),
      })

      Alert.alert("Success", "Batch added successfully!")
      setForm({
        batchNumber: "",
        barcode: "",
        quantity: "",
        costPrice: "",
        sellingPrice: "",
        expiryDate: "",
      })
      onSuccess()
      onClose()
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to add batch")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>Add Batch</Text>
            <Text style={styles.subtitle}>Add stock to {productName}</Text>

            <TextInput
              style={styles.input}
              placeholder="Batch number *"
              placeholderTextColor="#5a6d8c"
              value={form.batchNumber}
              onChangeText={(v) => handleChange("batchNumber", v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Barcode"
              placeholderTextColor="#5a6d8c"
              value={form.barcode}
              onChangeText={(v) => handleChange("barcode", v)}
              keyboardType="decimal-pad"
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
                  <Text style={styles.buttonPrimaryText}>Add Batch</Text>
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
    maxHeight: "80%",
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
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
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
