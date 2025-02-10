import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/photos/[id]/comments - Get comments for a photo
export async function GET(request, { params }) {
  try {
    const comments = await prisma.comment.findMany({
      where: {
        photoId: parseInt(params.id)
      },
      include: {
        user: {
          select: {
            username: true,
            profileImage: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST /api/photos/[id]/comments - Create a new comment
export async function POST(request, { params }) {
  try {
    const { content, userId } = await request.json()

    if (!content || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use a transaction to ensure both operations succeed or fail together
    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          content,
          userId: parseInt(userId),
          photoId: parseInt(params.id)
        },
        include: {
          user: {
            select: {
              username: true,
              profileImage: true
            }
          }
        }
      }),
      prisma.photo.update({
        where: { id: parseInt(params.id) },
        data: {
          commentsCount: {
            increment: 1
          }
        }
      })
    ])

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
} 