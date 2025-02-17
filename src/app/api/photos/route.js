import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const photos = await prisma.photo.findMany({
      orderBy: {
        createdAt: 'desc'
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