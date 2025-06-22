import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request, { params }) {
  try {
    const photoId = parseInt(params.id)
    const { userId } = await request.json()

    if (isNaN(photoId) || !userId) {
      return NextResponse.json(
        { error: 'Valid Photo ID and User ID are required' },
        { status: 400 }
      )
    }

    // Find if the like already exists
    const existingLike = await prisma.Like.findUnique({
      where: {
        userId_photoId: {
          userId,
          photoId,
        },
      },
    })

    let updatedPhoto
    let liked

    if (existingLike) {
      // If like exists, "unlike" the photo
      [, updatedPhoto] = await prisma.$transaction([
        prisma.Like.delete({
          where: {
            id: existingLike.id,
          },
        }),
        prisma.Photo.update({
          where: { id: photoId },
          data: {
            likes: {
              decrement: 1,
            },
          },
        }),
      ])
      liked = false
    } else {
      // If like doesn't exist, "like" the photo
      [, updatedPhoto] = await prisma.$transaction([
        prisma.Like.create({
          data: {
            userId,
            photoId,
          },
        }),
        prisma.Photo.update({
          where: { id: photoId },
          data: {
            likes: {
              increment: 1,
            },
          },
        }),
      ])
      liked = true
    }

      return NextResponse.json({ 
      liked,
      likes: updatedPhoto.likes,
      })
  } catch (error) {
    console.error(`Error handling like for photo ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Error handling like' },
      { status: 500 }
    )
  }
} 