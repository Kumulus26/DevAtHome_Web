'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PhotoPage({ params: pageParams }) {
  const router = useRouter()
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [user, setUser] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Get logged in user from localStorage
    const loggedInUser = localStorage.getItem('user')
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser))
    }
  }, [])

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const userId = user?.id
        const res = await fetch(`/api/photos/${pageParams.id}${userId ? `?userId=${userId}` : ''}`)
        const data = await res.json()
        if (res.ok) {
          setPhoto(data)
          setIsLiked(data.isLiked)
        } else {
          console.error('Error:', data.error)
        }
      } catch (error) {
        console.error('Error fetching photo:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPhoto()
  }, [pageParams.id, user])

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/photos/${pageParams.id}/comments`)
        const data = await res.json()
        if (res.ok) {
          setComments(data)
        }
      } catch (error) {
        console.error('Error fetching comments:', error)
      }
    }
    fetchComments()
  }, [pageParams.id])

  const handleLike = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`/api/photos/${pageParams.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id })
      })

      const data = await res.json()
      if (res.ok) {
        setIsLiked(data.liked)
        setPhoto(prev => ({
          ...prev,
          likes: data.liked ? prev.likes + 1 : prev.likes - 1
        }))
      }
    } catch (error) {
      console.error('Error liking photo:', error)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!user) {
      router.push('/login')
      return
    }

    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/photos/${pageParams.id}/comments`, {
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
        setComments(prev => [data, ...prev])
        setNewComment('')
        setPhoto(prev => ({
          ...prev,
          comments: (prev.comments || 0) + 1
        }))
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  // Error state
  if (!photo) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">Photo not found</p>
          <Link href="/" className="text-blue-400 hover:underline mt-4 block">
            Return home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      {/* Close button */}
      <button 
        onClick={() => router.back()}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Photo container */}
      <div className="bg-zinc-900 rounded-xl overflow-hidden max-w-5xl w-full mx-auto flex flex-col md:flex-row">
        {/* Photo */}
        <div className="w-full md:w-2/3 relative bg-black flex items-center justify-center">
          <img
            src={photo.url}
            alt=""
            className="max-h-[80vh] w-full object-contain"
          />
        </div>

        {/* User info, actions, and comments */}
        <div className="w-full md:w-1/3 p-4 flex flex-col h-[80vh]">
          {/* User header */}
          <div className="flex items-center space-x-3 border-b border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
              {photo.user?.profileImage ? (
                <img 
                  src={photo.user.profileImage} 
                  alt={photo.user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <Link 
              href={`/profile/${photo.user?.username}`}
              className="text-white font-medium hover:underline"
            >
              {photo.user?.username}
            </Link>
          </div>

          {/* Comments section */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Photo caption */}
            {photo.title && (
              <div className="flex space-x-3">
                <Link 
                  href={`/profile/${photo.user?.username}`}
                  className="text-white font-medium hover:underline shrink-0"
                >
                  {photo.user?.username}
                </Link>
                <p className="text-gray-300">{photo.title}</p>
              </div>
            )}

            {/* Comments */}
            {comments.map(comment => (
              <div key={comment.id} className="flex space-x-3">
                <Link 
                  href={`/profile/${comment.user.username}`}
                  className="text-white font-medium hover:underline shrink-0"
                >
                  {comment.user.username}
                </Link>
                <p className="text-gray-300">{comment.content}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="border-t border-zinc-800 pt-4">
            <div className="flex items-center space-x-4 mb-4">
              <button 
                onClick={handleLike}
                className="flex items-center space-x-2 text-white hover:text-red-500 transition-colors"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-7 w-7 ${isLiked ? 'text-red-500 fill-current' : ''}`} 
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
                <span className="text-sm font-medium">{photo.likes || 0} likes</span>
              </button>
            </div>

            {/* Comment form */}
            <form onSubmit={handleComment} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="text-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:text-blue-400 transition-colors"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 