import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const photoId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (isNaN(photoId)) {
      return NextResponse.json(
        { error: 'Invalid photo ID' },
        { status: 400 }
      )
    }

    const photo = await prisma.Photo.findUnique({
      where: { id: photoId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
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

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    const { likedBy, ...rest } = photo
    const isLiked = likedBy ? likedBy.length > 0 : false

    return NextResponse.json({ ...rest, isLiked })
  } catch (error) {
    console.error(`Error fetching photo ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}