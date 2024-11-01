import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  if (req.method === 'POST') {
    try {
      const { nfts, userId } = await req.json()

      // Delete existing NFTs for this user
      await prisma.nFT.deleteMany({
        where: { userId },
      })

      // Create new NFTs
      const createdNFTs = await prisma.nFT.createMany({
        data: nfts.map((nft: any) => ({
          name: nft.name,
          description: nft.description,
          image: nft.image,
          mint: nft.address,
          userId,
        })),
      })

      return NextResponse.json({ success: true, count: createdNFTs.count })
    } catch (error) {
      console.error('Request error', error)
      return NextResponse.json({ error: 'Error creating NFTs' }, { status: 500 })
    }
  } else {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }
}