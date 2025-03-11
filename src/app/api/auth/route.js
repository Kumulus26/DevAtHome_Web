import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const { firstName, lastName, email, dateOfBirth, password, username } = body;

    if (!firstName || !lastName || !email || !dateOfBirth || !password || !username) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    console.log('Creating user with data:', {
      firstName,
      lastName,
      email,
      dateOfBirth,
      username
    });

    // Check if email or username already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM User WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'This email or username is already taken' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const formattedDate = new Date(dateOfBirth).toISOString().split('T')[0];

    // Insert the new user
    const [result] = await pool.query(
      'INSERT INTO User (firstName, lastName, email, dateOfBirth, password, username, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, email, formattedDate, hashedPassword, username, 1] // 1 is the role ID for USER
    );

    console.log('User created successfully:', result.insertId);

    // Get the created user
    const [users] = await pool.query(
      'SELECT id, firstName, lastName, email, dateOfBirth, username, role, createdAt FROM User WHERE id = ?',
      [result.insertId]
    );

    const user = users[0];

    return NextResponse.json(
      { message: 'Account created successfully', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack
    });

    // Check for duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'This email or username is already taken' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error creating account',
        details: error.message,
        code: error.code
      }, 
      { status: 500 }
    );
  }
}