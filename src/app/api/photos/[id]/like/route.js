import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request, { params }) {
  // Get a connection from the pool to use for transaction
  const connection = await pool.getConnection()
  
  try {
    const id = await params.id
    const photoId = parseInt(id)
    const { userId } = await request.json()

    if (!photoId || !userId) {
      return NextResponse.json(
        { error: 'Photo ID and User ID are required' },
        { status: 400 }
      )
    }

    // Start transaction
    await connection.beginTransaction()

    // Check if like already exists
    const [existingLikes] = await connection.query(
      'SELECT * FROM `Like` WHERE photoId = ? AND userId = ?',
      [photoId, userId]
    )

    if (existingLikes.length > 0) {
      // Unlike: Remove the like
      await connection.query(
        'DELETE FROM `Like` WHERE photoId = ? AND userId = ?',
        [photoId, userId]
      )

      // Decrease likes count
      await connection.query(
        'UPDATE Photo SET likes = GREATEST(likes - 1, 0) WHERE id = ?',
        [photoId]
      )

      // Get updated like count
      const [updatedPhoto] = await connection.query(
        'SELECT likes FROM Photo WHERE id = ?',
        [photoId]
      )

      await connection.commit()

      return NextResponse.json({ 
        liked: false,
        likes: updatedPhoto[0].likes
      })
    } else {
      // Like: Add new like
      await connection.query(
        'INSERT INTO `Like` (userId, photoId) VALUES (?, ?)',
        [userId, photoId]
      )

      // Increase likes count
      await connection.query(
        'UPDATE Photo SET likes = likes + 1 WHERE id = ?',
        [photoId]
      )

      // Get updated like count
      const [updatedPhoto] = await connection.query(
        'SELECT likes FROM Photo WHERE id = ?',
        [photoId]
      )

      await connection.commit()

      return NextResponse.json({ 
        liked: true,
        likes: updatedPhoto[0].likes
      })
    }
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback()
    
    console.error('Error handling like:', error)
    return NextResponse.json(
      { error: 'Error handling like' },
      { status: 500 }
    )
  } finally {
    // Release the connection back to the pool
    connection.release()
  }
} 