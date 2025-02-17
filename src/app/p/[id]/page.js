'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function PhotoPage({ params }) {
  const pageParams = use(params)
  const router = useRouter()
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [user, setUser] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
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

  const handleDeleteComment = async (commentId) => {
    if (!user) return

    try {
      const res = await fetch(`/api/photos/${pageParams.id}/comments`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          commentId,
          userId: user.id
        })
      })

      if (res.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId))
        setPhoto(prev => ({
          ...prev,
          commentsCount: Math.max(0, (prev.commentsCount || 0) - 1)
        }))
      } else {
        const data = await res.json()
        console.error('Error:', data.error)
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      router.back()
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

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
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 modal-backdrop"
      onClick={handleOutsideClick}
    >
      <div 
        className="flex max-w-6xl w-full h-[90vh] bg-black rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 relative bg-black flex items-center justify-center">
          <Image
            src={photo.url}
            alt=""
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        <div className="w-96 bg-black flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden">
                {photo.user.profileImage ? (
                  <Image
                    src={photo.user.profileImage}
                    alt={photo.user.username}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <span className="text-gray-300 text-sm">
                      {photo.user.username[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <Link
                href={`/profile/${photo.user.username}`}
                className="font-medium text-white hover:underline"
              >
                {photo.user.username}
              </Link>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
                  {comment.user.profileImage ? (
                    <Image
                      src={comment.user.profileImage}
                      alt={comment.user.username}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <span className="text-gray-300 text-sm">
                        {comment.user.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <Link
                    href={`/profile/${comment.user.username}`}
                    className="font-medium text-white hover:underline"
                  >
                    {comment.user.username}
                  </Link>{' '}
                  <span className="text-gray-300">{comment.content}</span>
                  {user && (comment.userId === user.id || photo.userId === user.id) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center space-x-4 mb-4">
              <button 
                onClick={handleLike}
                className="text-white hover:text-gray-300"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-6 w-6 ${photo.isLiked ? 'text-red-500 fill-current' : ''}`}
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
              <span className="text-white">{photo.likes} likes</span>
            </div>

            {user && (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleComment(e)
                    }
                  }}
                />
                <button
                  onClick={handleComment}
                  disabled={!newComment.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                >
                  Post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 