import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request, { params }) {
  try {
    const { id } = params
    const { userId } = await request.json()

    // Check if the user has already liked the photo
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_photoId: {
          userId: parseInt(userId),
          photoId: parseInt(id)
        }
      }
    })

    if (existingLike) {
      // Unlike the photo
      await prisma.like.delete({
        where: {
          userId_photoId: {
            userId: parseInt(userId),
            photoId: parseInt(id)
          }
        }
      })

      // Decrement the likes count
      await prisma.photo.update({
        where: { id: parseInt(id) },
        data: {
          likes: {
            decrement: 1
          }
        }
      })

      return NextResponse.json({ liked: false })
    } else {
      // Like the photo
      await prisma.like.create({
        data: {
          user: {
            connect: { id: parseInt(userId) }
          },
          photo: {
            connect: { id: parseInt(id) }
          }
        }
      })

      // Increment the likes count
      await prisma.photo.update({
        where: { id: parseInt(id) },
        data: {
          likes: {
            increment: 1
          }
        }
      })

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Error handling like:', error)
    return NextResponse.json(
      { error: 'Error handling like' },
      { status: 500 }
    )
  }
} 