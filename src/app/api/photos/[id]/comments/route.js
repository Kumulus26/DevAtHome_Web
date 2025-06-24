// API - Commentaires d'une photo
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Récupère tous les commentaires d'une photo
export async function GET(request, { params }) {
  try {
    const photoId = parseInt(params.id)
    if (isNaN(photoId)) {
      return NextResponse.json({ error: 'Invalid photo ID' }, { status: 400 })
    }
    const comments = await prisma.Comment.findMany({
      where: { photoId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    })
    return NextResponse.json(comments)
  } catch (error) {
    console.error(`Error fetching comments for photo ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Error fetching comments' },
      { status: 500 }
    )
  }
}

// Add a new comment to a photo
export async function POST(request, { params }) {
  try {
    const photoId = parseInt(params.id)
    const { content, userId } = await request.json()

    if (isNaN(photoId) || !content || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use a transaction to create the comment and update the photo's comment count
    const [, newComment] = await prisma.$transaction([
      prisma.Photo.update({
        where: { id: photoId },
        data: { commentsCount: { increment: 1 } },
      }),
      prisma.Comment.create({
        data: {
          content,
          userId,
          photoId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profileImage: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json(newComment)
  } catch (error) {
    console.error(`Error creating comment for photo ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Error creating comment' },
      { status: 500 }
    )
  }
}

// Suppression d'un commentaire
export async function DELETE(request, { params }) {
  try {
    const photoId = parseInt(params.id)
    const { commentId, userId } = await request.json()
    if (isNaN(photoId) || !commentId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    // Vérifie droits de suppression (auteur ou propriétaire de la photo)
    const comment = await prisma.Comment.findUnique({
      where: { id: commentId },
      include: { photo: true },
    })
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }
    const isCommentAuthor = comment.userId === userId
    const isPhotoOwner = comment.photo.userId === userId
    if (!isCommentAuthor && !isPhotoOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    // Suppression + décrémentation du compteur
    await prisma.$transaction([
      prisma.Comment.delete({
        where: { id: commentId },
      }),
      prisma.Photo.update({
        where: { id: photoId },
        data: { commentsCount: { decrement: 1 } },
      }),
    ])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting comment for photo ${params.id}:`, error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
} 