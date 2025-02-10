import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, context) {
  try {
    const params = await context.params
    const photoId = parseInt(params.id)
    
    // Get the userId from the query parameters
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (isNaN(photoId)) {
      return NextResponse.json(
        { error: 'Invalid photo ID' },
        { status: 400 }
      )
    }

    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true
          }
        },
        likedBy: userId ? {
          where: {
            userId: parseInt(userId)
          },
          select: {
            id: true
          }
        } : false
      }
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Add isLiked field to the response
    const response = {
      ...photo,
      isLiked: userId ? photo.likedBy.length > 0 : false
    }
    
    // Remove likedBy from response as we don't need to send it to the client
    delete response.likedBy

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching photo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}