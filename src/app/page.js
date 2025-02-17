'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Login from './login/page'
import SignUp from './signup/page'
import Settings from './settings/page'
import Navbar from '@/components/Navbar'
import { X } from 'lucide-react'
import { TableIcon, InfoIcon, UserIcon, GridIcon, Settings as SettingsIcon, LogOut } from 'lucide-react'

export default function Home() {
  const [showLogin, setShowLogin] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [user, setUser] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user')
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser))
    }
    // Check localStorage for theme preference
    const savedTheme = localStorage.getItem('theme')
    setIsDarkMode(savedTheme === 'dark' || savedTheme === null) // Default to dark mode
  }, [])

  const handleLoginClick = () => {
    setShowSignUp(false)
    setShowLogin(true)
  }

  const handleSignUpClick = () => {
    setShowLogin(false)
    setShowSignUp(true)
  }

  const handleSettingsClick = () => {
    setShowSettings(true)
  }

  const handleCloseModals = () => {
    setShowLogin(false)
    setShowSignUp(false)
    setShowSettings(false)
  }

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  return (
    <>
      <div className={`min-h-screen relative overflow-hidden ${
        showLogin || showSignUp || showSettings ? 'blur-sm transition-all duration-200' : ''
      } ${isDarkMode ? 'text-white' : 'text-black'}`}>
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
          <div 
            className={`absolute inset-0 ${
              isDarkMode 
                ? 'bg-black bg-[radial-gradient(circle_at_center,white_3px,transparent_2px)]' 
                : 'bg-white bg-[radial-gradient(circle_at_center,black_3px,transparent_2px)]'
            } bg-[size:32px_32px]`}
          ></div>
        </div>

        <div className="relative">
          <Navbar 
            onLoginClick={handleLoginClick}
            onSettingsClick={handleSettingsClick}
            isDarkMode={isDarkMode}
            onThemeToggle={toggleTheme}
          />

          <main className="container mx-auto px-6 py-12">
            <div className={`relative rounded-3xl overflow-hidden ${
              isDarkMode ? 'bg-white/5' : 'bg-black/5'
            } backdrop-blur-sm p-8 lg:p-12`}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8 relative z-10">
                  <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    Your 
                    <span> Black </span> 
                    <span className="relative z-10">& </span>
                    <span className="text-white" 
                      style={{ 
                        WebkitTextStroke: isDarkMode ? "1.5px white" : "1.5px black",
                        textShadow: isDarkMode ? "0 0 1px black" : "none"
                      }}>
                      White
                    </span>                
                    <span> films deserve the best 🎞️</span>
                  </h1>
                  <p className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    The development at home will no longer be a secret for you.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-8 sm:mt-16">
                    <div className={`${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'} 
                      w-full sm:w-auto p-6 sm:p-8 rounded-2xl backdrop-blur-sm transform transition-all duration-300 hover:scale-105 
                      border ${isDarkMode ? 'border-white/20' : 'border-black/20'}`}>
                      <div className="text-3xl sm:text-4xl font-bold">
                        +26 recipes
                      </div>
                      <div className="mt-2 text-sm">
                        You will find the one that fits your style.
                      </div>
                    </div>
                    
                    <div className={`${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'} 
                      w-full sm:w-auto p-6 sm:p-8 rounded-2xl backdrop-blur-sm transform transition-all duration-300 hover:scale-105
                      border ${isDarkMode ? 'border-black/20' : 'border-white/20'}`}>
                      <div className="text-3xl sm:text-4xl font-bold">
                        100%
                      </div>
                      <div className="mt-2">
                        An active community
                      </div>
                      <div className="flex items-center mt-4 space-x-2">
                        <div className="flex -space-x-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 
                              border-2 ${isDarkMode ? 'border-black/20' : 'border-white/20'}`}></div>
                          ))}
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 
                            border-2 ${isDarkMode ? 'border-black/20' : 'border-white/20'} 
                            flex items-center justify-center text-xs text-white`}>
                            +2
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {showSettings && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleCloseModals}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative"
          >
            <Settings 
              isModal={true}
              onClose={handleCloseModals}
            />
          </div>
        </div>
      )}

      {showLogin && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center"
          onClick={() => handleCloseModals()}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Login 
              isModal={true} 
              onClose={handleCloseModals}
              onSignUpClick={handleSignUpClick}
            />
          </div>
        </div>
      )}

      {showSignUp && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center"
          onClick={() => handleCloseModals()}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <SignUp 
              isModal={true} 
              onClose={handleCloseModals}
              onLoginClick={handleLoginClick}
            />
          </div>
        </div>
      )}

      <div className={`fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-all duration-300 ${
        isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`fixed inset-y-0 left-0 w-72 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} p-6 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex justify-between items-center mb-10">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.svg" alt="DevAtHome Logo" width={32} height={32} />
              <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                DevAtHome
              </span>
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isDarkMode 
                  ? 'hover:bg-white/10 text-white' 
                  : 'hover:bg-black/10 text-black'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="space-y-2 flex flex-col items-center mt-10">
            {[
              { href: '/table', icon: TableIcon, label: 'Table' },
              { href: '/about', icon: InfoIcon, label: 'About' },
              { href: '/profile', icon: UserIcon, label: 'Profile' },
              { href: '/feed', icon: GridIcon, label: 'Feed' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-center w-48 p-3 rounded-xl transition-all duration-200 ${
                  isDarkMode
                    ? 'text-white hover:bg-white/10'
                    : 'text-black hover:bg-black/5'
                }`}
              >
                <item.icon className={`w-5 h-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <span className="font-medium ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className={`my-6 border-t ${
            isDarkMode ? 'border-white/10' : 'border-black/10'
          }`} />

          <div className="space-y-2 flex flex-col items-center">
            {[
              { icon: SettingsIcon, label: 'Settings' },
              { icon: LogOut, label: 'Disconnect', danger: true }
            ].map((item) => (
              <button
                key={item.label}
                className={`flex items-center justify-center w-48 p-3 rounded-xl transition-all duration-200 ${
                  isDarkMode
                    ? item.danger 
                      ? 'text-red-400 hover:bg-red-400/10' 
                      : 'text-white hover:bg-white/10'
                    : item.danger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-black hover:bg-black/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium ml-3">{item.label}</span>
              </button>
            ))}
          </div>
          <div className={`absolute bottom-6 left-0 right-0 text-sm text-center ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Version 1.0.0
          </div>
        </div>
      </div>
    </>
  )
}
