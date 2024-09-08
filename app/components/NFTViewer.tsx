import React, { useState, useEffect, useCallback } from 'react';
import { publicKey } from '@metaplex-foundation/umi';
import { fetchAllDigitalAssetByOwner } from '@metaplex-foundation/mpl-token-metadata';
import { fetchAssetsByOwner, fetchAssetV1, collectionAddress } from '@metaplex-foundation/mpl-core';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Box, Text, VStack, Spinner, SimpleGrid, Image,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, Container, Heading, useColorModeValue, HStack, useToast, Button
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { getUmi } from '@helpers/mplx.helper.dynamic';
import { deleteMints } from '@helpers/poap_alyra.helper';
import NFTAttributesDisplay from './NFTAttributesDisplay ';

interface OffChainMetadata {
  image?: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

interface CoreAsset {
  type: 'CoreAsset';
  address: string;
  owner: string;
  name: string;
  uri: string;
  collectionAddress?: string;
  offChainMetadata: OffChainMetadata | null;
}

interface DigitalAsset {
  type: 'DigitalAsset';
  address: string;
  owner: string;
  name: string;
  uri: string;
  collectionAddress?: string;
  offChainMetadata: OffChainMetadata | null;
}

type Asset = CoreAsset | DigitalAsset;

const fetchMetadata = async (uri: string): Promise<OffChainMetadata | null> => {
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      console.warn(`Failed to fetch metadata from ${uri}: HTTP ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (err) {
    console.warn(`Error fetching metadata from ${uri}:`, err);
    return null;
  }
};

const NFTCard: React.FC<{ asset: Asset; index: number; onBurn: () => void }> = ({ asset, index, onBurn }) => {
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
      {asset.offChainMetadata && asset.offChainMetadata.image && (
        <Image src={asset.offChainMetadata.image} alt={asset.name} w="100%" h="200px" objectFit="cover" />
      )}
      <Box p={4}>
        <Text fontSize="lg" fontWeight="bold">{asset.name}</Text>
        <Text fontSize="sm" color="gray.500">#{index + 1}</Text>
        <Text fontSize="sm" color="gray.500">Type: {asset.type}</Text>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{asset.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {asset.offChainMetadata && asset.offChainMetadata.image && (
                <Image src={asset.offChainMetadata.image} alt={asset.name} borderRadius="md" />
              )}
              <Text fontWeight="bold">Owner: {asset.owner}</Text>
              {asset.collectionAddress && (
                <Text fontWeight="bold">Collection: {asset.collectionAddress}</Text>
              )}
              {asset.offChainMetadata && asset.offChainMetadata.description && (
                <Text>{asset.offChainMetadata.description}</Text>
              )}
              {asset.offChainMetadata && asset.offChainMetadata.attributes && (
                <NFTAttributesDisplay attributes={asset.offChainMetadata.attributes} />
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={() => { onBurn(); onClose(); }}>
              Burn NFT
            </Button>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const NFTGallery: React.FC = () => {
  const wallet = useWallet();
  const { publicKey: walletPublicKey } = wallet;
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchNFTs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!walletPublicKey) throw new Error("Wallet not connected");

      const umi = getUmi();
      const owner = publicKey(walletPublicKey.toBase58());

      // Fetch Core Assets
      const coreAssets = await fetchAssetsByOwner(umi, owner);
      
      // Fetch Digital Assets
      const digitalAssets = await fetchAllDigitalAssetByOwner(umi, owner);

      // Process Core Assets
      const processedCoreAssets: Asset[] = await Promise.all(coreAssets.map(async (assetAddress): Promise<CoreAsset> => {
        const asset = await fetchAssetV1(umi, assetAddress);
        const offChainMetadata = await fetchMetadata(asset.uri);
        return {
          type: 'CoreAsset',
          address: assetAddress.toString(),
          owner: asset.owner.toString(),
          name: asset.name,
          uri: asset.uri,
          collectionAddress: collectionAddress(asset)?.toString(),
          offChainMetadata,
        };
      }));

      // Process Digital Assets
      const processedDigitalAssets: Asset[] = await Promise.all(digitalAssets.map(async (asset): Promise<DigitalAsset> => {
        const offChainMetadata = asset.metadata?.uri ? await fetchMetadata(asset.metadata.uri) : null;
        return {
          type: 'DigitalAsset',
          address: asset.address.toString(),
          owner: asset.owner.toString(),
          name: asset.metadata?.name || 'Unnamed',
          uri: asset.metadata?.uri || '',
          collectionAddress: asset.metadata?.collection?.address?.toString(),
          offChainMetadata,
        };
      }));

      // Combine all assets
      const allAssets = [...processedCoreAssets, ...processedDigitalAssets];

      console.log("All assets:", allAssets);

      setAssets(allAssets);
    } catch (err) {
      console.error("Error fetching NFTs:", err);
      setError(`Failed to fetch NFTs: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [walletPublicKey]);

  const burnNFT = useCallback(async (assetAddress: string) => {
    try {
      setLoading(true);
      if (!wallet.connected || !walletPublicKey) {
        throw new Error("Wallet not connected");
      }
      await deleteMints(wallet, [assetAddress]);
      await fetchNFTs();
      toast({
        title: "NFT Burned",
        description: "The NFT has been successfully burned.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error burning NFT:", error);
      toast({
        title: "Error burning NFT",
        description: error instanceof Error ? error.message : String(error),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [wallet, walletPublicKey, fetchNFTs, toast]);

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

  if (assets.length === 0) {
    return <Text textAlign="center" fontSize="xl">No NFTs found for this wallet.</Text>;
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8}>
        <Heading as="h1" size="2xl" textAlign="center">
          My NFTs
        </Heading>
        <SimpleGrid columns={[2, 3, 4, 5]} spacing={6}>
          {assets.map((asset, index) => (
            <NFTCard 
              key={asset.address} 
              asset={asset} 
              index={index} 
              onBurn={() => burnNFT(asset.address)}
            />
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default NFTGallery;