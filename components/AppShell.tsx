import { Link, usePathname } from "expo-router"
import { ReactNode } from "react"
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useClerk, useUser } from "@clerk/clerk-expo"

const navItems = [
  { href: "/dashboard" as const, label: "Dashboard" },
  { href: "/products" as const, label: "Products" },
  { href: "/billing" as const, label: "Billing" },
  { href: "/finance" as const, label: "Finance" },
  { href: "/settings" as const, label: "Settings" },
]

type AppShellProps = {
  title: string
  subtitle: string
  children: ReactNode
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const { user } = useUser()

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Dhanvantari</Text>
            <Text style={styles.brandSubhead}>Inventory System</Text>
          </View>
          <Pressable onPress={() => signOut()} style={styles.signOutButton}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navRow}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} asChild>
                <Pressable style={[styles.navItem, isActive && styles.navItemActive]}>
                  <Text style={[styles.navText, isActive && styles.navTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              </Link>
            )
          })}
        </ScrollView>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {user?.primaryEmailAddress?.emailAddress ? (
            <Text style={styles.userEmail}>{user.primaryEmailAddress.emailAddress}</Text>
          ) : null}
        </View>

        <View style={styles.content}>{children}</View>
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
    backgroundColor: "#f5f1e8",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingTop: 8,
  },
  brand: {
    color: "#1d2a22",
    fontSize: 24,
    fontWeight: "700",
  },
  brandSubhead: {
    color: "#6c746d",
    fontSize: 11,
    letterSpacing: 0.8,
    marginTop: 2,
    textTransform: "uppercase",
  },
  signOutButton: {
    backgroundColor: "#ffffff",
    borderColor: "#d8d3c8",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  signOutText: {
    color: "#1d2a22",
    fontSize: 13,
    fontWeight: "600",
  },
  navRow: {
    gap: 10,
    paddingBottom: 8,
  },
  navItem: {
    backgroundColor: "#ffffff",
    borderColor: "#d8d3c8",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  navItemActive: {
    backgroundColor: "#dce9d7",
    borderColor: "#96b18a",
  },
  navText: {
    color: "#5d655f",
    fontSize: 14,
    fontWeight: "600",
  },
  navTextActive: {
    color: "#1d2a22",
  },
  titleBlock: {
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    color: "#1d2a22",
    fontSize: 30,
    fontWeight: "700",
  },
  subtitle: {
    color: "#5d655f",
    fontSize: 15,
    marginTop: 4,
  },
  userEmail: {
    color: "#7d847d",
    fontSize: 13,
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
})
