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
    if (!photos || photos.length === 0) {
      return (
        <div className="text-center text-gray-400 py-8">
          No photos yet
        </div>
      )
    }

    return (
      <div className="grid grid-cols-3 gap-1 mt-4">
        {photos.map((photo) => (
          <Link href={`/p/${photo.id}`} key={photo.id} className="relative aspect-square group">
            <img
              src={photo.url}
              alt=""
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex gap-6 text-white">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-6 h-6">
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                  <span>{photo.likes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-6 h-6">
                    <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                  </svg>
                  <span>{photo.comments}</span>
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
                  {user.bio || 'No bio yet'}
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
          <div className="flex items-center space-x-6 text-lg mb-8">
            <div className="text-center">
              <span className="block text-white font-bold">5</span>
              <span className="text-gray-400">Posts</span>
            </div>
            <div className="h-10 w-px bg-gray-700"></div>
            <div className="text-center">
              <span className="block text-white font-bold">2.3K</span>
              <span className="text-gray-400">Followers</span>
            </div>
            <div className="h-10 w-px bg-gray-700"></div>
            <div className="text-center">
              <span className="block text-white font-bold">225</span>
              <span className="text-gray-400">Following</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex space-x-8 border-b border-gray-800 w-full justify-center mb-8">
            {['PHOTOS', 'ALBUMS', 'LIKES'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                  activeTab === tab.toLowerCase()
                    ? 'text-blue-500'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab}
                {activeTab === tab.toLowerCase() && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                )}
              </button>
            ))}
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
          <div className="grid grid-cols-3 md:grid-cols-4 gap-1 w-full">
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