import { TokenList } from "@/components/token-list"

export default function TokensPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tokens</h1>
      <TokenList />
    </div>
  )
}