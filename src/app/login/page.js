'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Login({ isModal = false, onClose, onSignUpClick }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/seconnecter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data))

      // Trigger a page reload to update the navbar
      if (isModal) {
        onClose?.()
        window.location.reload()
      } else {
        router.push('/')
        window.location.reload()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBackgroundClick = (e) => {
    if (isModal && e.target === e.currentTarget) {
      onClose?.()
    }
  }

  return (
    <div 
      className={`${isModal ? '' : 'min-h-screen bg-black'} flex items-start justify-center pt-24 p-6`}
      onClick={handleBackgroundClick}
    >
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {/* Login Form Container */}
        <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
          {/* Logo and Title - Moved inside */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="33" cy="33" r="30" className="stroke-white fill-none"/>
                <circle cx="67" cy="33" r="30" className="stroke-white fill-none"/>
                <circle cx="50" cy="67" r="30" className="stroke-white fill-none"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">DevAtHome</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
            </div>

            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zinc-900 text-zinc-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors text-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#FFF" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-8 text-center">
            <p className="text-zinc-400">
              Don't have an account?{' '}
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  if (isModal && onSignUpClick) {
                    onClose()
                    onSignUpClick()
                  } else {
                    router.push('/signup')
                  }
                }}
                className="text-white hover:underline"
              >
                Sign up, it's free!
              </button>
            </p>
          </div>
        </div>

        {/* Footer - Only show when not in modal mode */}
        {!isModal && (
          <div className="mt-12 text-center">
            <p className="text-zinc-400">
              Join over <span className="text-white font-semibold">2M</span> global social media users
            </p>
            <div className="flex justify-center -space-x-2 mt-4">
              <div className="w-8 h-8 rounded-full border-2 border-black bg-zinc-300"></div>
              <div className="w-8 h-8 rounded-full border-2 border-black bg-zinc-400"></div>
              <div className="w-8 h-8 rounded-full border-2 border-black bg-zinc-500"></div>
              <div className="w-8 h-8 rounded-full border-2 border-black bg-zinc-600"></div>
              <div className="w-8 h-8 rounded-full border-2 border-black bg-zinc-700"></div>
              <div className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-xs text-white">
                +2
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
