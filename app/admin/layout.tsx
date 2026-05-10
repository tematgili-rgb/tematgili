import type { Metadata } from 'next'
import AdminLayout from './AdminLayout'

export const metadata: Metadata = {
  title: 'אדמין | תמתגילי',
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}
