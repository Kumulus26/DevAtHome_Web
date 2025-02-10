import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, context) {
  try {
    const params = await context.params
    const username = params.username

    // Get user data with photos and aggregated stats
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        photos: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            url: true,
            title: true,
            createdAt: true,
            likes: true,
            commentsCount: true,
            likedBy: {
              select: {
                id: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate total likes and comments
    const totalLikes = user.photos.reduce((sum, photo) => sum + photo.likes, 0)
    const totalComments = user.photos.reduce((sum, photo) => sum + photo.comments, 0)
    const totalPhotos = user.photos.length

    // Prepare the response
    const response = {
      ...user,
      stats: {
        totalPhotos,
        totalLikes,
        totalComments
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
} 