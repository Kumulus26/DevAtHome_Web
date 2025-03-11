import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Search for users with LIKE operator
    const searchTerm = `%${query}%`
    const [users] = await pool.query(
      `SELECT 
        id, username, firstName, lastName, profileImage
      FROM User
      WHERE 
        username LIKE ? OR 
        firstName LIKE ? OR 
        lastName LIKE ?
      LIMIT 10`,
      [searchTerm, searchTerm, searchTerm]
    )

    return NextResponse.json({ users })
  } catch (error) {
    console.error('User search error:', error)
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    )
  }
} 