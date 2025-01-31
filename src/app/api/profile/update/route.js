import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request) {
  try {
    const { username, bio } = await request.json()

    const updatedUser = await prisma.user.update({
      where: { username },
      data: { bio },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        bio: true,
        profileImage: true,
        email: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 