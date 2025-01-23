'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Navbar({ onLoginClick }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const checkUser = () => {
      const loggedInUser = localStorage.getItem('user')
      if (loggedInUser) {
        setUser(JSON.parse(loggedInUser))
      } else {
        setUser(null)
      }
    }

    checkUser()
    window.addEventListener('storage', checkUser)

    return () => {
      window.removeEventListener('storage', checkUser)
    }
  }, [])

  return (
    <nav className="flex justify-between items-center p-6">
      <Link href="/" className="flex items-center space-x-4">
        <div className="w-12 h-12">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="33" cy="33" r="30" className="stroke-black fill-none"/>
            <circle cx="67" cy="33" r="30" className="stroke-black fill-none"/>
            <circle cx="50" cy="67" r="30" className="stroke-black fill-none"/>
          </svg>
        </div>
        <h1 className="text-4xl font-oswald text-black">DevAtHome</h1>
      </Link>
      
      <div className="flex items-center space-x-8">
        <Link href="/tableau" className="text-white hover:text-gray-600 mix-blend-difference">
          Tableau
        </Link>
        <Link href="/profile" className="text-white hover:text-gray-600 mix-blend-difference">
          Actualité
        </Link>
        <Link href="/contact" className="text-white hover:text-gray-600 mix-blend-difference">
          À propos
        </Link>
        {user ? (
          <div className="text-black bg-white px-6 py-2 rounded-full">
            Welcome back, {user.firstName}
          </div>
        ) : (
          <button 
            onClick={onLoginClick}
            className="bg-white text-black px-6 py-2 rounded-full hover:bg-black hover:text-white hover:border hover:border-white transition-colors"
          >
            Se connecter
          </button>
        )}
      </div>
    </nav>
  )
} 