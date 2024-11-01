import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { tokens, userId } = await req.json()

      // Delete existing tokens for this user
      await prisma.token.deleteMany({
        where: { userId },
      })

      // Create new tokens
      const createdTokens = await prisma.token.createMany({
        data: tokens.map((token: any) => ({
          name: token.name || 'Unknown Token',
          symbol: token.symbol || 'UNK',
          decimals: token.decimals || 0,
          mint: token.mint,
          balance: token.amount,
          userId,
        })),
      })

      return NextResponse.json({ success: true, count: createdTokens.count })
    } catch (error) {
      console.error('Request error', error)
      return NextResponse.json({ error: 'Error creating tokens' }, { status: 500 })
    }
  } else {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }
}