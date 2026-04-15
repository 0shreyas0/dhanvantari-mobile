import { useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import {
  DEFAULT_EXPIRY_SETTINGS,
  getExpiryStatus,
  type ExpiryColor,
  type ExpirySettings,
} from "@/lib/expiry"

type ExpiryBadgeProps = {
  expiryDate: string | Date
  settings?: ExpirySettings
}

export function ExpiryBadge({
  expiryDate,
  settings = DEFAULT_EXPIRY_SETTINGS,
}: ExpiryBadgeProps) {
  const [isVisible, setIsVisible] = useState(false)
  const date = new Date(expiryDate)
  const status = getExpiryStatus(date, settings)
  const shortLabel = useMemo(
    () =>
      status.label
        .replace("Expires in ", "")
        .replace(" day", "d")
        .replace("s", "")
        .replace("OK", "SAFE"),
    [status.label]
  )

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Expiry ${date.toLocaleDateString("en-CA")}, status ${shortLabel}`}
      accessibilityState={{ expanded: isVisible }}
      onPress={() => setIsVisible((current) => !current)}
      style={styles.container}
    >
      <View style={[styles.datePill, isVisible && styles.datePillActive]}>
        <Text style={[styles.dateText, status.color === "gray" && styles.dateTextExpired]}>
          {date.toLocaleDateString("en-CA")}
        </Text>
      </View>
      {isVisible ? (
        <View style={[styles.statusPill, statusStyles(status.color)]}>
          <Text style={[styles.statusText, textStyles(status.color)]}>{shortLabel}</Text>
        </View>
      ) : null}
    </Pressable>
  )
}

function statusStyles(color: ExpiryColor) {
  switch (color) {
    case "green":
      return { backgroundColor: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.35)" }
    case "yellow":
      return { backgroundColor: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.35)" }
    case "orange":
      return { backgroundColor: "rgba(249,115,22,0.12)", borderColor: "rgba(249,115,22,0.35)" }
    case "red":
      return { backgroundColor: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.35)" }
    default:
      return { backgroundColor: "rgba(148,163,184,0.10)", borderColor: "rgba(148,163,184,0.25)" }
  }
}

function textStyles(color: ExpiryColor) {
  switch (color) {
    case "green":
      return { color: "#31d07f" }
    case "yellow":
      return { color: "#fbbf24" }
    case "orange":
      return { color: "#fb923c" }
    case "red":
      return { color: "#f87171" }
    default:
      return { color: "#94a3b8" }
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  datePill: {
    backgroundColor: "rgba(148,163,184,0.06)",
    borderColor: "rgba(148,163,184,0.2)",
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 32,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  datePillActive: {
    backgroundColor: "rgba(148,163,184,0.12)",
  },
  dateText: {
    color: "rgba(248,251,255,0.78)",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    fontWeight: "700",
  },
  dateTextExpired: {
    color: "rgba(148,163,184,0.7)",
    textDecorationLine: "line-through",
  },
  statusPill: {
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
})
