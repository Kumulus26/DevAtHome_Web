import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request, context) {
  try {
    const params = await context.params
    const username = params.username

    // Get user information
    const [users] = await pool.query(
      'SELECT * FROM User WHERE username = ?',
      [username]
    )

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = users[0]

    // Get user's photos
    const [photos] = await pool.query(
      `SELECT 
        p.id, p.url, p.title, p.createdAt, p.likes, p.commentsCount
      FROM Photo p
      WHERE p.userId = ?
      ORDER BY p.createdAt DESC`,
      [user.id]
    )

    // Calculate stats
    const totalLikes = photos.reduce((sum, photo) => sum + photo.likes, 0)
    const totalComments = photos.reduce((sum, photo) => sum + photo.commentsCount, 0)
    const totalPhotos = photos.length

    // Remove password from user object
    const { password, ...userWithoutPassword } = user

    const response = {
      ...userWithoutPassword,
      photos,
      stats: {
        totalPhotos,
        totalLikes,
        totalComments
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
} 