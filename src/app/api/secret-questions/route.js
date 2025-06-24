// API - Questions secrètes
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Récupère toutes les questions secrètes
export async function GET() {
  try {
    const questions = await prisma.secret_questions.findMany({
      select: { id: true, question: true }
    });
    return NextResponse.json(questions);
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
} 