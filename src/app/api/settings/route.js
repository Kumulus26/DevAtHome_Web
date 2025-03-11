import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'

export async function PUT(request) {
  const connection = await pool.getConnection()
  
  try {
    const { userId, firstName, lastName, username, currentPassword, newPassword } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    await connection.beginTransaction()

    // Get current user
    const [users] = await connection.query(
      'SELECT * FROM User WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      await connection.rollback()
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const user = users[0]

    // Check if username is taken by another user
    if (username && username !== user.username) {
      const [existingUsers] = await connection.query(
        'SELECT id FROM User WHERE username = ? AND id != ?',
        [username, userId]
      )
      
      if (existingUsers.length > 0) {
        await connection.rollback()
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
      }
    }

    // Build update query
    let updateFields = []
    let updateValues = []

    if (firstName) {
      updateFields.push('firstName = ?')
      updateValues.push(firstName)
    }
    if (lastName) {
      updateFields.push('lastName = ?')
      updateValues.push(lastName)
    }
    if (username) {
      updateFields.push('username = ?')
      updateValues.push(username)
    }

    // Handle password update
    if (currentPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        await connection.rollback()
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      updateFields.push('password = ?')
      updateValues.push(hashedPassword)
    }

    if (updateFields.length > 0) {
      // Add userId to values array for WHERE clause
      updateValues.push(userId)
      
      // Execute update query
      await connection.query(
        `UPDATE User SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      )
    }

    // Get updated user
    const [updatedUsers] = await connection.query(
      'SELECT id, firstName, lastName, email, username FROM User WHERE id = ?',
      [userId]
    )

    await connection.commit()

    return NextResponse.json({
      message: 'Settings updated successfully',
      user: updatedUsers[0]
    })

  } catch (error) {
    await connection.rollback()
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Error updating settings' },
      { status: 500 }
    )
  } finally {
    connection.release()
  }
}

export async function DELETE(request) {
  const connection = await pool.getConnection()
  
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    await connection.beginTransaction()

    // Delete user's comments
    await connection.query('DELETE FROM Comment WHERE userId = ?', [userId])

    // Delete user's likes
    await connection.query('DELETE FROM `Like` WHERE userId = ?', [userId])

    // Delete user's photos
    await connection.query('DELETE FROM Photo WHERE userId = ?', [userId])

    // Finally, delete the user
    await connection.query('DELETE FROM User WHERE id = ?', [userId])

    await connection.commit()
    return NextResponse.json({ message: 'Account deleted successfully' })

  } catch (error) {
    await connection.rollback()
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Error deleting account' },
      { status: 500 }
    )
  } finally {
    connection.release()
  }
} 