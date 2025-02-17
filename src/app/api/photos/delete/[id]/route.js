import { NextResponse } from 'next/server'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import prisma from '@/lib/prisma'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    const photo = await prisma.photo.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true
          }
        }
      }
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    const urlParts = photo.url.split('/')
    const key = urlParts.slice(3).join('/')

    try {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
      }))
    } catch (s3Error) {
      console.error('Error deleting from S3:', s3Error)
    }

    await prisma.comment.deleteMany({
      where: { photoId: parseInt(id) }
    })

    await prisma.like.deleteMany({
      where: { photoId: parseInt(id) }
    })

    await prisma.photo.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
} 