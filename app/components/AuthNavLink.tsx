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
      className="bg-crusher-blue hover:bg-crusher-blue-dark text-white px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105"
    >
      ⚡ My Dashboard
    </a>
  )
}
