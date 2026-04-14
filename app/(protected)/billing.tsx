import { AppShell } from "@/components/AppShell"
import { PlaceholderPanel } from "@/components/PlaceholderPanel"

export default function BillingScreen() {
  return (
    <AppShell title="Billing" subtitle="Search products, build a bill, and process checkout.">
      <PlaceholderPanel
        title="Billing route scaffolded"
        body="The route and app shell match the web flow. This screen is intentionally left minimal for now because the brief asked for one fully wired screen only."
      />
    </AppShell>
  )
}
