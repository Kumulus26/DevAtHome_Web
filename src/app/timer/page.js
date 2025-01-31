'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function Timer() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedISO, setSelectedISO] = useState(null)
  const [error, setError] = useState(false)
  const [developmentTime, setDevelopmentTime] = useState(null)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentProcess, setCurrentProcess] = useState('developer')

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

  const selectedFilm = searchParams.get('film')
  const selectedDeveloper = searchParams.get('developer')

  const processes = {
    developer: { name: 'Developer', time: developmentTime ? developmentTime * 60 : 0 },
    stopBath: { name: 'Stop Bath', time: 60 },
    fixer: { name: 'Fixer', time: 300 }
      }

  useEffect(() => {
    if (timeLeft > 0 && isTimerRunning) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (currentProcess === 'developer' && prev % 30 === 0 && prev !== processes.developer.time) {
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
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <Link href="/" className="absolute top-6 left-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="black" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div className="bg-[#1c1c1c] rounded-3xl p-12 max-w-xl w-full mx-4 text-center">
          <div className="text-6xl mb-6 text-white">:(</div>
          <p className="text-white text-2xl mb-8">
            Cette combinaison n'existe pas... Tu dois changer l'ISO ou changer le révélateur en cliquant
          </p>
          <button
            onClick={() => router.push('/tableau')}
            className="bg-[#2a2a2a] text-white px-8 py-3 rounded-2xl text-xl font-medium 
                     transition-all duration-300 hover:bg-[#333333] hover:scale-105"
          >
            Ici
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-200 flex items-center justify-center p-6">
      <Link href="/" className="absolute top-6 left-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="black" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </Link>
      <div className="w-full max-w-lg">
        {!selectedISO ? (
          <div className="text-black text-center">
            <h2 className="text-3xl font-light mb-12">
              At what ISO did you shoot your film?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[400, 800, 1600, 3200].map((iso) => (
                <button
                  key={iso}
                  onClick={() => handleISOSelect(iso)}
                  className="bg-white hover:bg-gray-50 p-6 rounded-2xl
                           text-2xl font-light transition-all duration-300
                           hover:scale-105 shadow-lg"
                >
                  {iso}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex justify-center gap-4 mb-6">
              {Object.entries(processes).map(([key, { name }]) => (
                <button
                  key={key}
                  onClick={() => handleProcessSelect(key)}
                  className={`px-8 py-3 rounded-full text-lg transition-all duration-300
                    ${currentProcess === key 
                      ? 'bg-[#0891b2] text-white' 
                      : 'bg-gray-400 text-white'}`}
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="bg-black rounded-[2rem] p-8 flex items-center justify-between shadow-xl">
              <div className="flex-1">
                <div className="text-gray-400 text-xl mb-2">Timer</div>
                <div className="text-white text-7xl font-light tracking-wider mb-4">
                  {formatTime(timeLeft)}
                </div>
                <button
                  onClick={() => {
                    setTimeLeft(processes[currentProcess].time)
                    setIsTimerRunning(false)
                  }}
                  className="px-8 py-2 bg-zinc-800 text-white rounded-full
                           hover:bg-zinc-700 transition-colors"
                >
                  Stop
                </button>
              </div>

              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-[#0f2936] relative overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#0891b2"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - calculateProgress() / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <button
                    onClick={handlePlayPause}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="text-white text-4xl">
                      {isTimerRunning ? '❚❚' : '▶'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <div className="w-32 h-1 bg-black rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 