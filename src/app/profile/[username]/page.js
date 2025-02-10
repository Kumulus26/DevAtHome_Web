'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Image from 'next/image'
import { use } from 'react'
import Link from 'next/link'

export default function Profile({ params }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [bio, setBio] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [activeTab, setActiveTab] = useState('photos')
  const fileInputRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const photoInputRef = useRef(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!resolvedParams?.username) {
        setLoading(false)
        return
      }

      try {
        const username = resolvedParams.username
        const response = await fetch(`/api/profile/${username}`)
        const data = await response.json()

        if (response.status === 404) {
          setError('User not found')
          return
        }

        if (!response.ok) {
          throw new Error(data.error || 'Error fetching profile')
        }

        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response data')
        }

        setUser(data)
        setBio(data.bio || '')

        const loggedInUser = localStorage.getItem('user')
        if (loggedInUser) {
          try {
            const parsedLoggedInUser = JSON.parse(loggedInUser)
            setIsOwnProfile(parsedLoggedInUser.username === data.username)
          } catch (e) {
            console.error('Error parsing logged in user:', e)
            localStorage.removeItem('user')
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err.message || 'Error fetching profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [resolvedParams?.username])

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('username', user.username)
    formData.append('isProfilePicture', 'true')

    try {
      const uploadResponse = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.details || error.message || 'Failed to upload image')
      }

      const data = await uploadResponse.json()
      
      // Update the user state with the new data
      setUser(prev => ({
        ...prev,
        profileImage: data.imageUrl
      }))

      // Update local storage if it's the current user
      const loggedInUser = localStorage.getItem('user')
      if (loggedInUser) {
        const parsedUser = JSON.parse(loggedInUser)
        if (parsedUser.username === user.username) {
          localStorage.setItem('user', JSON.stringify({
            ...parsedUser,
            profileImage: data.imageUrl
          }))
        }
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('Failed to upload image. Please try again.')
    }
  }

  const handleSaveBio = async () => {
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username,
          bio: bio
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update bio')
      }

      setUser({ ...user, bio: bio })
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setSearchResults(data.users)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('username', user.username)
    formData.append('isProfilePicture', 'false')

    try {
      const uploadResponse = await fetch('/api/photos/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json()
        throw new Error(error.details || error.message || 'Failed to upload photo')
      }

      const data = await uploadResponse.json()
      
      // Update the user's photos array with the new photo
      setUser(prev => ({
        ...prev,
        photos: [...(prev.photos || []), data.photo]
      }))

    } catch (err) {
      console.error('Upload error:', err)
      alert('Failed to upload photo. Please try again.')
    }
  }

  const WhiteLogo = () => (
    <Link href="/" className="flex items-center space-x-4">
      <div className="w-12 h-12">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="33" cy="33" r="30" className="stroke-white fill-none"/>
          <circle cx="67" cy="33" r="30" className="stroke-white fill-none"/>
          <circle cx="50" cy="67" r="30" className="stroke-white fill-none"/>
        </svg>
      </div>
      <h1 className="text-4xl font-oswald text-white">DevAtHome</h1>
    </Link>
  )

  const PhotoGrid = ({ photos }) => {
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-gray-800/30 rounded-2xl backdrop-blur-sm">
          <div className="w-24 h-24 mb-6 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-white text-xl font-semibold mb-2 text-center">Pas de photos encore...</h3>
          <p className="text-gray-400 text-center max-w-sm">
            Commencez à partager vos moments avec le monde. Vos photos apparaîtront ici dans une galerie élégante.
          </p>
        </div>
      )
    }

    const validPhotos = photos.filter(photo => photo && photo.url && photo.id);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto px-4">
        {validPhotos.map((photo) => (
          <Link
            href={`/p/${photo.id}`}
            key={photo.id}
            className="block aspect-square w-full rounded-lg overflow-hidden bg-gray-800/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/50 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10" />
            
            <div className="w-full h-full">
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Photo Stats Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{photo.likes || 0}</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{photo.comments || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
        <Navbar />
        <div className="max-w-4xl mx-auto pt-20 px-4 text-center">
          <div className="animate-pulse">
            <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-700 w-48 mx-auto rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error === 'User not found') {
    return (
      <div className="min-h-screen bg-[#8B5CF6]">
        <Navbar />
        <div className="max-w-4xl mx-auto pt-20 px-4 text-center">
          <div className="text-9xl font-bold text-black mb-4">404</div>
          <div className="text-4xl font-bold text-black mb-8">NOT FOUND</div>
          <div className="relative w-64 h-64 mx-auto mb-8">
            <img src="/oops.png" alt="Oops!" className="w-full h-full object-contain" />
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Navbar />
      
      {/* Search Section */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Recherche un utilisateur..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery.length >= 2 && (
            <div className="absolute w-full mt-2 bg-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-400">
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      href={`/profile/${result.username}`}
                      className="flex items-center px-4 py-3 hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 mr-3">
                        {result.profileImage ? (
                          <img
                            src={result.profileImage}
                            alt={result.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{result.username}</p>
                        <p className="text-gray-400 text-sm">{result.firstName} {result.lastName}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-20 px-4">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-12">
          {/* Profile Image with Edit Overlay */}
          <div className="relative group mb-6">
            <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-white/10 bg-gray-800">
              <div className="w-full h-full relative">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={`${user.username}'s profile`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      e.target.onerror = null;
                      e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
                    }}
                  />
                ) : (
                  <img 
                    src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                    alt="Default profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            {isOwnProfile && (
              <div 
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="bg-black/75 rounded-full w-full h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          {/* Username and Location */}
          <h1 className="text-3xl font-bold text-white mb-2">
            {user.username}
          </h1>
          

          {/* Bio */}
          <div className="max-w-lg w-full text-center mb-6">
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Write something about yourself..."
                />
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={handleSaveBio}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setBio(user.bio || '')
                    }}
                    className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <p className="text-gray-300 text-lg">
                  {user.bio || ''}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-16 mt-8">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-2xl font-bold text-white">{user?.photos?.length || 0}</div>
            </div>
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <div className="text-2xl font-bold text-white">{user?.photos?.reduce((sum, photo) => sum + (photo.likes || 0), 0) || 0}</div>
            </div>
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <div className="text-2xl font-bold text-white">{user?.photos?.reduce((sum, photo) => sum + (photo.commentsCount || 0), 0) || 0}</div>
              
            </div>
          </div>

          

          {/* Add Photo Button - Only show on Photos tab and if it's user's own profile */}
          {activeTab === 'photos' && isOwnProfile && (
            <div className="w-full flex justify-end mb-6">
              <input
                type="file"
                ref={photoInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoUpload}
              />
              <button
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Ajouter une photo</span>
              </button>
            </div>
          )}

          {/* Photos Grid */}
          <div className="w-full">
            {activeTab === 'photos' ? (
              <PhotoGrid photos={user.photos || []} />
            ) : activeTab === 'albums' ? (
              <div className="col-span-full text-center py-8 text-gray-400">
                Albums feature coming soon
              </div>
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">
                Likes feature coming soon
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 