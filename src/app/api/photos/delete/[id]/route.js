import { NextResponse } from 'next/server'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import prisma from '@/lib/prisma'
import path from 'path'

export const dynamic = 'force-dynamic' // Force dynamic handling

// Force-load environment variables using an explicit path
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })

const BUCKET_NAME = process.env.AWS_BUCKET_NAME
const REGION = process.env.AWS_REGION

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export async function DELETE(request, { params }) {
  try {
    const photoId = parseInt(params.id)

    if (isNaN(photoId)) {
      return NextResponse.json({ error: 'Invalid photo ID' }, { status: 400 })
    }

    // Find the photo to get its S3 URL
    const photo = await prisma.Photo.findUnique({
      where: { id: photoId },
    })

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Delete the photo record from the database.
    // Thanks to `onDelete: Cascade` in our schema, Prisma will automatically
    // delete all related Likes and Comments in the same transaction.
    await prisma.Photo.delete({
      where: { id: photoId },
    })

    // After successfully deleting from the DB, delete from S3
    try {
    const urlParts = photo.url.split('/')
      const key = urlParts.slice(3).join('/') // Extracts the key (e.g., "photos/user/filename.jpg")

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        })
      )
    } catch (s3Error) {
      // Log the S3 error, but don't block the success response
      // since the photo is already deleted from our database.
      console.error('Failed to delete object from S3, but DB record was deleted:', s3Error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting photo ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
} 