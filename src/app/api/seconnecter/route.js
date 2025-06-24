// API - Connexion utilisateur
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Récupère l'adresse IP
function getIP(request) {
  // Try to get real IP from headers (Vercel/Proxy aware)
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

// Connexion utilisateur
export async function POST(request) {
  try {
    const { email, password } = await request.json()
    const ip = getIP(request)
    const userAgent = request.headers.get('user-agent') || ''
    const now = new Date()

    // Vérifie blocage temporaire
    const lastBlock = await prisma.login_attempts.findFirst({
      where: {
        email,
        ip_address: ip,
        block_until: { gt: now },
      },
      orderBy: { block_until: 'desc' },
    })
    if (lastBlock) {
      const wait = Math.ceil((lastBlock.block_until.getTime() - now.getTime()) / 60000)
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${wait} minute(s).` },
        { status: 429 }
      )
    }

    // Cherche l'utilisateur
    const user = await prisma.User.findUnique({ where: { email } })
    let success = false
    let block_until = null

    if (user) {
      const isValidPassword = await bcrypt.compare(password, user.password)
      success = isValidPassword
    }

    // Log la tentative
    await prisma.login_attempts.create({
      data: {
        email,
        ip_address: ip,
        user_agent: userAgent,
        success,
        created_at: now,
        block_until: null,
      },
    })

    // Gestion des erreurs et blocages
    if (!user || !success) {
      // Count failed attempts in last 10min
      const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000)
      const recentFails = await prisma.login_attempts.findMany({
        where: {
          email,
          ip_address: ip,
          success: false,
          created_at: { gt: tenMinAgo },
        },
        orderBy: { created_at: 'desc' },
      })
      if (recentFails.length >= 3) {
        block_until = new Date(now.getTime() + 10 * 60 * 1000)
        await prisma.login_attempts.create({
          data: {
            email,
            ip_address: ip,
            user_agent: userAgent,
            success: false,
            created_at: now,
            block_until,
          },
        })
        return NextResponse.json(
          { error: 'Too many failed attempts. You are blocked for 10 minutes.' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Génère le token JWT
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '1h' }
    )
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({
      ...userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
} 