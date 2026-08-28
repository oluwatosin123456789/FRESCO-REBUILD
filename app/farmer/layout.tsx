import { FarmerRouteShell } from '@/components/farmer/farmer-route-shell'

export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <FarmerRouteShell>{children}</FarmerRouteShell>
}