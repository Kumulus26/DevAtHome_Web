import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request, { params }) {
  try {
    const { id } = params
    const { userId } = await request.json()

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_photoId: {
          userId: parseInt(userId),
          photoId: parseInt(id)
        }
      }
    })

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_photoId: {
            userId: parseInt(userId),
            photoId: parseInt(id)
          }
        }
      })

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