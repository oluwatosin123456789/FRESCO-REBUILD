import { notFound } from 'next/navigation'
import { RunwayPreview } from '@/components/landing/runway-preview'

/**
 * Development-only preview of the 3D runway. Returns a 404 in production builds, so it never
 * reaches a deployed site.
 */
export default function RunwayPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <RunwayPreview />
}
