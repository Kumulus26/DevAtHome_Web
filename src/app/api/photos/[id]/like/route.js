import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request, context) {
  try {
    const params = await context.params
    const photoId = parseInt(params.id)
    
    // Get the user from the request body
    const { userId } = await request.json()
    
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized - User ID required' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if the user has already liked the photo
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_photoId: {
          userId: userId,
          photoId: photoId
        }
      }
    })

    if (existingLike) {
      // User has already liked the photo, so unlike it
      await prisma.$transaction([
        prisma.like.delete({
          where: {
            userId_photoId: {
              userId: userId,
              photoId: photoId
            }
          }
        }),
        prisma.photo.update({
          where: { id: photoId },
          data: {
            likes: {
              decrement: 1
            }
          }
        })
      ])

      return new NextResponse(
        JSON.stringify({ success: true, liked: false }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    } else {
      // User hasn't liked the photo yet, so like it
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId: userId,
            photoId: photoId
          }
        }),
        prisma.photo.update({
          where: { id: photoId },
          data: {
            likes: {
              increment: 1
            }
          }
        })
      ])

      return new NextResponse(
        JSON.stringify({ success: true, liked: true }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Error handling like:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
} 