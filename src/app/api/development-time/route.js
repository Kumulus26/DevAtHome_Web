import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request) {
  try {
    const { film, developer, iso } = await request.json()

    console.log('Received parameters:', { film, developer, iso })

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

    const tableName = `${filmName}${devName}`
    console.log('Looking up table:', tableName)

    // Use backticks around table name to handle special characters
    const [results] = await pool.query(
      `SELECT time_35mm, dilution FROM \`${tableName}\` WHERE asa_iso = ?`,
      [iso]
    )

    if (results.length === 0) {
      console.log('No results found for:', { tableName, iso })
      return NextResponse.json(
        { error: 'Development time not found' },
        { status: 404 }
      )
    }

    const result = results[0]
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