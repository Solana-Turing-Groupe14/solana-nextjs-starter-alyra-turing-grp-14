import React, { useState, useEffect } from 'react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { publicKey, Umi } from '@metaplex-foundation/umi';
import { fetchAllDigitalAssetByOwner, DigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Box, Text, VStack, Spinner, Table, Tbody, Tr, Td, Button, SimpleGrid, Image
} from '@chakra-ui/react';

interface OffChainMetadata {
  image?: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

interface NFTData extends DigitalAsset {
  offChainMetadata: OffChainMetadata | null;
}

const NFTGallery: React.FC = () => {
  const { publicKey: walletPublicKey } = useWallet();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNFTs = async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      if (!walletPublicKey) {
        throw new Error("Wallet not connected");
      }

      const umi = createUmi('https://api.devnet.solana.com');
      const owner = publicKey(walletPublicKey.toBase58());

      console.log("Fetching NFTs for wallet:", owner);
      const assets = await fetchAllDigitalAssetByOwner(umi, owner);
      console.log("Found assets:", assets);

      const nftData = await Promise.all(assets.map(async (asset): Promise<NFTData> => {
        if (asset.metadata.uri) {
          try {
            const response = await fetch(asset.metadata.uri);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const json: OffChainMetadata = await response.json();
            return { ...asset, offChainMetadata: json };
          } catch (err) {
            console.error("Error fetching metadata for asset:", asset.metadata.name, err);
            return { ...asset, offChainMetadata: null };
          }
        }
        return { ...asset, offChainMetadata: null };
      }));

      console.log("Processed NFT data:", nftData);
      setNfts(nftData);
    } catch (err) {
      console.error("Error fetching NFTs:", err);
      if (retryCount < 3) {
        console.log(`Retrying... Attempt ${retryCount + 1}`);
        setTimeout(() => fetchNFTs(retryCount + 1), 1000 * (retryCount + 1));
      } else {
        setError(`Failed to fetch NFTs: ${err instanceof Error ? err.message : String(err)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletPublicKey) {
      fetchNFTs();
    }
  }, [walletPublicKey]);

  if (!walletPublicKey) {
    return <Text>Please connect your wallet to view your NFTs.</Text>;
  }

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <VStack>
        <Text color="red.500">{error}</Text>
        <Button onClick={() => fetchNFTs()}>Retry</Button>
      </VStack>
    );
  }

  if (nfts.length === 0) {
    return <Text>No NFTs found for this wallet on Devnet.</Text>;
  }

  return (
    <Box p={6}>
      <Text fontSize="3xl" mb={6}>My NFTs on Devnet</Text>
      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {nfts.map((nft, index) => (
          <Box key={index} borderWidth={1} borderRadius="lg" p={4}>
            <VStack spacing={4} align="stretch">
              {nft.offChainMetadata && nft.offChainMetadata.image && (
                <Image src={nft.offChainMetadata.image} alt={nft.metadata.name} borderRadius="md" />
              )}
              <Text fontSize="xl" fontWeight="bold">{nft.metadata.name}</Text>
              <Text>{nft.metadata.symbol}</Text>
              {nft.offChainMetadata && nft.offChainMetadata.description && (
                <Text>{nft.offChainMetadata.description}</Text>
              )}
              <Table variant="simple" size="sm">
                <Tbody>
                  {nft.offChainMetadata && nft.offChainMetadata.attributes && nft.offChainMetadata.attributes.map((attr, attrIndex) => (
                    <Tr key={attrIndex}>
                      <Td fontWeight="bold">{attr.trait_type}</Td>
                      <Td>{attr.value}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default NFTGallery;