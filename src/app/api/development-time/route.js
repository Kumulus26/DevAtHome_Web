import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request) {
  try {
    const { film, developer, iso } = await request.json()

    // Debug log the received parameters
    console.log('Received parameters:', { film, developer, iso })

    // Convert film names to match schema
    let filmName = ''
    if (film === 'Tri-X 400') filmName = 'trix'
    else if (film === 'T-MAX 400') filmName = 'tmax400'
    else if (film === 'FOMAPAN 400') filmName = 'fomapan400'
    else if (film === 'RPX 400') filmName = 'rpx400'
    else if (film === 'HP5+ 400') filmName = 'hp5'
    else {
      console.log('Unknown film:', film)
      return NextResponse.json(
        { error: `Unknown film: ${film}` },
        { status: 400 }
      )
    }

    // Convert developer names to match schema
    let devName = ''
    if (developer === 'T-MAX Dev') devName = 'tmaxdev'
    else if (developer === 'Rodinal') devName = 'rodinal'
    else if (developer === 'Ilfosol 3') devName = 'ilfosol3'
    else if (developer === 'HC-110') devName = 'hc110'
    else if (developer === 'Ilfotec LC-29') devName = 'ilfoteclc29'
    else {
      console.log('Unknown developer:', developer)
      return NextResponse.json(
        { error: `Unknown developer: ${developer}` },
        { status: 400 }
      )
    }

    // Construct table name to match schema exactly
    const tableName = `${filmName}${devName}`
    console.log('Looking up table:', tableName)

    // Query the appropriate table
    const result = await prisma[tableName].findFirst({
      where: {
        asa_iso: iso
      },
      select: {
        time_35mm: true,
        dilution: true
      }
    })

    if (!result) {
      console.log('No results found for:', { tableName, iso })
      return NextResponse.json(
        { error: 'Development time not found' },
        { status: 404 }
      )
    }

    // Handle both string and decimal types for time_35mm
    const time = typeof result.time_35mm === 'string' 
      ? parseFloat(result.time_35mm) 
      : Number(result.time_35mm)

    console.log('Found result:', { time, dilution: result.dilution })
    return NextResponse.json({ 
      time,
      dilution: result.dilution
    })

  } catch (error) {
    console.error('Detailed error:', error)
    return NextResponse.json(
      { error: 'Error fetching development time' },
      { status: 500 }
    )
  }
} 