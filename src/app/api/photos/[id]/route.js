import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request, context) {
  try {
    const params = await context.params
    const photoId = parseInt(params.id)
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (isNaN(photoId)) {
      return NextResponse.json(
        { error: 'Invalid photo ID' },
        { status: 400 }
      )
    }

    // Get photo with user information
    const [photos] = await pool.query(
      `SELECT 
        p.id, p.url, p.title, p.likes, p.commentsCount, p.createdAt,
        u.id as userId, u.username, u.profileImage
      FROM Photo p
      JOIN User u ON p.userId = u.id
      WHERE p.id = ?`,
      [photoId]
    )

    if (photos.length === 0) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    const photo = photos[0]
    
    // Check if the photo is liked by the user
    let isLiked = false
    if (userId) {
      const [likes] = await pool.query(
        'SELECT * FROM `Like` WHERE photoId = ? AND userId = ?',
        [photoId, parseInt(userId)]
      )
      isLiked = likes.length > 0
    }

    // Format the response
    const response = {
      id: photo.id,
      url: photo.url,
      title: photo.title,
      likes: photo.likes,
      commentsCount: photo.commentsCount,
      createdAt: photo.createdAt,
      user: {
        id: photo.userId,
        username: photo.username,
        profileImage: photo.profileImage
      },
      isLiked
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching photo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}