'use client'

// imports
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

// page détail photo
export default function PhotoPage({ params }) {
  // hooks et états
  const pageParams = use(params)
  const router = useRouter()
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [user, setUser] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // récupère l'utilisateur connecté
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user')
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser))
    }
  }, [])

  // récupère la photo
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

  // récupère les commentaires
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

  // like la photo
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

  // ajoute un commentaire
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

  // supprime un commentaire
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

  // clic en dehors de la modale
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      router.back()
    }
  }

  // rendu loading
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  // rendu si photo non trouvée
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

  // rendu principal
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
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white text-sm">{comment.user.username}</span>
                    <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    {user && comment.user.id === user.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="ml-2 text-xs text-red-400 hover:underline"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  <div className="text-gray-200 text-sm mt-1">{comment.content}</div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleComment} className="p-4 border-t border-gray-800 flex items-center">
            <input
              type="text"
              placeholder="Ajouter un commentaire..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm border-gray-700 focus:ring-white focus:border-white rounded-lg"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="ml-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              Poster
            </button>
          </form>

          <div className="p-4 border-t border-gray-800 flex items-center justify-between">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 focus:outline-none ${isLiked ? 'text-red-500' : 'text-white'}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
              <span>{photo.likes} likes</span>
            </button>
            <span className="text-xs text-gray-400">
              {new Date(photo.createdAt).toLocaleDateString('fr-FR', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 