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
    backgroundColor: "#061024",
    borderColor: "#1a2740",
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  title: {
    color: "#f8fbff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  body: {
    color: "#8f9ab2",
    fontSize: 15,
    lineHeight: 22,
  },
})
