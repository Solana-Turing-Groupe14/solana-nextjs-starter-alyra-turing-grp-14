import React, { useState, useEffect, useCallback } from 'react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { publicKey } from '@metaplex-foundation/umi';
import { fetchAllDigitalAssetByOwner, DigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { fetchAssetsByOwner } from '@metaplex-foundation/mpl-core';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Box, Text, VStack, Spinner, Table, Tbody, Tr, Td, Button, SimpleGrid, Image,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, Container, Heading, useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { getUmi } from '@helpers/mplx.helper.dynamic';

interface OffChainMetadata {
  image?: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

interface NFTData extends DigitalAsset {
  offChainMetadata: OffChainMetadata | null;
}

interface CoreAssetData {
  uri: string;
  name: string;
  owner: string;
  collectionId?: string;
  offChainMetadata: OffChainMetadata | null;
}

// Type guard to check if the asset is CoreAssetData
const isCoreAssetData = (asset: NFTData | CoreAssetData): asset is CoreAssetData => {
  return (asset as CoreAssetData).owner !== undefined;
};

const NFTCard: React.FC<{ nft: NFTData | CoreAssetData; index: number }> = ({ nft, index }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Box 
      as={motion.div}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: "0.3s" }}
      borderWidth={1}
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      bg={bgColor}
      boxShadow="md"
      onClick={onOpen}
      cursor="pointer"
    >
      {nft.offChainMetadata && nft.offChainMetadata.image && (
        <Image src={nft.offChainMetadata.image} alt={isCoreAssetData(nft) ? nft.name : nft.metadata?.name || 'No Name'} w="100%" h="200px" objectFit="cover" />
      )}
      <Box p={4}>
        <Text fontSize="lg" fontWeight="bold">{isCoreAssetData(nft) ? nft.name : nft.metadata?.name || 'No Name'}</Text>
        <Text fontSize="sm" color="gray.500">#{index + 1}</Text>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isCoreAssetData(nft) ? nft.name : nft.metadata?.name || 'No Name'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {nft.offChainMetadata && nft.offChainMetadata.image && (
                <Image src={nft.offChainMetadata.image} alt={isCoreAssetData(nft) ? nft.name : nft.metadata?.name || 'No Name'} borderRadius="md" />
              )}
              <Text fontWeight="bold">Owner: {isCoreAssetData(nft) ? nft.owner : nft.metadata.updateAuthority || 'Unknown'}</Text>
              {nft.offChainMetadata && nft.offChainMetadata.description && (
                <Text>{nft.offChainMetadata.description}</Text>
              )}
              {nft.offChainMetadata && nft.offChainMetadata.attributes && (
                <Table variant="simple" size="sm">
                  <Tbody>
                    {nft.offChainMetadata.attributes.map((attr, attrIndex) => (
                      <Tr key={attrIndex}>
                        <Td fontWeight="bold">{attr.trait_type}</Td>
                        <Td>{attr.value}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const NFTGallery: React.FC = () => {
  const { publicKey: walletPublicKey } = useWallet();
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [coreAssets, setCoreAssets] = useState<CoreAssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNFTs = useCallback(async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      if (!walletPublicKey) {
        throw new Error("Wallet not connected");
      }

      // const umi = createUmi('https://api.devnet.solana.com');
      const umi = getUmi();
      const owner = publicKey(walletPublicKey.toBase58());

      console.log("Fetching NFTs for wallet:", owner);
      const assets = await fetchAllDigitalAssetByOwner(umi, owner);

      console.log("Fetching Core Assets for wallet:", owner);
      const coreAssetsList = await fetchAssetsByOwner(umi, owner, {
        skipDerivePlugins: false,
      });

      console.log("Found assets:", assets);
      console.log("Found core assets:", coreAssetsList);

      const nftData = await Promise.all(assets.map(async (asset): Promise<NFTData> => {
        if (asset.metadata?.uri) {
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

      const coreAssetData = await Promise.all(coreAssetsList.map(async (asset: any): Promise<CoreAssetData> => {
        if (asset.uri) {
          try {
            const response = await fetch(asset.uri);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const json: OffChainMetadata = await response.json();
            return {
              uri: asset.uri,
              name: asset.content?.metadata?.name || 'Soaplana Token',
              owner: asset.ownership?.owner || 'Unknown',
              collectionId: asset.grouping?.find((g: any) => g.group_key === "collection")?.group_value,
              offChainMetadata: json
            };
          } catch (err) {
            console.error("Error fetching metadata for core asset:", asset.content?.metadata?.name || asset.uri, err);
            return {
              uri: asset.uri,
              name: asset.content?.metadata?.name || 'No Name',
              owner: asset.ownership?.owner || 'Unknown',
              collectionId: asset.grouping?.find((g: any) => g.group_key === "collection")?.group_value,
              offChainMetadata: null
            };
          }
        }
        return {
          uri: asset.uri,
          name: asset.content?.metadata?.name || 'No Name',
          owner: asset.ownership?.owner || 'Unknown',
          collectionId: asset.grouping?.find((g: any) => g.group_key === "collection")?.group_value,
          offChainMetadata: null
        };
      }));

      console.log("Processed NFT data:", nftData);
      console.log("Processed Core Asset data:", coreAssetData);

      setNfts(nftData);
      setCoreAssets(coreAssetData);
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
  }, [walletPublicKey]);

  useEffect(() => {
    if (walletPublicKey) {
      fetchNFTs();
    }
  }, [fetchNFTs, walletPublicKey]);

  if (!walletPublicKey) {
    return <Text textAlign="center" fontSize="xl">Please connect your wallet to view your NFTs.</Text>;
  }

  if (loading) {
    return <Spinner size="xl" />;
  }

  if (error) {
    return (
      <VStack spacing={4}>
        <Text color="red.500">{error}</Text>
        <Button onClick={() => fetchNFTs()} colorScheme="blue">Retry</Button>
      </VStack>
    );
  }

  if (nfts.length === 0 && coreAssets.length === 0) {
    return <Text textAlign="center" fontSize="xl">No NFTs or Core Assets found for this wallet on Devnet.</Text>;
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8}>
        <Heading as="h1" size="2xl" textAlign="center">
          My NFTs and Core Assets on Devnet
        </Heading>
        <SimpleGrid columns={[2, 3, 4, 5]} spacing={6}>
          {nfts.map((nft, index) => (
            <NFTCard key={index} nft={nft} index={index} />
          ))}
          {coreAssets.map((asset, index) => (
            <NFTCard key={index} nft={asset} index={index} />
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default NFTGallery;
