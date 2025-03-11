import { NextResponse } from 'next/server'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import pool from '@/lib/db'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export async function DELETE(request, { params }) {
  const connection = await pool.getConnection()
  
  try {
    const id = await params.id
    const photoId = parseInt(id)

    await connection.beginTransaction()

    // Get photo information
    const [photos] = await connection.query(
      `SELECT p.*, u.id as userId 
       FROM Photo p
       JOIN User u ON p.userId = u.id
       WHERE p.id = ?`,
      [photoId]
    )

    if (photos.length === 0) {
      await connection.rollback()
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    const photo = photos[0]

    const urlParts = photo.url.split('/')
    const key = urlParts.slice(3).join('/')

    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
      }))
    } catch (s3Error) {
      console.error('Error deleting from S3:', s3Error)
      // Continue with database cleanup even if S3 deletion fails
    }

    // Delete related comments
    await connection.query(
      'DELETE FROM Comment WHERE photoId = ?',
      [photoId]
    )

    // Delete related likes
    await connection.query(
      'DELETE FROM `Like` WHERE photoId = ?',
      [photoId]
    )

    // Delete the photo
    await connection.query(
      'DELETE FROM Photo WHERE id = ?',
      [photoId]
    )

    await connection.commit()
    return NextResponse.json({ success: true })
  } catch (error) {
    await connection.rollback()
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  } finally {
    connection.release()
  }
} 