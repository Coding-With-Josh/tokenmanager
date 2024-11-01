import { Connection, PublicKey } from "@solana/web3.js"
import { WalletContextState } from "@solana/wallet-adapter-react"
import { Metaplex, walletAdapterIdentity, bundlrStorage, toMetaplexFile } from "@metaplex-foundation/js"
import { prisma } from "@/lib/prisma"

export class NFTService {
  private metaplex: Metaplex

  constructor(private connection: Connection, private wallet: WalletContextState) {
    this.metaplex = Metaplex.make(connection)
      .use(walletAdapterIdentity(this.wallet))
      .use(bundlrStorage())
  }

  async createNFT(name: string, description: string, imageUrl: string) {
    if (!this.wallet.publicKey) throw new Error("Wallet not connected")

    // Upload the image to Arweave
    const response = await fetch(imageUrl)
    const imageArrayBuffer = await response.arrayBuffer()
    const imageFile = toMetaplexFile(new Uint8Array(imageArrayBuffer), 'image.png', { contentType: 'image/png' })
    const imageUri = await this.metaplex.storage().upload(imageFile)

    // Create the NFT
    const { nft } = await this.metaplex.nfts().create({
      name: name,
      description: description,
      uri: imageUri,
    })

    // Store NFT metadata in the database
    await prisma.nft.create({
      data: {
        address: nft.address.toBase58(),
        name: name,
        description: description,
        imageUrl: imageUri,
        ownerAddress: this.wallet.publicKey.toBase58(),
      },
    })

    return nft.address.toBase58()
  }

  async createCollection(name: string, symbol: string) {
    if (!this.wallet.publicKey) throw new Error("Wallet not connected")

    const { nft } = await this.metaplex.nfts().createCollection({
      name: name,
      symbol: symbol,
    })

    // Store collection metadata in the database
    await prisma.collection.create({
      data: {
        address: nft.address.toBase58(),
        name: name,
        symbol: symbol,
        ownerAddress: this.wallet.publicKey.toBase58(),
      },
    })

    return nft.address.toBase58()
  }

<<<<<<< HEAD
  async getNFTs() {
    if (!this.wallet.publicKey) throw new Error("Wallet not connected")

    const nfts = await this.metaplex.nfts().findAllByOwner({
      owner: this.wallet.publicKey,
    })

    const nftData = await Promise.all(nfts.map(async (nft) => {
      const dbNft = await prisma.nft.findUnique({
        where: { address: nft.address.toBase58() },
      })

      return {
        address: nft.address.toBase58(),
        name: dbNft?.name || nft.name,
        description: dbNft?.description || nft.json?.description || '',
        image: dbNft?.imageUrl || nft.json?.image || '',
      }
    }))

    return nftData
=======
  async createCollection(
    name: string,
    symbol: string,
    description: string,
    image: File
  ) {
    const { uri } = await this.uploadMetadata(name, description, image)

    const { nft } = await this.metaplex.nfts().create({
      name,
      symbol,
      sellerFeeBasisPoints: 500, // 5%
      uri,
      creators: [{ address: this.metaplex.identity().publicKey, share: 100 }],
      isMutable: true,
      isCollection: true,
    })

    return nft
  }

  async mintNFT(
    name: string,
    description: string,
    image: File,
    collection: PublicKey
  ) {
    const { uri } = await this.uploadMetadata(name, description, image)

    const { nft } = await this.metaplex.nfts().create({
      name,
      uri,
      sellerFeeBasisPoints: 500, // 5%
      creators: [{ address: this.metaplex.identity().publicKey, share: 100 }],
      collection,
      isMutable: true,
    })

    return nft
  }

  private async uploadMetadata(name: string, description: string, file: File) {
    const metaplexFile = await toMetaplexFileFromBrowser(file)
    const imageUri = await this.metaplex.storage().upload(metaplexFile)

    const { uri } = await this.metaplex.nfts().uploadMetadata({
      name,
      description,
      image: imageUri,
    })

    return { uri }
>>>>>>> parent of b80cee1 (navbar updated with routes)
  }

  async getCollections() {
    if (!this.wallet.publicKey) throw new Error("Wallet not connected")

    const collections = await prisma.collection.findMany({
      where: { ownerAddress: this.wallet.publicKey.toBase58() },
    })

    return collections.map(collection => ({
      address: collection.address,
      name: collection.name,
      symbol: collection.symbol,
    }))
  }
}