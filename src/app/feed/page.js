'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Image from 'next/image'
import Login from '../login/page'
import SignUp from '../signup/page'
import { useTheme } from '../ThemeContext'
import Background from '@/components/Background'

export default function Feed() {
  const router = useRouter()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [commentingPhotoId, setCommentingPhotoId] = useState(null)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const { isDarkMode, toggleTheme } = useTheme()

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user')
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser))
    }
  }, [])

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const loggedInUser = localStorage.getItem('user')
        const userId = loggedInUser ? JSON.parse(loggedInUser).id : null
        const response = await fetch(`/api/photos${userId ? `?userId=${userId}` : ''}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error)
        setPhotos(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPhotos()
  }, [])

  const handleLike = async (photoId) => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`/api/photos/${photoId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id })
      })

      const data = await res.json()
      if (res.ok) {
        setPhotos(photos.map(photo => 
          photo.id === photoId 
            ? { 
                ...photo, 
                isLiked: data.liked,
                likes: data.liked ? photo.likes + 1 : photo.likes - 1 
              }
            : photo
        ))
      }
    } catch (error) {
      console.error('Error liking photo:', error)
    }
  }

  const handleComment = async (photoId) => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!newComment.trim()) return

    try {
      const res = await fetch(`/api/photos/${photoId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment.trim(),
          userId: user.id
        })
      })

      const data = await res.json()
      if (res.ok) {
        setPhotos(photos.map(photo =>
          photo.id === photoId
            ? {
                ...photo,
                commentsCount: photo.commentsCount + 1,
                latestComment: data
              }
            : photo
        ))
        setNewComment('')
        setCommentingPhotoId(null)
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const handleLoginClick = () => {
    setShowSignUp(false)
    setShowLogin(true)
  }

  const handleSignUpClick = () => {
    setShowLogin(false)
    setShowSignUp(true)
  }

  const handleCloseModals = () => {
    setShowLogin(false)
    setShowSignUp(false)
  }

  if (loading) {
    return (
      <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'text-white' : 'text-black'}`}>
        <Background isDarkMode={isDarkMode} />
        
        <div className="relative">
          <Navbar 
            isDarkMode={isDarkMode}
            onThemeToggle={toggleTheme}
          />

          <main className="container mx-auto px-6 py-12">
            <div className={`relative rounded-3xl overflow-hidden ${
              isDarkMode ? 'bg-white/5' : 'bg-black/5'
            } backdrop-blur-sm p-8 lg:p-12`}>
              <div className="animate-pulse space-y-8">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-gray-100 rounded-xl h-[600px]"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'text-white' : 'text-black'}`}>
        <Background isDarkMode={isDarkMode} />
        
        <div className="relative">
          <Navbar 
            isDarkMode={isDarkMode}
            onThemeToggle={toggleTheme}
          />

          <main className="container mx-auto px-6 py-12">
            <div className={`relative rounded-3xl overflow-hidden ${
              isDarkMode ? 'bg-white/5' : 'bg-black/5'
            } backdrop-blur-sm p-8 lg:p-12`}>
              <div className="max-w-2xl mx-auto pt-20 px-4 text-center">
                <p className="text-red-500">{error}</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <Background isDarkMode={isDarkMode} />
      
      <div className="relative">
        <Navbar 
          isDarkMode={isDarkMode}
          onThemeToggle={toggleTheme}
        />

        <main className="max-w-2xl mx-auto px-6 py-12">
          <div className={`relative rounded-3xl overflow-hidden ${
            isDarkMode ? 'bg-white/5' : 'bg-black/5'
          } backdrop-blur-sm p-8 lg:p-12`}>
            {photos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No photos yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {photos.map((photo) => (
                  <div key={photo.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex items-center p-4">
                      <Link href={`/profile/${photo.user.username}`} className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                          {photo.user.profileImage ? (
                            <Image
                              src={photo.user.profileImage}
                              alt={photo.user.username}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300">
                              <span className="text-gray-600 text-sm">
                                {photo.user.username[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <span className="ml-2 font-medium text-sm text-gray-900">
                          {photo.user.username}
                        </span>
                      </Link>
                    </div>

                    <div className="relative aspect-square bg-black">
                      <Image
                        src={photo.url}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 600px"
                        className="object-contain"
                        onClick={() => router.push(`/p/${photo.id}`)}
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={() => handleLike(photo.id)}
                          className="flex items-center space-x-1 focus:outline-none"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-6 w-6 ${photo.isLiked ? 'text-red-500 fill-current' : 'text-gray-700'} transition-colors duration-200`}
                            fill="none"
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                            />
                          </svg>
                        </button>
                        <button 
                          onClick={() => setCommentingPhotoId(commentingPhotoId === photo.id ? null : photo.id)}
                          className="flex items-center space-x-1 focus:outline-none"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-2">
                        <span className="font-medium text-sm">{photo.likes} likes</span>
                      </div>

                      {photo.title && (
                        <div className="mt-1">
                          <Link href={`/profile/${photo.user.username}`} className="font-medium text-sm hover:underline">
                            {photo.user.username}
                          </Link>{' '}
                          <span className="text-sm">{photo.title}</span>
                        </div>
                      )}

                      {photo.commentsCount > 0 && (
                        <Link 
                          href={`/p/${photo.id}`}
                          className="block mt-1 text-gray-500 text-sm hover:underline"
                        >
                          View all {photo.commentsCount} comments
                        </Link>
                      )}

                      {commentingPhotoId === photo.id && (
                        <div className="mt-3 flex items-center">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 bg-transparent text-sm border-gray-300 focus:ring-black focus:border-black rounded-lg"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleComment(photo.id)
                              }
                            }}
                          />
                          <button
                            onClick={() => handleComment(photo.id)}
                            disabled={!newComment.trim()}
                            className="ml-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                          >
                            Post
                          </button>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(photo.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {showLogin && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center"
          onClick={handleCloseModals}
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
          onClick={handleCloseModals}
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
    </div>
  )
} 