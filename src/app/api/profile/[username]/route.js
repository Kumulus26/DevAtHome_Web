import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const username = params.username;

    const user = await prisma.User.findUnique({
      where: { username },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        dateOfBirth: true,
        createdAt: true,
        role: true,
        username: true,
        bio: true,
        profileImage: true,
        photos: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            photos: true, // Counts the number of photos
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate total likes and comments from the fetched photos
    const totalLikes = user.photos.reduce((sum, photo) => sum + photo.likes, 0)
    const totalComments = user.photos.reduce((sum, photo) => sum + photo.commentsCount, 0)

    const response = {
      ...user,
      stats: {
        totalPhotos: user._count.photos,
        totalLikes,
        totalComments,
      },
    }
    // Remove the _count field from the final response
    delete response._count

    return NextResponse.json(response)
  } catch (error) {
    console.error(`Error fetching profile for ${params.username}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
} 

export const dynamic = 'force-dynamic'; 