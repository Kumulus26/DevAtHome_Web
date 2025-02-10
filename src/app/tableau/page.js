'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Login from '../login/page'
import SignUp from '../signup/page'

export default function Tableau() {
  const router = useRouter()
  const [selectedFilm, setSelectedFilm] = useState('')
  const [selectedDeveloper, setSelectedDeveloper] = useState('')
  const [showQuestion, setShowQuestion] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showLoader, setShowLoader] = useState(false)

  const films = [
    {
      id: 'hp5-400',
      name: "HP5+ 400",
      image: "/images/hp5400.png",
      description: "Versatile black and white film"
    },
    {
      id: 'tmax-400',
      name: "T-MAX 400",
      image: "/images/tmax400.png",
      description: "Fine grain, high contrast"
    },
    {
      id: 'fomapan-400',
      name: "FOMAPAN 400",
      image: "/images/fomapan400.png",
      description: "Affordable classic film"
    },
    {
      id: 'rpx-400',
      name: "RPX 400",
      image: "/images/rpx400.png",
      description: "Versatile, high contrast, fine grain"
    },
    {
      id: 'tri-x-400',
      name: "Tri-X 400",
      image: "/images/trix400.png",
      description: "The timeless classic"
    }
  ]

  const developers = [
    {
      id: 'ilfosol3',
      name: "Ilfosol 3",
      image: "/images/ilfosol3.png",
      description: "For low sensitivity"
    },
    {
      id: 'rodinal',
      name: "Rodinal",
      image: "/images/rodinal.png",
      description: "The oldest developer"
    },
    {
      id: 'tmaxdev',
      name: "T-MAX Dev",
      image: "/images/tmaxdev.png",
      description: "For high sensitivity"
    },
    {
      id: 'hc110',
      name: "HC-110",
      image: "/images/hc110.png",
      description: "Long-term storage"
    },
    {
      id: 'ilfoteclc29',
      name: "Ilfotec LC-29",
      image: "/images/ilfoteclc29.png",
      description: "Excellent grain and definition"
    }
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowQuestion(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

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

  const handleFilmSelect = (filmId) => {
    setSelectedFilm(filmId)
    setSelectedDeveloper('')
  }

  const handleDeveloperSelect = (developerId) => {
    setSelectedDeveloper(developerId)
    setShowLoader(true)
    
    const selectedFilmObj = films.find(film => film.id === selectedFilm)
    const selectedDeveloperObj = developers.find(dev => dev.id === developerId)
    
    setTimeout(() => {
      router.push(`/timer?film=${encodeURIComponent(selectedFilmObj.name)}&developer=${encodeURIComponent(selectedDeveloperObj.name)}`)
    }, 2000)
  }

  const renderImageGrid = (items, selectedId, onSelect) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 w-full max-w-7xl mx-auto transform transition-all duration-1000">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`group relative overflow-hidden rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-105 ${
            selectedId === item.id ? 'ring-4 ring-black' : ''
          }`}
        >
          <div className="aspect-[3/4] relative bg-gray-100">
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
              priority={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-lg font-bold mb-1">{item.name}</h3>
              <p className="text-sm opacity-90">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <>
      <div className={`min-h-screen relative overflow-hidden ${
        showLogin || showSignUp || showLoader ? 'blur-sm transition-all duration-200' : ''
      }`}>
        {/* Diagonal split background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-white"></div>
          <div 
            className="absolute bg-black" 
            style={{
              top: '0',
              right: '0',
              bottom: '0',
              left: '55%',
              transform: 'skew(-12deg)',
              transformOrigin: 'top'
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative">
          <Navbar onLoginClick={handleLoginClick} />

          {/* Main Content */}
          <main className="container mx-auto px-6 py-12">
            <div className="flex flex-col items-center justify-center space-y-16">
              {/* Initial Question */}
              <div 
                className={`transform transition-all duration-1000 ${
                  showQuestion ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                <h2 className="text-4xl text-center relative z-10">
                  <span className="text-black">What are you deve</span>
                  <span className="text-white">loping today ?</span>
                </h2>
              </div>

              {/* Film Grid - Now wrapped in a container with padding */}
              <div 
                className={`w-full px-4 transform transition-all duration-1000 delay-500 ${
                  showQuestion ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
              >
                {renderImageGrid(films, selectedFilm, handleFilmSelect)}
              </div>

              {/* Second Question - Only show if film is selected */}
              {selectedFilm && (
                <>
                  <div className="transform transition-all duration-1000 opacity-0 animate-fade-in">
                    <h2 className="text-3xl text-center relative z-10">
                      <span className="text-black">Very good choice ! </span>
                      <span className="text-white">And with which developer ?</span>
                    </h2>
                  </div>
                  <div className="w-full px-4 transform transition-all duration-1000 opacity-0 animate-fade-in">
                    {renderImageGrid(developers, selectedDeveloper, handleDeveloperSelect)}
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Loader */}
      {showLoader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-2xl p-8 shadow-xl text-center">
            <p className="text-2xl text-white font-medium flex items-center">
              Let&apos;s go
              <span className="inline-flex ml-2">
                <span className="w-2 h-2 bg-white rounded-full mx-1 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-white rounded-full mx-1 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-white rounded-full mx-1 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center"
          onClick={() => handleCloseModals()}
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

      {/* SignUp Modal */}
      {showSignUp && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center"
          onClick={() => handleCloseModals()}
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
    </>
  )
} 