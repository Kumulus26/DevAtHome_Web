import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST: Get questions by email
export async function POST(request) {
  try {
    const { email } = await request.json();
    const user = await prisma.User.findUnique({
      where: { email },
      select: {
        id: true,
        secret_questions_User_question1_idTosecret_questions: { select: { id: true, question: true } },
        secret_questions_User_question2_idTosecret_questions: { select: { id: true, question: true } },
      },
    });
    if (!user || !user.secret_questions_User_question1_idTosecret_questions || !user.secret_questions_User_question2_idTosecret_questions) {
      return NextResponse.json({ error: 'User not found or no questions set' }, { status: 404 });
    }
    return NextResponse.json({
      userId: user.id,
      questions: [user.secret_questions_User_question1_idTosecret_questions, user.secret_questions_User_question2_idTosecret_questions],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching questions' }, { status: 500 });
  }
}

// PUT: Verify answers
export async function PUT(request) {
  try {
    const { userId, answer1, answer2 } = await request.json();
    const user = await prisma.User.findUnique({
      where: { id: userId },
      select: { answer1: true, answer2: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const valid1 = await bcrypt.compare(answer1, user.answer1 || '');
    const valid2 = await bcrypt.compare(answer2, user.answer2 || '');
    if (!valid1 || !valid2) {
      return NextResponse.json({ error: 'Answers incorrect' }, { status: 401 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error verifying answers' }, { status: 500 });
  }
}

// PATCH: Update password
export async function PATCH(request) {
  try {
    const { userId, newPassword } = await request.json();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.User.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error updating password' }, { status: 500 });
  }
} 