import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

// Update user settings
export async function PUT(request) {
  try {
    const { userId, firstName, lastName, username, currentPassword, newPassword } =
      await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const dataToUpdate = {}

    if (firstName) dataToUpdate.firstName = firstName
    if (lastName) dataToUpdate.lastName = lastName
    if (username) dataToUpdate.username = username

    // Handle password update
    if (currentPassword && newPassword) {
      const user = await prisma.User.findUnique({ where: { id: userId } })
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
      dataToUpdate.password = await bcrypt.hash(newPassword, 10)
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { message: 'No changes to apply' },
        { status: 200 }
      )
    }

    const updatedUser = await prisma.User.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
      },
    })

    return NextResponse.json({
      message: 'Settings updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      )
    }
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Error updating settings' },
      { status: 500 }
    )
  }
}

// Delete user account
export async function DELETE(request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Prisma's cascaded delete (configured in schema.prisma) will handle deleting
    // all related photos, comments, and likes automatically and atomically.
    await prisma.User.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    // P2025 is the error code for "Record to delete does not exist."
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Error deleting account' },
      { status: 500 }
    )
  }
} 