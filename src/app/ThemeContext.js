'use client'

// Import des hooks React nécessaires
import { createContext, useContext, useState, useEffect } from 'react'

// Création du contexte pour le thème
const ThemeContext = createContext()

// Provider du thème pour l'application
export function ThemeProvider({ children }) {
  // État pour gérer le mode sombre/clair
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Initialisation du thème au chargement
  useEffect(() => {
    // Récupération du thème sauvegardé dans localStorage
    const savedTheme = localStorage.getItem('theme')
    setIsDarkMode(savedTheme === 'dark' || savedTheme === null)
  }, [])

  // Fonction pour basculer entre les thèmes
  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    // Sauvegarde du thème dans localStorage
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook personnalisé pour utiliser le thème
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 