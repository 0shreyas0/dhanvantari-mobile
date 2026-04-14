import { ReactNode } from "react"
import { StyleSheet, Text, View } from "react-native"

type InfoCardProps = {
  title: string
  children: ReactNode
}

export function InfoCard({ title, children }: InfoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#ddd7cb",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  title: {
    color: "#1d2a22",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
})
