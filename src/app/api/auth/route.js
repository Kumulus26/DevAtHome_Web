import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const { firstName, lastName, email, dateOfBirth, password, username } = body;

    // Validate required fields
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with minimal required fields
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        dateOfBirth: new Date(dateOfBirth),
        password: hashedPassword,
        username,
        role: 'USER'
      }
    });

    console.log('User created successfully:', user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'Account created successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });

    // Check for specific Prisma errors
    if (error.code === 'P2002') {
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