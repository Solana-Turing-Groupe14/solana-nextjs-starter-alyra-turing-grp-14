import React, { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from "@metaplex-foundation/js";
import { 
  Box, 
  Image, 
  Text, 
  VStack,
  Spinner,
  Table,
  Tbody,
  Tr,
  Td,
  Button,
} from '@chakra-ui/react';

interface NFTViewerProps {
  mintAddress: string;
}

const NFTViewer: React.FC<NFTViewerProps> = ({ mintAddress }) => {
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = async () => {
    setLoading(true);
    setError(null);
    try {
      const connection = new Connection('https://api.devnet.solana.com');
      const metaplex = new Metaplex(connection);
      const mintPublicKey = new PublicKey(mintAddress);

      console.log("Fetching NFT data for mint address:", mintAddress);
      const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
      console.log("NFT data:", nft);

      if (nft.uri) {
        console.log("Fetching metadata from URI:", nft.uri);
        const response = await fetch(nft.uri);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        console.log("Metadata:", json);
        setMetadata(json);
      } else {
        setError("Metadata URI not found");
      }
    } catch (err) {
      console.error("Error fetching metadata:", err);
      setError(`Failed to fetch NFT metadata: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add a small delay before fetching metadata
    const timer = setTimeout(() => {
      fetchMetadata();
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, [mintAddress]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <VStack>
        <Text color="red.500">{error}</Text>
        <Button onClick={fetchMetadata}>Retry</Button>
      </VStack>
    );
  }

  if (!metadata) {
    return <Text>No metadata found</Text>;
  }

  return (
    <Box maxWidth="500px" margin="auto" mt={8}>
      <VStack spacing={4} align="stretch">
        <Image src={metadata.image} alt={metadata.name} borderRadius="md" />
        <Text fontSize="2xl" fontWeight="bold">{metadata.name}</Text>
        <Text>{metadata.description}</Text>
        <Table variant="simple">
          <Tbody>
            {metadata.attributes && metadata.attributes.map((attr: any, index: number) => (
              <Tr key={index}>
                <Td fontWeight="bold">{attr.trait_type}</Td>
                <Td>{attr.value}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Box>
  );
};

export default NFTViewer;