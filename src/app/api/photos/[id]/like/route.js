import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const photoId = parseInt(params.id)
    const userId = session.user.id

    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        photoId_userId: {
          photoId,
          userId
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          photoId_userId: {
            photoId,
            userId
          }
        }
      })
      return new NextResponse(JSON.stringify({ liked: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      // Like
      await prisma.like.create({
        data: {
          photoId,
          userId
        }
      })
      return new NextResponse(JSON.stringify({ liked: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  } catch (error) {
    console.error('Error handling like:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 