import { useSSO, useSignIn } from "@clerk/clerk-expo"
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

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const { startSSOFlow } = useSSO()
  const router = useRouter()
  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!isLoaded) return
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await signIn.create({ identifier: emailAddress, password })
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        router.replace("/dashboard")
        return
      }
      setError("This sign-in flow needs an additional verification step.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true)
    setError(null)
    try {
      const { createdSessionId, setActive: activateSession } = await startSSOFlow({
        strategy: "oauth_google",
      })
      if (createdSessionId) {
        await activateSession?.({ session: createdSessionId })
        router.replace("/dashboard")
        return
      }
      setError("Google sign-in did not complete.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in with Google.")
    } finally {
      setIsGoogleSubmitting(false)
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

          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Sign in to your pharmacy account.</Text>

          {/* Google SSO */}
          <Pressable
            onPress={handleGoogleSignIn}
            style={({ pressed }) => [styles.googleBtn, pressed && styles.pressed]}
            disabled={isGoogleSubmitting}
          >
            {isGoogleSubmitting ? (
              <ActivityIndicator color="#f8fbff" />
            ) : (
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email + password */}
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
            onPress={handleSubmit}
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryBtnText}>Sign In</Text>
            )}
          </Pressable>

          <Link href="/sign-up" asChild>
            <Pressable style={styles.linkRow}>
              <Text style={styles.link}>Don't have an account? </Text>
              <Text style={[styles.link, styles.linkAccent]}>Sign up</Text>
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
  googleBtn: {
    alignItems: "center",
    backgroundColor: "#0b1731",
    borderColor: "#1a2740",
    borderRadius: 14,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    marginBottom: 20,
  },
  googleBtnText: {
    color: "#f8fbff",
    fontSize: 15,
    fontWeight: "600",
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: {
    backgroundColor: "#17233b",
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: "#3d4f6b",
    fontSize: 13,
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
    textAlign: "center",
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
