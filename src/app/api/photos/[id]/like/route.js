// API - Like/Unlike d'une photo
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Like ou Unlike une photo
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

    // Vérifie si le like existe déjà
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
      // Si déjà liké, on unlike
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
      // Sinon, on like
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