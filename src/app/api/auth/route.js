import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, dateOfBirth, password, username } = body;

    if (!firstName || !lastName || !email || !dateOfBirth || !password || !username) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
      firstName,
      lastName,
      email,
        dateOfBirth: new Date(dateOfBirth),
        password: hashedPassword,
        username,
        role: 'USER',
      },
    });

    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'Account created successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Detailed error:', error);

    if (error.code === 'P2002') {
      // Unique constraint violation (email or username is already taken)
      return NextResponse.json(
        { error: 'This email or username is already taken' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error creating account',
        details: error.message,
      }, 
      { status: 500 }
    );
  }
}