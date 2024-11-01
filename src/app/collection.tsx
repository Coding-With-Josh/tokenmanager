import { CollectionList } from "@/components/collection-list"

export default function CollectionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Collections</h1>
      <CollectionList />
    </div>
  )
}