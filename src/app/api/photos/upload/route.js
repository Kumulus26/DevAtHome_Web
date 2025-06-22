import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import prisma from '@/lib/prisma'
import path from 'path'

// Force-load environment variables using an explicit path
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })

const BUCKET_NAME = process.env.AWS_BUCKET_NAME
const REGION = process.env.AWS_REGION

console.log('UPLOAD ROUTE - BUCKET_NAME:', BUCKET_NAME) // DEBUG
console.log('UPLOAD ROUTE - REGION:', REGION) // DEBUG

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

console.log('S3 Client Initialized:', s3Client); // <-- ADDING THIS DEBUG LOG

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const userId = parseInt(formData.get('userId'))
    const title = formData.get('title')
    const isProfilePicture = formData.get('isProfilePicture') === 'true'

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and user ID are required' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `photos/${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read'
    }

    await s3Client.send(new PutObjectCommand(uploadParams))
    const fileUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${filename}`

    if (isProfilePicture) {
      const updatedUser = await prisma.User.update({
        where: { id: userId },
        data: { profileImage: fileUrl },
      })
      const { password, ...userWithoutPassword } = updatedUser
      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
        imageUrl: fileUrl,
        })
      } else {
      const newPhoto = await prisma.Photo.create({
        data: {
          url: fileUrl,
          title: title || 'Untitled',
          userId: userId,
        },
        include: {
          user: true,
        },
      })

        return NextResponse.json({
          success: true,
        photo: newPhoto,
        })
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process upload', details: error.message },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
} 