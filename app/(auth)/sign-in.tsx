import { Link, useRouter } from "expo-router"
import { useSignIn } from "@clerk/clerk-expo"
import { useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()
  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!isLoaded) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      })

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.brand}>Dhanvantari</Text>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Use the same Clerk account as the web app.</Text>

        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmailAddress}
          placeholder="Email"
          placeholderTextColor="#8c8d88"
          style={styles.input}
          value={emailAddress}
        />

        <TextInput
          autoCapitalize="none"
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#8c8d88"
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable onPress={handleSubmit} style={styles.button} disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </Pressable>

        <Link href="/sign-up" style={styles.link}>
          Create an account
        </Link>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f1e8",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  brand: {
    color: "#2f5d44",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  title: {
    color: "#1d2a22",
    fontSize: 30,
    fontWeight: "700",
  },
  subtitle: {
    color: "#5d655f",
    fontSize: 15,
    marginBottom: 24,
    marginTop: 6,
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#d8d3c8",
    borderRadius: 14,
    borderWidth: 1,
    color: "#1d2a22",
    fontSize: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#2f5d44",
    borderRadius: 14,
    marginTop: 4,
    paddingVertical: 14,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  link: {
    color: "#2f5d44",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 18,
    textAlign: "center",
  },
  error: {
    color: "#a13b2f",
    marginBottom: 12,
  },
})
