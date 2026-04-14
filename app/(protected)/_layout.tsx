import { useAuth } from "@clerk/clerk-expo"
import { Ionicons } from "@expo/vector-icons"
import { Redirect, Tabs } from "expo-router"

type IoniconName = React.ComponentProps<typeof Ionicons>["name"]

function tabIcon(active: IoniconName, inactive: IoniconName) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? active : inactive} size={23} color={color} />
  )
}

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return null
  if (!isSignedIn) return <Redirect href="/sign-in" />

  return (
    <Tabs
      backBehavior="initialRoute"
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "#030817" },
        tabBarActiveTintColor: "#4e8cff",
        tabBarInactiveTintColor: "#374a6a",
        tabBarStyle: {
          backgroundColor: "#060f21",
          borderTopColor: "#17233b",
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 6,
          height: 68,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: tabIcon("grid", "grid-outline"),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          tabBarIcon: tabIcon("bar-chart", "bar-chart-outline"),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: tabIcon("cube", "cube-outline"),
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: "Billing",
          tabBarIcon: tabIcon("receipt", "receipt-outline"),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: tabIcon("settings", "settings-outline"),
        }}
      />
    </Tabs>
  )
}
