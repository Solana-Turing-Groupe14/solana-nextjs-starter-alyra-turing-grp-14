import React, { useState, useEffect, useCallback } from 'react'
import { useWallet } from "@solana/wallet-adapter-react"
import { 
  Box, 
  Button, 
  VStack,
  useToast,
  Text,
  SimpleGrid,
} from '@chakra-ui/react'
import { PublicKey } from '@solana/web3.js';
import { fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { Umi } from '@metaplex-foundation/umi';
import NFTViewer from './NFTViewer'

const FILEPATH = 'components/GalleryPageContent.tsx'

const GalleryPageContent: React.FC = () => {
  const [nfts, setNfts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()
  const toast = useToast()

  const fetchOwnedNFTs = async (umi: Umi, publicKeyString: string): Promise<string[]> => {
    const publicKey = new PublicKey(publicKeyString);
    const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
    
    try {
      const accounts = await umi.rpc.getProgramAccounts(TOKEN_PROGRAM_ID, {
        filters: [
          {
            memcmp: {
              offset: 32,
              bytes: publicKey.toBase58(),
            },
          },
          {
            dataSize: 165,
          },
        ],
      });

      const nftMints: string[] = [];

      for (const account of accounts) {
        const accountData = account.data;
        const amount = accountData.slice(64, 72);
        const decimals = accountData[72];

        // Vérifier si c'est un NFT (quantité de 1 et pas de décimales)
        if (amount.every((byte: number) => byte === 0) && amount[0] === 1 && decimals === 0) {
          const mintAddress = new PublicKey(accountData.slice(0, 32)).toBase58();
          
          try {
            // Récupérer les métadonnées du NFT
            const metadata = await fetchDigitalAsset(umi, new PublicKey(mintAddress));
            
            if (metadata) {
              nftMints.push(mintAddress);
            }
          } catch (error) {
            console.error(`Error fetching metadata for ${mintAddress}:`, error);
          }
        }
      }

      return nftMints;
    } catch (error) {
      console.error('Error fetching owned NFTs:', error);
      return [];
    }
  };

  const fetchNFTs = useCallback(async () => {
    const LOGPREFIX = `${FILEPATH}:fetchNFTs: `
    if (!connectedWalletPublicKey || !wallet?.adapter) {
      console.warn(`${LOGPREFIX}Wallet or wallet adapter is not available`)
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to view your NFTs',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)

    try {
      const { createUmi } = await import('@metaplex-foundation/umi-bundle-defaults')
      const { walletAdapterIdentity } = await import('@metaplex-foundation/umi-signer-wallet-adapters')
      const { mplTokenMetadata } = await import('@metaplex-foundation/mpl-token-metadata')

      const umi = createUmi('https://api.devnet.solana.com')
        .use(mplTokenMetadata())
        .use(walletAdapterIdentity(wallet.adapter))

      const ownedNFTs = await fetchOwnedNFTs(umi, connectedWalletPublicKey.toString())

      setNfts(ownedNFTs)

      toast({
        title: 'NFTs Loaded',
        description: `Found ${ownedNFTs.length} NFTs in your wallet.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

    } catch (error) {
      console.error(`${LOGPREFIX}Error fetching NFTs:`, error)
      toast({
        title: 'Error fetching NFTs',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [connectedWalletPublicKey, wallet, toast])

  useEffect(() => {
    if (connected && connectedWalletPublicKey && wallet?.adapter) {
      fetchNFTs()
    }
  }, [connected, connectedWalletPublicKey, wallet, fetchNFTs])

  return (
    <div className="mx-auto my-20 flex w-full max-w-lg flex-col gap-6 rounded-2xl p-6">
      <Text fontSize='3xl'>Your NFT Gallery</Text>
      <div className="flex flex-col gap-4">
        <Button 
          onClick={fetchNFTs} 
          colorScheme="blue" 
          isLoading={isLoading}
          isDisabled={!connected || !wallet?.adapter}
        >
          Refresh NFTs
        </Button>

        {(!connected || !wallet?.adapter) && (
          <Text>Please connect your wallet to view your NFTs.</Text>
        )}

        {connected && wallet?.adapter && nfts.length === 0 && !isLoading && (
          <Text>No NFTs found in your wallet.</Text>
        )}

        {connected && wallet?.adapter && nfts.length > 0 && (
          <SimpleGrid columns={[1, 2, 3, 4]} spacing={6}>
            {nfts.map((mintAddress) => (
              <NFTViewer key={mintAddress} mintAddress={mintAddress} />
            ))}
          </SimpleGrid>
        )}
      </div>
    </div>
  )
}

export default GalleryPageContent