'use client'

import { useSession } from 'next-auth/react'

export default function AuthNavLink() {
  const { data: session } = useSession()
  
  if (!session?.user) {
    return null
  }
  
  return (
    <a 
      href="/account" 
      className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
    >
      My Dashboard
    </a>
  )
}