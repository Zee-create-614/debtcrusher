'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState } from 'react'
import { User, ChevronDown, Settings, LogOut } from 'lucide-react'

export default function AuthButton() {
  const { data: session, status } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  if (status === 'loading') {
    return (
      <div className="bg-gray-700 px-3 py-2 rounded-lg animate-pulse">
        <div className="w-16 h-4 bg-gray-600 rounded"></div>
      </div>
    )
  }

  if (session?.user) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
        >
          <User size={18} />
          <span className="text-sm max-w-32 truncate">
            {session.user.email}
          </span>
          <ChevronDown size={14} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsDropdownOpen(false)}
            ></div>
            <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-20 min-w-48">
              <a
                href="/account"
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-700 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <Settings size={16} />
                Account
              </a>
              <button
                onClick={() => {
                  setIsDropdownOpen(false)
                  signOut()
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-700 transition-colors text-left"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn()}
      className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      Sign In
    </button>
  )
}