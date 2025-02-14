'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

export default function Navbar({ onLoginClick, onSettingsClick, isDarkMode, onThemeToggle }) {
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
    <nav className={`relative flex justify-between items-center p-4 sm:p-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>
      {/* Left side - Logo and Title */}
      <Link href="/" className="flex items-center space-x-2 sm:space-x-4 group">
        <div className="w-8 h-8 sm:w-12 sm:h-12 transform transition-transform group-hover:rotate-180 duration-500">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle 
              cx="33" 
              cy="33" 
              r="30" 
              className={`stroke-current ${isDarkMode ? 'stroke-white' : 'stroke-black'} fill-none transition-all duration-500 group-hover:fill-current`}
            />
            <circle 
              cx="67" 
              cy="33" 
              r="30" 
              className={`stroke-current ${isDarkMode ? 'stroke-white' : 'stroke-black'} fill-none transition-all duration-500 group-hover:fill-current`}
            />
            <circle 
              cx="50" 
              cy="67" 
              r="30" 
              className={`stroke-current ${isDarkMode ? 'stroke-white' : 'stroke-black'} fill-none transition-all duration-500 group-hover:fill-current`}
            />
          </svg>
        </div>
        <h1 className={`text-2xl sm:text-4xl font-oswald ${isDarkMode ? 'text-white' : 'text-black'}`}>
          DevAtHome
        </h1>
      </Link>

      {/* Right side - Navigation and Actions */}
      <div className="flex items-center space-x-6">
        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center space-x-8">
          <Link href="/tableau" className={`${isDarkMode ? 'text-white' : 'text-black'} hover:text-gray-400 transition-colors`}>
            Table
          </Link>
          <Link href="/about" className={`${isDarkMode ? 'text-white' : 'text-black'} hover:text-gray-400 transition-colors`}>
            About
          </Link>
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={toggleDropdown}
                className={`${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'} 
                  px-4 sm:px-6 py-2 rounded-full hover:opacity-80 transition-colors text-sm sm:text-base`}
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
              className={`${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'} 
                px-4 sm:px-6 py-2 rounded-full hover:opacity-80 transition-colors`}
            >
              Sign in
            </button>
          )}
          
          {/* Theme toggle button */}
          <button
            onClick={onThemeToggle}
            className={`p-2 rounded-full ${
              isDarkMode ? 'bg-white text-black' : 'bg-black text-white'
            } transition-all duration-200 hover:scale-110 transform`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className={`sm:hidden ${isDarkMode ? 'text-white' : 'text-black'}`}
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
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-black/90' : 'bg-white/90'} backdrop-blur-sm`}>
          <div className={`fixed inset-y-0 right-0 w-80 ${
            isDarkMode ? 'bg-black' : 'bg-white'
          } p-8 shadow-2xl`}>
            {/* Menu Header */}
            <div className="flex justify-between items-center mb-12">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-8 h-8 transform transition-transform group-hover:rotate-180 duration-500">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle 
                      cx="33" 
                      cy="33" 
                      r="30" 
                      className={`stroke-current ${isDarkMode ? 'stroke-white' : 'stroke-black'} fill-none`}
                    />
                    <circle 
                      cx="67" 
                      cy="33" 
                      r="30" 
                      className={`stroke-current ${isDarkMode ? 'stroke-white' : 'stroke-black'} fill-none`}
                    />
                    <circle 
                      cx="50" 
                      cy="67" 
                      r="30" 
                      className={`stroke-current ${isDarkMode ? 'stroke-white' : 'stroke-black'} fill-none`}
                    />
                  </svg>
                </div>
              </Link>
              <button
                onClick={() => setShowMobileMenu(false)}
                className={`p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/10'
                }`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Profile Link - Moved here, only show if user is logged in */}
            {user && (
              <div className="mb-4">
                <Link
                  href={`/profile/${user.username}`}
                  className={`w-full py-3 px-4 rounded-xl border ${
                    isDarkMode 
                      ? 'border-white/20 hover:bg-white/10' 
                      : 'border-black/20 hover:bg-black/10'
                  } transition-colors flex items-center space-x-3`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <span className="text-gray-600 text-sm">
                          {user.username[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <span>{user.username}</span>
                </Link>
              </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-2">
              {[
                { href: '/tableau', label: 'Table' },
                { href: '/about', label: 'About' },
                { href: '/feed', label: 'Feed' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`block px-4 py-3 rounded-xl border ${
                    isDarkMode 
                      ? 'border-white/20 hover:bg-white/10' 
                      : 'border-black/20 hover:bg-black/10'
                  } transition-colors`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="absolute bottom-8 left-8 right-8 space-y-2">
              {/* Theme Toggle */}
              <button
                onClick={onThemeToggle}
                className={`w-full p-4 rounded-xl border ${
                  isDarkMode 
                    ? 'border-white/20 hover:bg-white/10' 
                    : 'border-black/20 hover:bg-black/10'
                } transition-colors flex items-center justify-between`}
              >
                <span className={`text-sm font-medium`}>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* Login/Logout Button */}
              {user ? (
                <button
                  onClick={() => {
                    handleLogout()
                    setShowMobileMenu(false)
                  }}
                  className={`w-full py-3 px-4 rounded-xl transition-colors ${
                    isDarkMode 
                      ? 'bg-white text-black hover:bg-gray-200' 
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  Log out
                </button>
              ) : (
                <button
                  onClick={() => {
                    onLoginClick()
                    setShowMobileMenu(false)
                  }}
                  className={`w-full py-3 px-4 rounded-xl transition-colors ${
                    isDarkMode 
                      ? 'bg-white text-black hover:bg-gray-200' 
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
} 