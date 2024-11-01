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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { NFTService } from "@/lib/nft-service"
import { PublicKey } from "@solana/web3.js"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(1).max(32),
  symbol: z.string().min(1).max(10),
  description: z.string().max(1000),
  program: z.enum(["token-metadata", "core", "bubblegum"]),
  image: z.instanceof(File),
  isCollection: z.boolean().default(false),
  collectionAddress: z.string().optional(),
})

export function CreateNFTForm() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      program: "token-metadata",
      isCollection: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to create an NFT",
      })
      return
    }

    try {
      setIsLoading(true)

      const nftService = new NFTService(connection, wallet)

      if (values.isCollection) {
        const collection = await nftService.createCollection(
          values.name,
          values.symbol,
          values.description,
          values.image
        )

        toast({
          title: "Collection created!",
          description: `Collection address: ${collection.address.toString()}`,
        })
      } else {
        if (!values.collectionAddress) {
          toast({
            variant: "destructive",
            title: "Collection address required",
            description: "Please provide a collection address to mint the NFT",
          })
          return
        }

        const nft = await nftService.mintNFT(
          values.name,
          values.description,
          values.image,
          new PublicKey(values.collectionAddress)
        )

        toast({
          title: "NFT minted!",
          description: `NFT address: ${nft.address.toString()}`,
        })
      }

      form.reset()
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error creating NFT",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const watchIsCollection = form.watch("isCollection")

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
                <Input placeholder="NFT name" {...field} />
              </FormControl>
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
                <Input placeholder="NFT symbol" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your NFT"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="program"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metaplex Program</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Metaplex program" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="token-metadata">Token Metadata</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="bubblegum">Bubblegum</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose which Metaplex program to use for minting
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isCollection"
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
                <FormLabel>Create Collection</FormLabel>
                <FormDescription>
                  Check this if you want to create a new NFT collection
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        {!watchIsCollection && (
          <FormField
            control={form.control}
            name="collectionAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collection Address</FormLabel>
                <FormControl>
                  <Input placeholder="Collection public key" {...field} />
                </FormControl>
                <FormDescription>
                  The address of the collection this NFT belongs to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    field.onChange(e.target.files ? e.target.files[0] : null)
                  }
                />
              </FormControl>
              <FormDescription>
                Upload an image for your {watchIsCollection ? "collection" : "NFT"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {watchIsCollection ? "Create Collection" : "Mint NFT"}
        </Button>
      </form>
    </Form>
  )
}