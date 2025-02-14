'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '../ThemeContext'
import Background from '@/components/Background'

function TimerContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedISO, setSelectedISO] = useState(null)
  const [error, setError] = useState(false)
  const [developmentTime, setDevelopmentTime] = useState(null)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentProcess, setCurrentProcess] = useState('developer')
  const { isDarkMode } = useTheme()

  const selectedFilm = searchParams.get('film')
  const selectedDeveloper = searchParams.get('developer')

  const processes = {
    developer: { name: 'Developer', time: developmentTime ? developmentTime * 60 : 0 },
    stopBath: { name: 'Stop Bath', time: 120 },
    fixer: { name: 'Fixer', time: 420 }
  }

  const beep = () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.frequency.value = 800;
    gain.gain.value = 0.1;

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.1);
  };

  useEffect(() => {
    if (timeLeft > 0 && isTimerRunning) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (currentProcess === 'developer' && prev % 60 === 0 && prev !== processes.developer.time) {
            try {
              beep();
            } catch (error) {
              console.error('Beep failed:', error);
            }
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isTimerRunning, currentProcess, processes.developer.time]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const calculateProgress = () => {
    const totalTime = processes[currentProcess].time
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const handleISOSelect = async (iso) => {
    setSelectedISO(iso)
    try {
      const response = await fetch('/api/development-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ film: selectedFilm, developer: selectedDeveloper, iso }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(true)
        throw new Error(data.error)
      }

      setDevelopmentTime(data.time)
      setTimeLeft(data.time * 60)
      setCurrentProcess('developer')
    } catch (error) {
      console.error('Error:', error)
      setError(true)
    }
  }

  const handleProcessSelect = (process) => {
    setCurrentProcess(process)
    setTimeLeft(processes[process].time)
    setIsTimerRunning(false)
  }

  const handlePlayPause = () => {
    if (!isTimerRunning) {
      try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        context.resume();
      } catch (error) {
        console.error('Audio context initialization failed:', error);
      }
    }
    setIsTimerRunning(!isTimerRunning);
  };

  if (error) {
    return (
      <div className={`fixed inset-0 ${isDarkMode ? 'bg-black' : 'bg-white'} flex items-center justify-center`}>
        {/* Dot pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${isDarkMode ? 'white' : 'black'} 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        <Link href="/" className="absolute top-6 left-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={isDarkMode ? "white" : "black"} className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div className={`${isDarkMode ? 'bg-zinc-900' : 'bg-gray-100'} rounded-3xl p-12 max-w-xl w-full mx-4 text-center`}>
          <div className={`text-6xl mb-6 ${isDarkMode ? 'text-white' : 'text-black'}`}>:(</div>
          <p className={`${isDarkMode ? 'text-white' : 'text-black'} text-2xl mb-8`}>
            Cette combinaison n'existe pas... Tu dois changer l'ISO ou changer le révélateur en cliquant
          </p>
          <button
            onClick={() => router.push('/tableau')}
            className={`${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-300'} 
                     ${isDarkMode ? 'text-white' : 'text-black'} 
                     px-8 py-3 rounded-2xl text-xl font-medium 
                     transition-all duration-300 hover:scale-105`}
          >
            Ici
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'text-white' : 'text-black'}`}>
      <Background isDarkMode={isDarkMode} />
      
      <div className="relative">
        <div className={`min-h-screen ${isDarkMode ? 'bg-black' : 'bg-white'} flex flex-col items-center justify-start sm:justify-center px-4 py-8 sm:p-6 relative`}>
          {/* Dot pattern overlay */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, ${isDarkMode ? 'white' : 'black'} 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }}
          />
          <Link href="/" className="absolute top-6 left-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={isDarkMode ? "white" : "black"} className="w-6 h-6 sm:w-8 sm:h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="w-full max-w-lg lg:max-w-6xl mt-16 sm:mt-0 relative z-10">
            {!selectedISO ? (
              <div className={`text-center max-w-lg mx-auto ${isDarkMode ? 'text-white' : 'text-black'}`}>
                <h2 className="text-2xl sm:text-3xl font-light mb-8 sm:mb-12">
                  At what ISO did you shoot your film?
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[400, 800, 1600, 3200].map((iso) => (
                    <button
                      key={iso}
                      onClick={() => handleISOSelect(iso)}
                      className={`${isDarkMode ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-white hover:bg-gray-50'} 
                               py-4 sm:p-6 rounded-2xl text-xl sm:text-2xl font-light transition-all duration-300
                               hover:scale-105 shadow-lg`}
                    >
                      {iso}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6">
                  {Object.entries(processes).map(([key, { name }]) => (
                    <button
                      key={key}
                      onClick={() => handleProcessSelect(key)}
                      className={`px-4 sm:px-8 py-2 sm:py-3 rounded-full text-base sm:text-lg transition-all duration-300
                        ${currentProcess === key 
                          ? 'bg-[#0891b2] text-white' 
                          : isDarkMode 
                            ? 'bg-zinc-800 text-gray-300 hover:bg-zinc-700' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                <div className="lg:flex lg:items-start lg:gap-12 lg:justify-center">
                  <div className="max-w-lg w-full">
                    <div className={`${isDarkMode ? 'bg-zinc-900' : 'bg-gray-100'} rounded-[2rem] p-4 sm:p-8 flex items-center justify-between shadow-xl`}>
                      <div className="flex-1">
                        <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-lg sm:text-xl mb-1 sm:mb-2`}>Timer</div>
                        <div className={`${isDarkMode ? 'text-white' : 'text-black'} text-5xl sm:text-7xl font-light tracking-wider mb-2 sm:mb-4`}>
                          {formatTime(timeLeft)}
                        </div>
                        <button
                          onClick={() => {
                            setTimeLeft(processes[currentProcess].time)
                            setIsTimerRunning(false)
                          }}
                          className={`px-6 sm:px-8 py-2 ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-300'} 
                                   ${isDarkMode ? 'text-white' : 'text-black'} text-sm sm:text-base rounded-full
                                   transition-colors`}
                        >
                          Stop
                        </button>
                      </div>

                      <div className="relative ml-4">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-[#0f2936] relative overflow-hidden">
                          <svg 
                            viewBox="0 0 100 100" 
                            className="absolute inset-0 w-full h-full rotate-[-90deg]"
                          >
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="#0891b2"
                              strokeWidth="6"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - timeLeft / processes[currentProcess].time)}`}
                              className="transition-all duration-1000"
                            />
                          </svg>
                          <button
                            onClick={handlePlayPause}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <span className="text-white text-3xl sm:text-4xl">
                              {isTimerRunning ? '❚❚' : '▶'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-center">
                      <div className={`w-24 sm:w-32 h-1 ${isDarkMode ? 'bg-white' : 'bg-black'} rounded-full`}></div>
                    </div>
                  </div>

                  {/* Instructions Section */}
                  <div className="mt-8 lg:mt-0 lg:w-96">
                    <div className={`${isDarkMode ? 'bg-zinc-900' : 'bg-gray-100'} rounded-[2rem] p-6 sm:p-8 shadow-xl`}>
                      <h3 className={`${isDarkMode ? 'text-white' : 'text-black'} text-xl font-medium mb-6`}>Instructions</h3>
                      <ol className={`space-y-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-7 h-7 bg-[#0891b2] rounded-full flex items-center justify-center text-white text-sm">1</span>
                          <p className="text-lg">Click on the timer once you start pouring the liquid.</p>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-7 h-7 bg-[#0891b2] rounded-full flex items-center justify-center text-white text-sm">2</span>
                          <p className="text-lg">Each time you hear a beep, invert your tank 4 times. Don't forget to tap your tank against the table once to release air bubbles.</p>
                        </li>
                        <li className="flex gap-4">
                          <span className="flex-shrink-0 w-7 h-7 bg-[#0891b2] rounded-full flex items-center justify-center text-white text-sm">3</span>
                          <p className="text-lg">15 seconds before the timer ends, start emptying your tank.</p>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Timer() {
  const { isDarkMode } = useTheme()
  
  return (
    <Suspense fallback={
      <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'text-white' : 'text-black'}`}>
        <Background isDarkMode={isDarkMode} />
        
        <div className="relative flex items-center justify-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? 'border-white' : 'border-black'}`}></div>
        </div>
      </div>
    }>
      <TimerContent />
    </Suspense>
  )
} 