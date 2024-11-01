"use client"

import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { NFTService } from "@/lib/nft-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface Collection {
  address: string
  name: string
  description: string
  image: string
  size: number
}

export function CollectionList() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { toast } = useToast()
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    if (wallet.publicKey) {
      const fetchCollections = async () => {
        const nftService = new NFTService(connection, wallet)
        const fetchedCollections = await nftService.getCollections()
        setCollections(fetchedCollections)
      }
      fetchCollections()
    }
  }, [wallet.publicKey, connection, wallet])

  const handleViewCollection = (address: string) => {
    // Implement view collection logic
    toast({
      title: "Viewing collection",
      description: `Viewing collection ${address}`,
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <Card key={collection.address}>
          <CardHeader>
            <CardTitle>{collection.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <img src={collection.image} alt={collection.name} className="w-full h-48 object-cover mb-4" />
            <p className="mb-2">{collection.description}</p>
            <p className="mb-4">NFTs in collection: {collection.size}</p>
            <Button onClick={() => handleViewCollection(collection.address)}>View Collection</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}