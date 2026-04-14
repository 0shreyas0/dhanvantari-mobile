import { useAuth } from "@clerk/clerk-expo"
import { Redirect } from "expo-router"
import { ActivityIndicator, View } from "react-native"

export default function IndexPage() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <View
        style={{
          alignItems: "center",
          backgroundColor: "#f5f1e8",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#2f5d44" />
      </View>
    )
  }

  return <Redirect href={isSignedIn ? "/dashboard" : "/sign-in"} />
}
