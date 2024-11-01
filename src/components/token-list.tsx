"use client"

import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { TokenService } from "@/lib/token-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { PublicKey } from "@solana/web3.js"

interface TokenAccount {
  pubkey: string
  mint: string
  amount: string
  decimals: number
}

export function TokenList() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { toast } = useToast()
  const [tokenAccounts, setTokenAccounts] = useState<{ pubkey: any; mint: any; amount: any; decimals: any; }[]>([])

  useEffect(() => {
    if (wallet.publicKey) {
      const fetchTokens = async () => {
        const tokenService = new TokenService(connection, wallet.publicKey!)
        const accounts = await tokenService.getTokenAccounts()
        setTokenAccounts(accounts)
      }
      fetchTokens()
    }
  }, [wallet.publicKey, connection])

  const handleTransfer = (mint: string) => {
    // Implement transfer logic
    toast({
      title: "Transfer initiated",
      description: `Transfer initiated for token ${mint}`,
    })
  }

  const handleBurn = (mint: string) => {
    // Implement burn logic
    toast({
      title: "Burn initiated",
      description: `Burn initiated for token ${mint}`,
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {tokenAccounts.map((account) => (
        <Card key={account.pubkey}>
          <CardHeader>
            <CardTitle>{account.mint}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Balance: {account.amount}</p>
            <div className="space-y-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor={`amount-${account.pubkey}`}>Amount</Label>
                <Input
                  id={`amount-${account.pubkey}`}
                  defaultValue="0"
                  className="col-span-2"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor={`recipient-${account.pubkey}`}>Recipient</Label>
                <Input
                  id={`recipient-${account.pubkey}`}
                  placeholder="Recipient address"
                  className="col-span-2"
                />
              </div>
              <div className="flex justify-between">
                <Button onClick={() => handleTransfer(account.mint)}>Transfer</Button>
                <Button variant="destructive" onClick={() => handleBurn(account.mint)}>Burn</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}