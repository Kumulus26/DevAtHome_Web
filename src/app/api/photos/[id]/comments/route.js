import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request, { params }) {
  try {
    const id = await params.id
    const photoId = parseInt(id)

    const [comments] = await pool.query(`
      SELECT 
        Comment.id,
        Comment.content,
        Comment.createdAt,
        Comment.userId,
        Comment.photoId,
        JSON_OBJECT(
          'id', User.id,
          'username', User.username,
          'profileImage', User.profileImage
        ) as user
      FROM Comment 
      JOIN User ON Comment.userId = User.id
      WHERE Comment.photoId = ?
      ORDER BY Comment.createdAt DESC
    `, [photoId])

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Error fetching comments' },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  const connection = await pool.getConnection()
  
  try {
    const id = await params.id
    const photoId = parseInt(id)
    const { content, userId } = await request.json()

    if (!content || !userId) {
      return NextResponse.json(
        { error: 'Content and userId are required' },
        { status: 400 }
      )
    }

    await connection.beginTransaction()

    const [result] = await connection.query(
      'INSERT INTO Comment (content, userId, photoId) VALUES (?, ?, ?)',
      [content, userId, photoId]
    )

    // Update comments count
    await connection.query(
      'UPDATE Photo SET commentsCount = commentsCount + 1 WHERE id = ?',
      [photoId]
    )

    // Fetch the newly created comment with user details
    const [newComment] = await connection.query(`
      SELECT 
        Comment.id,
        Comment.content,
        Comment.createdAt,
        Comment.userId,
        Comment.photoId,
        JSON_OBJECT(
          'id', User.id,
          'username', User.username,
          'profileImage', User.profileImage
        ) as user
      FROM Comment 
      JOIN User ON Comment.userId = User.id
      WHERE Comment.id = ?
    `, [result.insertId])

    await connection.commit()
    return NextResponse.json(newComment[0])
  } catch (error) {
    await connection.rollback()
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Error creating comment' },
      { status: 500 }
    )
  } finally {
    connection.release()
  }
}

export async function DELETE(request, { params }) {
  const connection = await pool.getConnection()
  
  try {
    const id = await params.id
    const { commentId, userId } = await request.json()

    if (!commentId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connection.beginTransaction()

    const [comment] = await connection.query(`
      SELECT * FROM Comment WHERE id = ?
    `, [commentId])

    if (comment.length === 0) {
      await connection.rollback()
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const [photo] = await connection.query(`
      SELECT userId FROM Photo WHERE id = ?
    `, [id])

    if (photo.length === 0) {
      await connection.rollback()
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    if (comment[0].userId !== parseInt(userId) && photo[0].userId !== parseInt(userId)) {
      await connection.rollback()
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await connection.query('DELETE FROM Comment WHERE id = ?', [commentId])
    await connection.query('UPDATE Photo SET commentsCount = commentsCount - 1 WHERE id = ?', [id])

    await connection.commit()
    return NextResponse.json({ success: true })
  } catch (error) {
    await connection.rollback()
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  } finally {
    connection.release()
  }
} 