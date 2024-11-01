"use client"

import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { TokenService } from "@/lib/token-service"
import { NFTService } from "@/lib/nft-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateTokenForm } from "@/components/forms/create-token-form"
import { CreateNFTForm } from "@/components/forms/create-nft-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw } from "lucide-react"
import { PublicKey } from "@solana/web3.js"
import { useUser } from "@clerk/nextjs"

interface TokenAccount {
  pubkey: string;
  mint: string;
  amount: string;
  decimals: number;
}

interface NFTCollection {
  address: string;
  name: string;
  description: string;
  size: number;
}


export function Dashboard() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { toast } = useToast()
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [tokenAccounts, setTokenAccounts] = useState<{ pubkey: PublicKey; mint: any; amount: any; decimals: any; }[]>([])
  const [nftCollections, setNftCollections] = useState<NFTCollection[]>([])

  const refreshAccounts = async () => {
    if (!wallet.publicKey) return

    setIsLoading(true)
    try {
      const tokenService = new TokenService(connection, wallet.publicKey)
      const accounts = await tokenService.getTokenAccounts()
      setTokenAccounts(accounts)

      // Save token accounts to database
      await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens: accounts, userId: user?.id }),
      })

      const nftService = new NFTService(connection, wallet)
      const collections = await nftService.getCollections()
      setNftCollections(collections)

      // Save NFT collections to database
      await fetch('/api/nfts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfts: collections, userId: user?.id }),
      })

      toast({
        title: "Accounts refreshed",
        description: "Your token accounts and NFT collections have been updated.",
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error refreshing accounts",
        description: "An error occurred while fetching your accounts. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (wallet.connected) {
      refreshAccounts()
    }
  }, [wallet.connected])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button onClick={refreshAccounts} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Types</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              {tokenAccounts.length} unique token types
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NFT Collections</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nftCollections.length}</div>
            <p className="text-xs text-muted-foreground">
              {nftCollections.length} NFT collections owned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sales</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="tokens" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
        </TabsList>
        <TabsContent value="tokens" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tokenAccounts.map((account, index) => (
              <Card key={account.pubkey.toString()}>  // Convert PublicKey to string
                <CardHeader>
                  <CardTitle>{account.mint}</CardTitle>
                  <CardDescription>Balance: {account.amount}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor={`amount-${index}`}>Amount</Label>
                      <Input
                        id={`amount-${index}`}
                        defaultValue="0"
                        className="col-span-2 h-8"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                      <Label htmlFor={`recipient-${index}`}>Recipient</Label>
                      <Input
                        id={`recipient-${index}`}
                        placeholder="Recipient address"
                        className="col-span-2 h-8"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardContent className="flex justify-between">
                  <Button variant="outline" className="w-[calc(50%-0.5rem)]">Transfer</Button>
                  <Button variant="destructive" className="w-[calc(50%-0.5rem)]">Burn</Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Create New Token</CardTitle>
              <CardDescription>
                Create a new SPL token or Token-2022 token
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateTokenForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="nfts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {nftCollections.map((collection) => (
              <Card key={collection.address}>
                <CardHeader>
                  <CardTitle>{collection.name}</CardTitle>
                  <CardDescription>{collection.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>NFTs in collection: {collection.size}</p>
                </CardContent>
                <CardContent className="flex justify-between">
                  <Button variant="outline" className="w-[calc(50%-0.5rem)]">View</Button>
                  <Button variant="destructive" className="w-[calc(50%-0.5rem)]">Burn</Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Create New NFT</CardTitle>
              <CardDescription>
                Mint a new NFT or create a new collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateNFTForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}