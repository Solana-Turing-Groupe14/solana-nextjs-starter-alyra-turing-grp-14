import React, { useState, useEffect, useCallback } from 'react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { publicKey } from '@metaplex-foundation/umi';
import { fetchAllDigitalAssetByOwner, DigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Box, Text, VStack, Spinner, Table, Tbody, Tr, Td, Button, SimpleGrid, Image,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, Container, Heading, useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface OffChainMetadata {
  image?: string;
  description?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

interface NFTData extends DigitalAsset {
  offChainMetadata: OffChainMetadata | null;
}

const NFTCard: React.FC<{ nft: NFTData; index: number }> = ({ nft, index }) => {
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
        <Image src={nft.offChainMetadata.image} alt={nft.metadata.name} w="100%" h="200px" objectFit="cover" />
      )}
      <Box p={4}>
        <Text fontSize="lg" fontWeight="bold">{nft.metadata.name}</Text>
        <Text fontSize="sm" color="gray.500">#{index + 1}</Text>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{nft.metadata.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {nft.offChainMetadata && nft.offChainMetadata.image && (
                <Image src={nft.offChainMetadata.image} alt={nft.metadata.name} borderRadius="md" />
              )}
              <Text fontWeight="bold">Symbol: {nft.metadata.symbol}</Text>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNFTs = useCallback(async (retryCount = 0) => {
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
  } , [walletPublicKey]);

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

  if (nfts.length === 0) {
    return <Text textAlign="center" fontSize="xl">No NFTs found for this wallet on Devnet.</Text>;
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8}>
        <Heading as="h1" size="2xl" textAlign="center">
          My NFTs on Devnet
        </Heading>
        <SimpleGrid columns={[2, 3, 4, 5]} spacing={6}>
          {nfts.map((nft, index) => (
            <NFTCard key={index} nft={nft} index={index} />
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default NFTGallery;