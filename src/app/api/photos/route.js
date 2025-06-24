// API - Récupération des photos (GET)
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Récupère toutes les photos
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
        // Si userId fourni, check si l'utilisateur a liké la photo
        likedBy: userId
          ? {
              where: {
                userId: parseInt(userId),
              },
              select: {
                userId: true,
              },
            }
          : false,
      },
    })

    // Ajoute isLiked à chaque photo
    const formattedPhotos = photos.map((photo) => {
      const { likedBy, ...rest } = photo
      return {
        ...rest,
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