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
            profileImage: true,
            id: true
          }
        },
        photo: {
          select: {
            userId: true
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
              profileImage: true,
              id: true
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

// DELETE /api/photos/[id]/comments - Delete a comment
export async function DELETE(request, { params }) {
  try {
    const { commentId, userId } = await request.json()

    if (!commentId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the comment to check permissions
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
      include: {
        photo: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Check if user is authorized to delete the comment
    if (comment.userId !== parseInt(userId) && comment.photo.userId !== parseInt(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Use a transaction to ensure both operations succeed or fail together
    await prisma.$transaction([
      prisma.comment.delete({
        where: { id: parseInt(commentId) }
      }),
      prisma.photo.update({
        where: { id: parseInt(params.id) },
        data: {
          commentsCount: {
            decrement: 1
          }
        }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 })
  }
} 