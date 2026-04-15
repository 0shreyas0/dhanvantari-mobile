import { ClerkProvider } from "@clerk/clerk-expo"
import { tokenCache } from "@clerk/clerk-expo/token-cache"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()
const isEasBuild = process.env.EAS_BUILD === "1" || process.env.EAS_BUILD === "true"
const isProductionBuild = process.env.NODE_ENV === "production" || isEasBuild

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Set it locally in mobile/.env for development, or provide it as an EAS secret for production builds."
  )
}

if (isProductionBuild && publishableKey.startsWith("pk_test_")) {
  throw new Error(
    "EAS/production builds cannot use a Clerk test key. Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to a live key."
  )
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(protected)" />
      </Stack>
    </ClerkProvider>
  )
}
