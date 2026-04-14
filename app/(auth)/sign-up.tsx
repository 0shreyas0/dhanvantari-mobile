import { useSignUp } from "@clerk/clerk-expo"
import { Link, useRouter } from "expo-router"
import { useState } from "react"
import {
  ActivityIndicator,
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

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()
  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [pendingVerification, setPendingVerification] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateAccount = async () => {
    if (!isLoaded) return
    setError(null)
    setIsSubmitting(true)
    try {
      await signUp.create({ emailAddress, password })
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setPendingVerification(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerify = async () => {
    if (!isLoaded) return
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.replace("/dashboard")
        return
      }
      setError("Email verification is not complete yet.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify code.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Brand mark */}
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>DH</Text>
            </View>
            <View>
              <Text style={styles.brand}>Dhanvantari</Text>
              <Text style={styles.brandSub}>INVENTORY SYSTEM</Text>
            </View>
          </View>

          <Text style={styles.heading}>
            {pendingVerification ? "Verify your email" : "Create account"}
          </Text>
          <Text style={styles.subheading}>
            {pendingVerification
              ? "Enter the code we sent to your inbox."
              : "Join the same Clerk project as the web app."}
          </Text>

          {!pendingVerification ? (
            <>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmailAddress}
                placeholder="Email address"
                placeholderTextColor="#3d4f6b"
                style={styles.input}
                value={emailAddress}
              />
              <TextInput
                autoCapitalize="none"
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#3d4f6b"
                secureTextEntry
                style={[styles.input, styles.inputLast]}
                value={password}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable
                onPress={handleCreateAccount}
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Create Account</Text>
                )}
              </Pressable>
            </>
          ) : (
            <>
              <TextInput
                keyboardType="number-pad"
                onChangeText={setCode}
                placeholder="6-digit code"
                placeholderTextColor="#3d4f6b"
                style={[styles.input, styles.codeInput]}
                value={code}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable
                onPress={handleVerify}
                style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify &amp; Sign In</Text>
                )}
              </Pressable>
            </>
          )}

          <Link href="/sign-in" asChild>
            <Pressable style={styles.linkRow}>
              <Text style={styles.link}>Already have an account? </Text>
              <Text style={[styles.link, styles.linkAccent]}>Sign in</Text>
            </Pressable>
          </Link>
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
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 36,
  },
  logoBadge: {
    alignItems: "center",
    backgroundColor: "#08152c",
    borderColor: "#173665",
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  logoText: {
    color: "#eaf1ff",
    fontSize: 16,
    fontWeight: "800",
  },
  brand: {
    color: "#f8fbff",
    fontSize: 18,
    fontWeight: "700",
  },
  brandSub: {
    color: "#3d4f6b",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  heading: {
    color: "#f8fbff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subheading: {
    color: "#8f9ab2",
    fontSize: 15,
    marginBottom: 28,
    marginTop: 6,
  },
  input: {
    backgroundColor: "#060f21",
    borderColor: "#17233b",
    borderRadius: 14,
    borderWidth: 1,
    color: "#f8fbff",
    fontSize: 15,
    height: 52,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  codeInput: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 8,
    textAlign: "center",
  },
  inputLast: {
    marginBottom: 6,
  },
  primaryBtn: {
    alignItems: "center",
    backgroundColor: "#4e8cff",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    marginTop: 14,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.8,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  link: {
    color: "#8f9ab2",
    fontSize: 14,
  },
  linkAccent: {
    color: "#4e8cff",
    fontWeight: "600",
  },
  error: {
    color: "#ef5b8c",
    fontSize: 13,
    marginBottom: 8,
    marginTop: 4,
  },
})
