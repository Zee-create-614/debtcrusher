'use client'

import { SessionProvider } from 'next-auth/react'
import ConsentBanner from './ConsentBanner'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <ConsentBanner />
    </SessionProvider>
  )
}