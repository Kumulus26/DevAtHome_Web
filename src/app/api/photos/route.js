import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const photos = await prisma.Photo.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        // If a userId is provided, check if that user has liked the photo
        likedBy: userId
          ? {
              where: {
                userId: parseInt(userId),
              },
              select: {
                userId: true, // We only need to know if a record exists
              },
            }
          : false, // Do not include likedBy if no userId is given
      },
    })

    // Format the photos to include an `isLiked` boolean
    const formattedPhotos = photos.map((photo) => {
      const { likedBy, ...rest } = photo
      return {
        ...rest,
        // The photo is liked if the likedBy array has one or more items
        isLiked: likedBy ? likedBy.length > 0 : false,
      }
    })

    return NextResponse.json(formattedPhotos)
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { error: 'Error fetching photos' },
      { status: 500 }
    )
  }
} 