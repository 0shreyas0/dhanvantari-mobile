import { useAuth } from "@clerk/clerk-expo"
import { Redirect, Stack } from "expo-router"

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return null
  }

  if (isSignedIn) {
    return <Redirect href="/dashboard" />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
