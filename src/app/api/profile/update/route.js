import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request) {
  try {
    const { username, bio } = await request.json()

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.User.update({
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
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    // P2025 is the error code for "Record to update does not exist."
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 