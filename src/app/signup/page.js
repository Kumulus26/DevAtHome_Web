'use client'

// imports
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// page d'inscription
export default function SignUp({ isModal = false, onClose, onLoginClick }) {
  // hooks et états
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    question1_id: '',
    question2_id: '',
    answer1: '',
    answer2: '',
  })
  const [questions, setQuestions] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // récupère les questions secrètes
  useEffect(() => {
    fetch('/api/secret-questions')
      .then(res => res.json())
      .then(setQuestions)
      .catch(() => setQuestions([]))
  }, [])

  // vérifie la force du mot de passe
  function isStrongPassword(password) {
    return (
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    )
  }

  // gestion des inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  // envoie du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // validation frontend questions secrètes
    if (!formData.question1_id || !formData.question2_id || !formData.answer1 || !formData.answer2) {
      setError('Please select two different secret questions and provide answers to both.')
      setLoading(false)
      return
    }
    if (formData.question1_id === formData.question2_id) {
      setError('Secret questions must be different.')
      setLoading(false)
      return
    }

    if (!isStrongPassword(formData.password)) {
      setError(
        'Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.'
      )
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { confirmPassword, ...dataToSend } = formData
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      if (isModal) {
        onClose?.()
        onLoginClick?.()
      } else {
        router.push('/login')
      }
    } catch (err) {
      setError(err.message)
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  // gestion du clic sur le fond
  const handleBackgroundClick = (e) => {
    if (isModal && e.target === e.currentTarget) {
      onClose?.()
    }
  }

  // rendu principal
  return (
    <div 
      className={`${isModal ? '' : 'min-h-screen bg-black'} flex items-start justify-center pt-6 p-6`}
      onClick={handleBackgroundClick}
    >
      <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
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
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-white focus:ring-1 focus:ring-white transition-colors"
            />

            <div>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-white focus:ring-1 focus:ring-white transition-colors [color-scheme:dark]"
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
              <div className="text-xs text-zinc-400 mt-1">
                Password must be at least 12 characters, include uppercase, lowercase, number, and special character.
              </div>
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

            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
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

            // questions secrètes
            <div>
              <label className="block text-zinc-400 mb-1">Secret Question 1</label>
              <select
                name="question1_id"
                value={formData.question1_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-white focus:ring-1 focus:ring-white transition-colors"
              >
                <option value="">Select a question</option>
                {questions.map((q) => (
                  <option key={q.id} value={q.id}>{q.question}</option>
                ))}
              </select>
              <input
                type="text"
                name="answer1"
                placeholder="Answer"
                value={formData.answer1}
                onChange={handleChange}
                required
                className="w-full mt-2 px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Secret Question 2</label>
              <select
                name="question2_id"
                value={formData.question2_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-white focus:ring-1 focus:ring-white transition-colors"
              >
                <option value="">Select a question</option>
                {questions.map((q) => (
                  <option key={q.id} value={q.id}>{q.question}</option>
                ))}
              </select>
              <input
                type="text"
                name="answer2"
                placeholder="Answer"
                value={formData.answer2}
                onChange={handleChange}
                required
                className="w-full mt-2 px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing up...' : 'Sign up'}
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
              <span>Sign up with Google</span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-400">
              Already have an account?{' '}
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  if (isModal && onLoginClick) {
                    onClose()
                    onLoginClick()
                  } else {
                    router.push('/login')
                  }
                }}
                className="text-white hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}