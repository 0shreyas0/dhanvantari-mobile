import type { ReactNode } from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

type AppShellProps = {
  title: string
  subtitle: string
  children: ReactNode
  headerRight?: ReactNode
}

export function AppShell({ title, subtitle, children, headerRight }: AppShellProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            {headerRight && <View style={styles.headerRightContainer}>{headerRight}</View>}
          </View>
        </View>
        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#030817",
    flex: 1,
  },
  container: {
    backgroundColor: "#030817",
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
  },
  headerRightContainer: {
    paddingLeft: 12,
    justifyContent: "center",
  },
  title: {
    color: "#f8fbff",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: "#8f9ab2",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
})
