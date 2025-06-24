// API - Mise à jour de la bio utilisateur
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Mise à jour de la bio
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
    // Erreur si l'utilisateur n'existe pas
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