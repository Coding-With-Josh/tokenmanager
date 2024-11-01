"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { TokenService } from "@/lib/token-service"
import { Loader2 } from "lucide-react"
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"

const formSchema = z.object({
  name: z.string().min(1).max(32),
  symbol: z.string().min(1).max(10),
  decimals: z.number().min(0).max(9),
  standard: z.enum(["token", "token-2022"]),
  initialSupply: z.number().min(0),
  freezeAuthority: z.boolean().default(false),
})

export function CreateTokenForm() {
  const { connection } = useConnection()
  const { publicKey, signTransaction } = useWallet()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      decimals: 9,
      standard: "token",
      initialSupply: 0,
      freezeAuthority: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!publicKey || !signTransaction) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to create a token",
      })
      return
    }

    try {
      setIsLoading(true)

      const tokenService = new TokenService(
        connection,
        publicKey,
        values.standard === "token-2022" ? TOKEN_2022_PROGRAM_ID : undefined
      )

      const { transaction, signers, mint } = await tokenService.createToken(
        values.decimals,
        values.freezeAuthority ? publicKey : undefined
      )

      // Sign and send transaction
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash
      transaction.feePayer = publicKey

      const signed = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction(signature)

      // Create initial supply if specified
      if (values.initialSupply > 0) {
        await tokenService.mintTo(
          mint,
          publicKey,
          values.initialSupply * Math.pow(10, values.decimals)
        )
      }

      toast({
        title: "Token created!",
        description: `Mint address: ${mint.toString()}`,
      })

      form.reset()
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error creating token",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Token name" {...field} />
              </FormControl>
              <FormDescription>
                The name of your token (max 32 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <FormControl>
                <Input placeholder="Token symbol" {...field} />
              </FormControl>
              <FormDescription>
                The symbol of your token (max 10 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="decimals"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Decimals</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="9"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                The number of decimal places (0-9)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="standard"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token Standard</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select token standard" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="token">Token Program</SelectItem>
                  <SelectItem value="token-2022">Token-2022</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose between Token Program and Token-2022 standard
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="initialSupply"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Supply</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                The initial supply of tokens to mint (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="freezeAuthority"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                
                <FormLabel>Enable Freeze Authority</FormLabel>
                <FormDescription>
                  Allow freezing token accounts (recommended for regulated tokens)
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Token
        </Button>
      </form>
    </Form>
  )
}