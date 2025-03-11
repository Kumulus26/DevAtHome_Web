import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(request) {
  try {
    const { username, bio } = await request.json()

    // Update user bio
    await pool.query(
      'UPDATE User SET bio = ? WHERE username = ?',
      [bio, username]
    )

    // Get updated user
    const [users] = await pool.query(
      'SELECT id, username, firstName, lastName, bio, profileImage, email FROM User WHERE username = ?',
      [username]
    )

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(users[0])
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 