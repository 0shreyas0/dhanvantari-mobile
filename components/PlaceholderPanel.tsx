import { StyleSheet, Text, View } from "react-native"

type PlaceholderPanelProps = {
  title: string
  body: string
}

export function PlaceholderPanel({ title, body }: PlaceholderPanelProps) {
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#ffffff",
    borderColor: "#ddd7cb",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  title: {
    color: "#1d2a22",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  body: {
    color: "#5d655f",
    fontSize: 15,
    lineHeight: 22,
  },
})
