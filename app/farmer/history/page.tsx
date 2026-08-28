import { ScanHistory } from '@/components/farmer/scan-history'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scan History · Verified Batches | Fresco',
  description: 'Audit ledger of scanned batches and confidence scores.',
}

export default function HistoryPage() {
  return <ScanHistory />
}
