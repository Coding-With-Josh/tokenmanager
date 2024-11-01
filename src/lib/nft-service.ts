import {
  Metaplex,
  walletAdapterIdentity,
  toMetaplexFileFromBrowser,
  MetaplexFile,
} from "@metaplex-foundation/js"
import { Connection, PublicKey } from "@solana/web3.js"
import { WalletContextState } from "@solana/wallet-adapter-react"

export class NFTService {
  private metaplex: Metaplex

  constructor(
    connection: Connection,
    wallet: WalletContextState
  ) {
    this.metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet))
  }

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
  }

  async getCollections() {
    const nfts = await this.metaplex.nfts().findAllByOwner({
      owner: this.metaplex.identity().publicKey,
    })

    return nfts.filter(nft => nft.collection === null).map(nft => ({
      address: nft.address.toString(),
      name: nft.name,
      description: nft.json?.description || '',
      image: nft.json?.image || '',
      size: 0, // You would need to fetch this separately
    }))
  }
}