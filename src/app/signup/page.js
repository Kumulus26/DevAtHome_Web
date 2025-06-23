'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function SignUp({ isModal = false, onClose, onLoginClick }) {
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

  useEffect(() => {
    fetch('/api/secret-questions')
      .then(res => res.json())
      .then(setQuestions)
      .catch(() => setQuestions([]))
  }, [])

  function isStrongPassword(password) {
    return (
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Frontend validation for secret questions
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

  const handleBackgroundClick = (e) => {
    if (isModal && e.target === e.currentTarget) {
      onClose?.()
    }
  }

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

            {/* Secret Questions */}
            <div>
              <label className="block text-zinc-400 mb-1">Secret Question 1</label>
              <select
                name="question1_id"
                value={formData.question1_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white mb-2"
              >
                <option value="">Select a question</option>
                {questions.map(q => (
                  <option
                    key={q.id}
                    value={q.id}
                    disabled={formData.question2_id && q.id === Number(formData.question2_id)}
                  >
                    {q.question}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="answer1"
                placeholder="Answer to question 1"
                value={formData.answer1}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 mb-4"
              />
              <label className="block text-zinc-400 mb-1">Secret Question 2</label>
              <select
                name="question2_id"
                value={formData.question2_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white mb-2"
              >
                <option value="">Select a different question</option>
                {questions.map(q => (
                  <option
                    key={q.id}
                    value={q.id}
                    disabled={formData.question1_id && q.id === Number(formData.question1_id)}
                  >
                    {q.question}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="answer2"
                placeholder="Answer to question 2"
                value={formData.answer2}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center">
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