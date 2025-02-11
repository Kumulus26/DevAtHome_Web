'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function Navbar({ onLoginClick, onSettingsClick }) {
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const checkUser = () => {
      try {
        const loggedInUser = localStorage.getItem('user')
        if (loggedInUser) {
          const parsedUser = JSON.parse(loggedInUser)
          if (parsedUser && typeof parsedUser === 'object') {
            setUser(parsedUser)
          } else {
            // Invalid user data, clear it
            localStorage.removeItem('user')
            setUser(null)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        // Clear invalid data
        localStorage.removeItem('user')
        setUser(null)
      }
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    checkUser()
    window.addEventListener('storage', checkUser)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('storage', checkUser)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    try {
      localStorage.removeItem('user')
      setUser(null)
      setShowDropdown(false)
      window.location.reload()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown)
  }

  return (
    <nav className="relative flex justify-between items-center p-4 sm:p-6">
      <Link href="/" className="flex items-center space-x-2 sm:space-x-4">
        <div className="w-8 h-8 sm:w-12 sm:h-12">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="33" cy="33" r="30" className="stroke-black fill-none"/>
            <circle cx="67" cy="33" r="30" className="stroke-black fill-none"/>
            <circle cx="50" cy="67" r="30" className="stroke-black fill-none"/>
          </svg>
        </div>
        <h1 className="text-2xl sm:text-4xl font-oswald text-black">DevAtHome</h1>
      </Link>
      
      {/* Desktop Menu */}
      <div className="hidden sm:flex items-center space-x-8">
        <Link href="/tableau" className="text-white hover:text-gray-600 mix-blend-difference">
          Table
        </Link>
        <Link href="/about" className="text-white hover:text-gray-600 mix-blend-difference">
          About
        </Link>
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={toggleDropdown}
              className="text-black bg-white px-4 sm:px-6 py-2 rounded-full hover:bg-gray-100 transition-colors text-sm sm:text-base"
            >
              Welcome back, {user.username || user.firstName}
            </button>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
                <Link
                  href={`/profile/${user.username}`}
                  onClick={() => setShowDropdown(false)}
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>Profile</span>
                </Link>
                
                <button 
                  onClick={() => {
                    setShowDropdown(false)
                    router.push('/feed')
                  }}
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span>Feed</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowDropdown(false)
                    onSettingsClick()
                  }}
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <span>Settings</span>
                </button>

                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  <span>Disconnect</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={onLoginClick}
            className="bg-white text-black px-4 sm:px-6 py-2 rounded-full hover:bg-black hover:text-white hover:border hover:border-white transition-colors"
          >
            Sign in
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="sm:hidden text-black p-2"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          {showMobileMenu ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="absolute top-full left-0 right-0 bg-white shadow-lg py-4 px-4 sm:hidden z-50">
          <div className="flex flex-col space-y-4">
            <Link 
              href="/tableau" 
              className="text-black hover:text-gray-600 py-2"
              onClick={() => setShowMobileMenu(false)}
            >
              Table
            </Link>
            <Link 
              href="/about" 
              className="text-black hover:text-gray-600 py-2"
              onClick={() => setShowMobileMenu(false)}
            >
              About
            </Link>
            {user ? (
              <>
                <Link
                  href={`/profile/${user.username}`}
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center space-x-2 text-black hover:text-gray-600 py-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>Profile</span>
                </Link>
                <Link
                  href="/feed"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center space-x-2 text-black hover:text-gray-600 py-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                  <span>Feed</span>
                </Link>
                <button
                  onClick={() => {
                    setShowMobileMenu(false)
                    onSettingsClick()
                  }}
                  className="flex items-center space-x-2 text-black hover:text-gray-600 py-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <span>Settings</span>
                </button>
                <button 
                  onClick={() => {
                    handleLogout()
                    setShowMobileMenu(false)
                  }}
                  className="flex items-center space-x-2 text-red-500 hover:text-red-600 py-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  <span>Disconnect</span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => {
                  onLoginClick()
                  setShowMobileMenu(false)
                }}
                className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
} 