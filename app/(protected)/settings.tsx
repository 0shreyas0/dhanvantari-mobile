import { createApiClient } from "@/lib/api"
import { PlaceholderPanel } from "@/components/PlaceholderPanel"
import type { SettingsResponse } from "@/lib/types"
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo"
import { type ReactNode, useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type PharmacyForm = { name: string; phone: string; address: string; logoUrl: string }
type ExpiryForm = { earlyWarningDays: string; urgentWarningDays: string; criticalDays: string }
type ExpiryErrors = { earlyWarningDays?: string; urgentWarningDays?: string; criticalDays?: string }

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

function Field({
  label,
  hint,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
}: {
  label: string
  hint?: string
  value: string
  onChangeText: (v: string) => void
  placeholder?: string
  keyboardType?: "default" | "phone-pad" | "numeric" | "email-address"
  error?: string
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#3d4f6b"
        keyboardType={keyboardType ?? "default"}
        style={[styles.input, error ? styles.inputError : null]}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
      {hint && !error ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  )
}

export default function SettingsScreen() {
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const { user } = useUser()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [savingPharmacy, setSavingPharmacy] = useState(false)
  const [savingExpiry, setSavingExpiry] = useState(false)

  const [pharma, setPharma] = useState<PharmacyForm>({
    name: "",
    phone: "",
    address: "",
    logoUrl: "",
  })
  const [expiry, setExpiry] = useState<ExpiryForm>({
    earlyWarningDays: "90",
    urgentWarningDays: "30",
    criticalDays: "7",
  })
  const [expiryErrors, setExpiryErrors] = useState<ExpiryErrors>({})

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const api = createApiClient(() => getToken())
      const res: SettingsResponse = await api.getSettings()
      setPharma({
        name: res.pharmacy.name ?? "",
        phone: res.pharmacy.phone ?? "",
        address: res.pharmacy.address ?? "",
        logoUrl: res.pharmacy.logoUrl ?? "",
      })
      setExpiry({
        earlyWarningDays: String(res.expiry.earlyWarningDays),
        urgentWarningDays: String(res.expiry.urgentWarningDays),
        criticalDays: String(res.expiry.criticalDays),
      })
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load settings.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleSavePharmacy = async () => {
    setSavingPharmacy(true)
    try {
      const api = createApiClient(() => getToken())
      await api.updatePharmacySettings({
        name: pharma.name || "My Pharmacy",
        phone: pharma.phone || undefined,
        address: pharma.address || undefined,
        logoUrl: pharma.logoUrl || undefined,
      })
      Alert.alert("Saved", "Pharmacy settings updated successfully.")
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to save pharmacy settings.")
    } finally {
      setSavingPharmacy(false)
    }
  }

  const validateExpiry = (): boolean => {
    const early = Number(expiry.earlyWarningDays)
    const urgent = Number(expiry.urgentWarningDays)
    const critical = Number(expiry.criticalDays)
    const errors: ExpiryErrors = {}

    if (!early || early <= 0) errors.earlyWarningDays = "Must be greater than 0"
    if (!urgent || urgent <= 0) errors.urgentWarningDays = "Must be greater than 0"
    if (!critical || critical <= 0) errors.criticalDays = "Must be greater than 0"
    if (critical >= urgent) errors.criticalDays = "Critical must be less than Urgent"
    if (urgent >= early) errors.urgentWarningDays = "Urgent must be less than Early Warning"

    setExpiryErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveExpiry = async () => {
    if (!validateExpiry()) return
    setSavingExpiry(true)
    try {
      const api = createApiClient(() => getToken())
      await api.updateExpirySettings({
        earlyWarningDays: Number(expiry.earlyWarningDays),
        urgentWarningDays: Number(expiry.urgentWarningDays),
        criticalDays: Number(expiry.criticalDays),
      })
      Alert.alert("Saved", "Expiry thresholds updated successfully.")
    } catch (err) {
      Alert.alert("Error", err instanceof Error ? err.message : "Failed to save expiry settings.")
    } finally {
      setSavingExpiry(false)
    }
  }

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => void signOut(),
      },
    ])
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Settings</Text>
            <Text style={styles.pageSubtitle}>Configure your store identity and expiry thresholds.</Text>
          </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#4e8cff" />
            </View>
          ) : loadError ? (
            <>
              <PlaceholderPanel title="Unable to load settings" body={loadError} />
              <Pressable
                onPress={() => void load()}
                style={({ pressed }) => [styles.saveBtn, { marginTop: 10 }, pressed && styles.pressed]}
              >
                <Text style={styles.saveBtnText}>Retry</Text>
              </Pressable>
            </>
          ) : (
            <>
              {/* ── User card ──────────────────────────────────────────────── */}
              <View style={styles.userCard}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {(user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? "?")
                      .slice(0, 1)
                      .toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user?.fullName ?? "User"}</Text>
                  <Text style={styles.userEmail}>
                    {user?.primaryEmailAddress?.emailAddress ?? ""}
                  </Text>
                </View>
              </View>

              {/* ── Basic Information ─────────────────────────────────────── */}
              <SectionCard title="Basic Information">
                <Field
                  label="Pharmacy Name"
                  hint="Appears at the top of every bill."
                  value={pharma.name}
                  onChangeText={(v) => setPharma((p) => ({ ...p, name: v }))}
                  placeholder="e.g. New Bhavani Medical"
                />
                <Field
                  label="Phone Number"
                  value={pharma.phone}
                  onChangeText={(v) => setPharma((p) => ({ ...p, phone: v }))}
                  placeholder="e.g. 9876543210"
                  keyboardType="phone-pad"
                />
                <Field
                  label="Address"
                  value={pharma.address}
                  onChangeText={(v) => setPharma((p) => ({ ...p, address: v }))}
                  placeholder="e.g. Andheri East, Mumbai"
                />
                <Field
                  label="Logo URL"
                  hint="Provide a link to your pharmacy logo."
                  value={pharma.logoUrl}
                  onChangeText={(v) => setPharma((p) => ({ ...p, logoUrl: v }))}
                  placeholder="https://example.com/logo.png"
                  keyboardType="email-address"
                />
                <Pressable
                  onPress={handleSavePharmacy}
                  disabled={savingPharmacy}
                  style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
                >
                  {savingPharmacy ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Pharmacy Settings</Text>
                  )}
                </Pressable>
              </SectionCard>

              {/* ── Expiry Warning Thresholds ────────────────────────────── */}
              <SectionCard title="Expiry Warning Thresholds">
                <Text style={styles.expiryHint}>
                  Must satisfy:{" "}
                  <Text style={styles.expiryHintMono}>Critical &lt; Urgent &lt; Early</Text>
                </Text>

                <Field
                  label="🟡  Early Warning (days)"
                  hint="Yellow badge — first notice that expiry is approaching."
                  value={expiry.earlyWarningDays}
                  onChangeText={(v) => {
                    setExpiry((e) => ({ ...e, earlyWarningDays: v }))
                    setExpiryErrors({})
                  }}
                  keyboardType="numeric"
                  error={expiryErrors.earlyWarningDays}
                />
                <Field
                  label="🟠  Urgent Warning (days)"
                  hint="Orange badge — action should be taken soon."
                  value={expiry.urgentWarningDays}
                  onChangeText={(v) => {
                    setExpiry((e) => ({ ...e, urgentWarningDays: v }))
                    setExpiryErrors({})
                  }}
                  keyboardType="numeric"
                  error={expiryErrors.urgentWarningDays}
                />
                <Field
                  label="🔴  Critical (days)"
                  hint="Red badge + billing confirmation dialog triggered."
                  value={expiry.criticalDays}
                  onChangeText={(v) => {
                    setExpiry((e) => ({ ...e, criticalDays: v }))
                    setExpiryErrors({})
                  }}
                  keyboardType="numeric"
                  error={expiryErrors.criticalDays}
                />

                <Pressable
                  onPress={handleSaveExpiry}
                  disabled={savingExpiry}
                  style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
                >
                  {savingExpiry ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Thresholds</Text>
                  )}
                </Pressable>
              </SectionCard>

              {/* ── Sign Out ─────────────────────────────────────────────── */}
              <Pressable
                onPress={handleSignOut}
                style={({ pressed }) => [styles.signOutBtn, pressed && styles.pressed]}
              >
                <Text style={styles.signOutText}>Sign Out</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#030817",
    flex: 1,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 32,
    paddingTop: 12,
  },
  pageHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    color: "#f8fbff",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    color: "#8f9ab2",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  userCard: {
    alignItems: "center",
    backgroundColor: "#061024",
    borderColor: "#1a2740",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
    padding: 16,
  },
  userAvatar: {
    alignItems: "center",
    backgroundColor: "#0d1e3d",
    borderColor: "#18336b",
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  userAvatarText: {
    color: "#4e8cff",
    fontSize: 20,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: "#f8fbff",
    fontSize: 16,
    fontWeight: "700",
  },
  userEmail: {
    color: "#8f9ab2",
    fontSize: 13,
    marginTop: 3,
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
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  expiryHint: {
    color: "#8f9ab2",
    fontSize: 12,
    marginBottom: 14,
  },
  expiryHintMono: {
    color: "#4e8cff",
    fontWeight: "600",
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: "#a2aec5",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#0b1731",
    borderColor: "#17233b",
    borderRadius: 12,
    borderWidth: 1,
    color: "#f8fbff",
    fontSize: 15,
    height: 48,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: "#ef5b8c",
  },
  fieldError: {
    color: "#ef5b8c",
    fontSize: 12,
    marginTop: 5,
  },
  fieldHint: {
    color: "#6b7fa3",
    fontSize: 12,
    marginTop: 5,
  },
  saveBtn: {
    alignItems: "center",
    backgroundColor: "#4e8cff",
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    marginTop: 4,
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.75,
  },
  signOutBtn: {
    alignItems: "center",
    backgroundColor: "#1a0b14",
    borderColor: "#4a1630",
    borderRadius: 14,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    marginTop: 6,
  },
  signOutText: {
    color: "#ef5b8c",
    fontSize: 15,
    fontWeight: "700",
  },
})
