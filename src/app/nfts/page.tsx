import { NFTList } from "@/components/nft-list"

export default function NFTsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">NFTs</h1>
      <NFTList />
    </div>
  )
}