import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = params
    
    const comments = await prisma.comment.findMany({
      where: {
        photoId: parseInt(id)
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
    return NextResponse.json(
      { error: 'Error fetching comments' },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = params
    const { content, userId } = await request.json()

    const comment = await prisma.comment.create({
      data: {
        content,
        photo: {
          connect: { id: parseInt(id) }
        },
        user: {
          connect: { id: parseInt(userId) }
        }
      },
      include: {
        user: {
          select: {
            username: true,
            profileImage: true
          }
        }
      }
    })

    await prisma.photo.update({
      where: { id: parseInt(id) },
      data: {
        commentsCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Error creating comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { commentId, userId } = await request.json()

    if (!commentId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

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

    if (comment.userId !== parseInt(userId) && comment.photo.userId !== parseInt(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

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