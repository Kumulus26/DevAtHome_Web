// API - Temps de développement film/développeur
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Mapping des noms pour Prisma
const filmToModelMap = {
  'Tri-X 400': 'trix400',
  'T-MAX 400': 'tmax400',
  'FOMAPAN 400': 'fomapan400',
  'RPX 400': 'rpx400',
  'HP5+ 400': 'hp5',
}

const devToModelMap = {
  'T-MAX Dev': 'tmaxdev',
  Rodinal: 'rodinal',
  'Ilfosol 3': 'ilfosol3',
  'HC-110': 'hc110',
  'Ilfotec LC-29': 'ilfoteclc29',
}

// Récupère le temps de développement
export async function POST(request) {
  try {
    const { film, developer, iso } = await request.json()
    const filmModelKey = filmToModelMap[film]
    const devModelKey = devToModelMap[developer]
    if (!filmModelKey || !devModelKey) {
      return NextResponse.json(
        { error: 'Unknown film or developer' },
        { status: 400 }
      )
    }
    // Construit le nom du modèle Prisma
    const modelName = `${filmModelKey}${devModelKey}`
    if (!prisma[modelName]) {
      console.error(`Prisma model not found: ${modelName}`)
      return NextResponse.json(
        { error: 'Development combination not supported' },
        { status: 404 }
      )
    }
    const result = await prisma[modelName].findFirst({
      where: {
        asa_iso: parseInt(iso),
      },
      select: {
        time_35mm: true,
        dilution: true,
      },
    })
    if (!result) {
      return NextResponse.json(
        { error: 'Development time not found for the specified ISO' },
        { status: 404 }
      )
    }
    // Retourne le temps sous forme de nombre
    const time =
      typeof result.time_35mm === 'string'
      ? parseFloat(result.time_35mm) 
      : Number(result.time_35mm)
    return NextResponse.json({ 
      time,
      dilution: result.dilution,
    })
  } catch (error) {
    console.error('Error fetching development time:', error)
    return NextResponse.json(
      { error: 'Error fetching development time' },
      { status: 500 }
    )
  }
} 