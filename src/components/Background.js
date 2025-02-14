'use client'

export default function Background({ isDarkMode, blur = false }) {
  return (
    <div className={`absolute inset-0 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      <div 
        className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-black bg-[radial-gradient(circle_at_center,white_3px,transparent_2px)]' 
            : 'bg-white bg-[radial-gradient(circle_at_center,black_3px,transparent_2px)]'
        } bg-[size:32px_32px] ${blur ? 'blur-sm' : ''}`}
      ></div>
    </div>
  )
} 