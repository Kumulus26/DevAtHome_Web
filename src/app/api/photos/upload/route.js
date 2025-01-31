import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import prisma from '@/lib/prisma'

// Use the original bucket name
const BUCKET_NAME = 'devathome-photos'
const REGION = 'eu-west-3'

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const username = formData.get('username')
    const isProfilePicture = formData.get('isProfilePicture') === 'true'

    if (!file || !username) {
      return NextResponse.json(
        { error: 'File and username are required' },
        { status: 400 }
      )
    }

    // Find user first
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${username}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`

    // Upload to S3
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
    }

    let fileUrl
    try {
      await s3Client.send(new PutObjectCommand(uploadParams))
      console.log('File uploaded successfully to S3')

      // Create URL for the uploaded file
      fileUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${filename}`
      console.log('Generated file URL:', fileUrl)
    } catch (s3Error) {
      console.error('S3 upload error:', s3Error)
      return NextResponse.json(
        { error: 'Failed to upload to S3', details: s3Error.message },
        { status: 500 }
      )
    }

    try {
      if (isProfilePicture) {
        // Update user's profile picture
        const updatedUser = await prisma.user.update({
          where: { username },
          data: { profileImage: fileUrl },
        })

        return NextResponse.json({
          success: true,
          user: updatedUser,
          imageUrl: fileUrl
        })
      } else {
        // Create new photo with default values for likes and comments
        const photo = await prisma.photo.create({
          data: {
            url: fileUrl,
            userId: user.id,
            likes: 0,
            comments: 0
          }
        })

        return NextResponse.json({
          success: true,
          photo
        })
      }
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save to database', details: dbError.message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('General error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
} 