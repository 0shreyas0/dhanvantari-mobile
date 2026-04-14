import { AppShell } from "@/components/AppShell"
import { PlaceholderPanel } from "@/components/PlaceholderPanel"

export default function SettingsScreen() {
  return (
    <AppShell
      title="Settings"
      subtitle="Configure your store identity and expiry thresholds."
    >
      <PlaceholderPanel
        title="Settings route scaffolded"
        body="This route is intentionally minimal. It preserves the screen name and flow, and can be extended with the existing `/api/settings` endpoint without changing the mobile shell."
      />
    </AppShell>
  )
}
