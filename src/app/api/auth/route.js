// API - Création de compte utilisateur
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Création d'un nouvel utilisateur
export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, dateOfBirth, password, username, question1_id, question2_id, answer1, answer2 } = body;

    // vérification des champs obligatoires
    if (!firstName || !lastName || !email || !dateOfBirth || !password || !username || !question1_id || !question2_id || !answer1 || !answer2) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // questions secrètes différentes
    if (question1_id === question2_id) {
      return NextResponse.json(
        { error: 'Secret questions must be different' },
        { status: 400 }
      );
    }

    // hash du mot de passe et des réponses
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedAnswer1 = await bcrypt.hash(answer1, 10);
    const hashedAnswer2 = await bcrypt.hash(answer2, 10);

    // création utilisateur
    const user = await prisma.User.create({
      data: {
        firstName,
        lastName,
        email,
        dateOfBirth: new Date(dateOfBirth),
        password: hashedPassword,
        username,
        role: 'USER',
        question1_id: Number(question1_id),
        question2_id: Number(question2_id),
        answer1: hashedAnswer1,
        answer2: hashedAnswer2,
      },
    });

    // on retire le mot de passe de la réponse
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'Account created successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Detailed error:', error);

    if (error.code === 'P2002') {
      // email ou username déjà pris
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