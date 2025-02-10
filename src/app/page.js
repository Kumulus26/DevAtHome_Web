'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import Login from './login/page'
import SignUp from './signup/page'
import Settings from './settings/page'
import Navbar from '@/components/Navbar'

export default function Home() {
  const [showLogin, setShowLogin] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user')
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser))
    }
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

  return (
    <>
      <div className={`min-h-screen relative overflow-hidden ${
        showLogin || showSignUp || showSettings ? 'blur-sm transition-all duration-200' : ''
      }`}>
        {/* Diagonal split background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-white"></div>
          <div 
            className="absolute bg-black" 
            style={{
              top: '0',
              right: '0',
              bottom: '0',
              left: '55%',
              transform: 'skew(-12deg)',
              transformOrigin: 'top'
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative">
          <Navbar 
            onLoginClick={handleLoginClick}
            onSettingsClick={handleSettingsClick}
          />

          {/* Main Content */}
          <main className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-2 gap-12">
              {/* Left Column */}
              <div className="space-y-8">
                <h1 className="text-6xl font-bold leading-tight text-black">
                  Your 
                  <span className="text-black"> Black </span> 
                  <span className="relative z-10">& </span>
                  <span className="text-white" style={{ WebkitTextStroke: "1.5px black" }}>
                      White </span>                
                    <span className="text-black">films deserve the best 🎞️</span>
                </h1>
                <p className="text-xl text-gray-800">
                  The development at home will no longer be a secret for you.
                </p>
                
                {/* Stats Section */}
                <div className="flex space-x-8 mt-16">
                  <div className="bg-black text-white p-8 rounded-lg backdrop-blur-sm bg-opacity-90">
                    <div className="text-4xl font-bold">+26 recipes</div>
                    <div className="mt-2 text-sm">
                      You will find the one that fits your style.
                    </div>
                  </div>
                  
                  <div className="bg-white p-8 rounded-lg shadow-lg backdrop-blur-sm bg-opacity-90">
                    <div className="text-4xl font-bold text-gray-900">100%</div>
                    <div className="mt-2 text-gray-800">An active community</div>
                    <div className="flex items-center mt-4 space-x-2">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                        <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                        <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                        <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-white flex items-center justify-center text-xs text-white">
                          +2
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

      {/* Settings Modal */}
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

      {/* Login Modal */}
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

      {/* SignUp Modal */}
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
    </>
  )
}
