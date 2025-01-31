'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PhotoPage({ params }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [photo, setPhoto] = useState(null)
  const [comment, setComment] = useState('')
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const fetchPhoto = async () => {
      const res = await fetch(`/api/photos/${params.id}`)
      const data = await res.json()
      if (res.ok) {
        setPhoto(data)
        setIsLiked(data.likes?.some(like => like.userId === session?.user?.id))
      }
    }
    fetchPhoto()
  }, [params.id, session?.user?.id])

  const handleLike = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    const res = await fetch(`/api/photos/${params.id}/like`, {
      method: 'POST',
    })

    if (res.ok) {
      setIsLiked(!isLiked)
      setPhoto(prev => ({
        ...prev,
        likes: isLiked 
          ? prev.likes.filter(like => like.userId !== session.user.id)
          : [...prev.likes, { userId: session.user.id }]
      }))
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!session) {
      router.push('/login')
      return
    }

    const res = await fetch(`/api/photos/${params.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: comment }),
    })

    if (res.ok) {
      const newComment = await res.json()
      setPhoto(prev => ({
        ...prev,
        comments: [...prev.comments, newComment]
      }))
      setComment('')
    }
  }

  if (!photo) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
    </div>
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="bg-white rounded-xl overflow-hidden max-w-6xl w-full mx-4 flex">
        {/* Left side - Photo */}
        <div className="w-2/3 relative" onDoubleClick={handleLike}>
          <img
            src={photo.url}
            alt=""
            className="w-full h-full object-contain"
          />
          <div className="absolute top-4 left-4">
            <Link href="/" className="text-white hover:text-gray-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Right side - Comments */}
        <div className="w-1/3 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <Link href={`/profile/${photo.user.username}`} className="flex items-center space-x-2">
              <img
                src={photo.user.image || '/default-avatar.png'}
                alt=""
                className="w-8 h-8 rounded-full"
              />
              <span className="font-medium">{photo.user.username}</span>
            </Link>
          </div>

          {/* Comments section */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {photo.comments?.map((comment) => (
              <div key={comment.id} className="flex space-x-2">
                <img
                  src={comment.user.image || '/default-avatar.png'}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <span className="font-medium">{comment.user.username}</span>
                  <span className="ml-2">{comment.content}</span>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-4 mb-4">
              <button onClick={handleLike} className="text-2xl">
                {isLiked ? '❤️' : '🤍'}
              </button>
              <span>{photo.likes?.length || 0} likes</span>
            </div>

            {/* Comment form */}
            <form onSubmit={handleComment} className="flex space-x-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border rounded-full px-4 py-2"
              />
              <button
                type="submit"
                disabled={!comment.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded-full disabled:opacity-50"
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