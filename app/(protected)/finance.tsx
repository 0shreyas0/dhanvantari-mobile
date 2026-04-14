import { AppShell } from "@/components/AppShell"
import { PlaceholderPanel } from "@/components/PlaceholderPanel"

export default function FinanceScreen() {
  return (
    <AppShell
      title="Finance"
      subtitle="Track your sales history, revenue, and customer invoices."
    >
      <PlaceholderPanel
        title="Finance route scaffolded"
        body="This route mirrors the web information architecture and is ready for the same `/api/finance` integration pattern used in the wired screens."
      />
    </AppShell>
  )
}
