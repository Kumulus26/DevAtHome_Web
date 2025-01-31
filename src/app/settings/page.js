'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function Settings({ isModal = false, onClose }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user')
    if (!loggedInUser) {
      router.push('/')
      return
    }
    const userData = JSON.parse(loggedInUser)
    setUser(userData)
    setFormData(prev => ({
      ...prev,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      username: userData.username || '',
    }))
  }, [router])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          username: formData.username.trim(),
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error updating settings')
      }

      const updatedUser = {
        ...user,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        username: data.user.username,
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      window.location.reload()

      setSuccess('Settings updated successfully')
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))

      if (onClose) onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      localStorage.removeItem('user')
      router.push('/')
      window.location.reload()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={(e) => {
        // Only close if clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose?.()
        }
      }}
    >
      <div 
        className={`bg-zinc-900 p-8 rounded-3xl shadow-xl w-full max-w-md mx-4 ${isModal ? '' : 'mt-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="33" cy="33" r="30" className="stroke-white fill-none"/>
              <circle cx="67" cy="33" r="30" className="stroke-white fill-none"/>
              <circle cx="50" cy="67" r="30" className="stroke-white fill-none"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-white focus:ring-1 focus:ring-white transition-colors text-lg"
              required
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

          <div className="border-t border-zinc-800 pt-6">
            <h2 className="text-white text-lg mb-4">Change Password</h2>
            <div className="space-y-4">
              <input
                type="password"
                name="currentPassword"
                placeholder="Current password"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
              <input
                type="password"
                name="newPassword"
                placeholder="New password"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-400 focus:border-white focus:ring-1 focus:ring-white transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            {isModal && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>

        {/* Delete Account Section */}
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <div className="flex flex-col items-center">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors"
              >
                Delete account
              </button>
            ) : (
              <div className="text-center">
                <p className="text-white text-sm mb-3">Are you sure? This action cannot be undone.</p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Yes, delete my account
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-zinc-700 text-white text-sm font-medium rounded-lg hover:bg-zinc-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 