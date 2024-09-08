import React, { useState, useEffect, useCallback } from 'react';
import { publicKey, PublicKey as UmiPublicKey } from '@metaplex-foundation/umi';
import { fetchAllDigitalAssetByOwner, DigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { fetchAssetsByOwner } from '@metaplex-foundation/mpl-core';
import { useWallet, WalletContextState } from '@solana/wallet-adapter-react';
import { 
  Box, Text, VStack, Spinner, Table, Tbody, Tr, Td, Button, SimpleGrid, Image,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, Container, Heading, useColorModeValue, HStack, useToast
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { getUmi } from '@helpers/mplx.helper.dynamic';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import idl from './poap_alyra.json';
import { getPoapAlyraUserAccounts, deleteMints } from '@helpers/poap_alyra.helper';
import { pa_help_T_poapAlyraAccounts } from 'types';

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

const isCoreAssetData = (asset: NFTData | CoreAssetData): asset is CoreAssetData => {
  return (asset as CoreAssetData).owner !== undefined;
};

const programID = new web3.PublicKey("Chwos3p7sWSZZToE5HCe7RQLiinB2i7uvy6u9jRTReVd");

const NFTCard: React.FC<{ nft: NFTData | CoreAssetData; index: number; onBurn: () => void }> = ({ nft, index, onBurn }) => {
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
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [coreAssets, setCoreAssets] = useState<CoreAssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mintCount, setMintCount] = useState(0);
  const [burnCount, setBurnCount] = useState(0);
  const [userAccounts, setUserAccounts] = useState<pa_help_T_poapAlyraAccounts|null>(null);
  const toast = useToast();

  const getProgram = useCallback(() => {
    if (!walletPublicKey) throw new Error("Wallet not connected");
    const connection = new web3.Connection(web3.clusterApiUrl('devnet'), 'confirmed');
    const provider = new AnchorProvider(connection, wallet as any, {});
    return new Program(idl as any, programID, provider);
  }, [walletPublicKey, wallet]);

  const fetchUserAccounts = useCallback(async () => {
    if (walletPublicKey) {
      const accounts = await getPoapAlyraUserAccounts(walletPublicKey);
      setUserAccounts(accounts);
      if (accounts?.userMintsAccount) {
        setMintCount(accounts.userMintsAccount.totalCountMinted);
      }
      if (accounts?.userBurnsAccount) {
        setBurnCount(accounts.userBurnsAccount.totalCountBurned);
      }
    }
  }, [walletPublicKey]);

  const fetchCounts = useCallback(async () => {
    try {
      const program = getProgram();
      
      const [userDataPDA] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("AlyraPoapUserData"), walletPublicKey!.toBuffer()],
        programID
      );
  
      const userDataAccount = await program.account.userData.fetch(userDataPDA);
      
      // Fonction helper pour extraire la clé publique du propriétaire
      const extractOwnerPublicKey = (data: any): web3.PublicKey => {
        if (data && typeof data === 'object') {
          if ('owner' in data && data.owner instanceof web3.PublicKey) {
            return data.owner;
          }
          // Parcourir l'objet pour trouver une propriété de type PublicKey
          for (const key in data) {
            if (data[key] instanceof web3.PublicKey) {
              return data[key];
            }
          }
        }
        console.log('UserData structure:', JSON.stringify(data, null, 2));
        throw new Error('Unable to extract owner public key from user data');
      };
  
      const ownerPublicKey = extractOwnerPublicKey(userDataAccount);
  
      const [userMintsPDA] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("AlyraPoapUserMints"), ownerPublicKey.toBuffer()],
        programID
      );
  
      const [userBurnsPDA] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from("AlyraPoapUserBurns"), ownerPublicKey.toBuffer()],
        programID
      );
  
      const userMints = await program.account.userMints.fetch(userMintsPDA);
      const userBurns = await program.account.userBurns.fetch(userBurnsPDA);
  
      // Fonction helper pour extraire le nombre total
      const extractTotalCount = (data: any, field: string): number => {
        if (data && typeof data === 'object' && field in data && typeof data[field] === 'number') {
          return data[field];
        }
        console.log(`${field} data structure:`, JSON.stringify(data, null, 2));
        throw new Error(`Unable to extract ${field} from account data`);
      };
  
      setMintCount(extractTotalCount(userMints, 'totalCountMinted'));
      setBurnCount(extractTotalCount(userBurns, 'totalCountBurned'));
  
    } catch (error) {
      console.error("Error fetching counts:", error);
      toast({
        title: "Error fetching counts",
        description: error instanceof Error ? error.message : String(error),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [getProgram, walletPublicKey, toast]);

  const fetchNFTs = useCallback(async (retryCount = 0) => {
    setLoading(true);
    setError(null);
    try {
      if (!walletPublicKey) {
        throw new Error("Wallet not connected");
      }

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


  const burnNFT = useCallback(async (nftToBurn: string) => {
    try {
      setLoading(true);
      if (!wallet.connected || !walletPublicKey) {
        throw new Error("Wallet not connected");
      }
      await deleteMints(wallet as WalletContextState, [nftToBurn]);
      await fetchNFTs();
      await fetchUserAccounts();
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
  }, [wallet, walletPublicKey, fetchNFTs, fetchUserAccounts, toast]);

  useEffect(() => {
    if (walletPublicKey) {
      fetchNFTs();
      fetchUserAccounts();
    }
  }, [fetchNFTs, fetchUserAccounts, walletPublicKey]);


  useEffect(() => {
    if (walletPublicKey) {
      fetchNFTs();
      fetchUserAccounts();
    }
  }, [fetchNFTs, fetchUserAccounts, walletPublicKey]);

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
        <HStack spacing={4} justify="center">
          <Box p={4} bg="blue.100" borderRadius="md">
            <Text fontWeight="bold">Minted NFTs: {mintCount}</Text>
          </Box>
          <Box p={4} bg="red.100" borderRadius="md">
            <Text fontWeight="bold">Burned NFTs: {burnCount}</Text>
          </Box>
        </HStack>
        <SimpleGrid columns={[2, 3, 4, 5]} spacing={6}>
          {nfts.map((nft, index) => (
            <NFTCard 
              key={index} 
              nft={nft} 
              index={index} 
              onBurn={() => burnNFT(nft.metadata.mint.toString())}
            />
          ))}
          {coreAssets.map((asset, index) => (
            <NFTCard 
              key={`core-${index}`}
              nft={asset} 
              index={nfts.length + index} 
              onBurn={() => burnNFT(asset.uri)}
            />
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default NFTGallery;