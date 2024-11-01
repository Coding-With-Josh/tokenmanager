"use client"

import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { NFTService } from "@/lib/nft-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface NFT {
  address: string
  name: string
  description: string
  image: string
}

export function NFTList() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { toast } = useToast()
  const [nfts, setNfts] = useState<NFT[]>([])

  useEffect(() => {
    if (wallet.publicKey) {
      const fetchNFTs = async () => {
        const nftService = new NFTService(connection, wallet)
        const fetchedNfts = await nftService.getNFTs()
        setNfts(fetchedNfts)
      }
      fetchNFTs()
    }
  }, [wallet.publicKey, connection, wallet])

  const handleTransfer = (address: string) => {
    // Implement transfer logic
    toast({
      title: "Transfer initiated",
      description: `Transfer initiated for NFT ${address}`,
    })
  }

  const handleBurn = (address: string) => {
    // Implement burn logic
    toast({
      title: "Burn initiated",
      description: `Burn initiated for NFT ${address}`,
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {nfts.map((nft) => (
        <Card key={nft.address}>
          <CardHeader>
            <CardTitle>{nft.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover mb-4" />
            <p className="mb-4">{nft.description}</p>
            <div className="flex justify-between">
              <Button onClick={() => handleTransfer(nft.address)}>Transfer</Button>
              <Button variant="destructive" onClick={() => handleBurn(nft.address)}>Burn</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}