import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request) {
  try {
    const body = await request.json()
    const { userId, firstName, lastName, username, currentPassword, newPassword } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (username && username !== user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      })
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
    }

    const updateData = {}
    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (username) updateData.username = username

    if (currentPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return NextResponse.json({
      message: 'Settings updated successfully',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        username: updatedUser.username,
      }
    })

  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Error updating settings' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await request.json()

    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({ message: 'Account deleted successfully' })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Error deleting account' },
      { status: 500 }
    )
  }
} 