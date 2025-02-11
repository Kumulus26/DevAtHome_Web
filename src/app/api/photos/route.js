import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    // Get the userId from the query parameters if user is logged in
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Fetch all photos with user info and likes
    const photos = await prisma.photo.findMany({
      orderBy: {
        createdAt: 'desc'  // Most recent photos first
      },
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
            userId: true
          }
        } : false
      }
    })

    // Format the response
    const formattedPhotos = photos.map(photo => ({
      id: photo.id,
      url: photo.url,
      title: photo.title,
      likes: photo.likes,
      commentsCount: photo.commentsCount,
      createdAt: photo.createdAt,
      user: photo.user,
      isLiked: userId ? photo.likedBy.length > 0 : false
    }))

    return NextResponse.json(formattedPhotos)
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { error: 'Error fetching photos' },
      { status: 500 }
    )
  }
} 