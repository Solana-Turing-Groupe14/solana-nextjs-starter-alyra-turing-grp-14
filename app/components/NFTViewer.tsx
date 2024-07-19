import React, { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
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

  const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

  const fetchMetadata = async () => {
    setLoading(true);
    setError(null);
    try {
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const mintPublicKey = new PublicKey(mintAddress);

      console.log("Fetching NFT data for mint address:", mintAddress);

      // Find the PDA for the metadata account
      const [metadataPDA] = await PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintPublicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      // Fetch the metadata account
      const metadataAccount = await connection.getAccountInfo(metadataPDA);

      if (metadataAccount) {
        // Decode the metadata
        const [name, symbol, uri] = decodeMetadata(metadataAccount.data);
        console.log("Metadata found:", { name, symbol, uri });

        if (uri) {
          console.log("Fetching metadata from URI:", uri);
          const response = await fetch(uri);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const json = await response.json();
          console.log("Metadata:", json);
          setMetadata(json);
        } else {
          setError("Metadata URI not found");
        }
      } else {
        setError("Metadata account not found");
      }
    } catch (err) {
      console.error("Error fetching metadata:", err);
      setError(`Failed to fetch NFT metadata: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to decode metadata
  const decodeMetadata = (buffer: Buffer): [string, string, string] => {
    let name = '';
    let symbol = '';
    let uri = '';
    
    let nameLength = buffer[4];
    let nameEnd = 5 + nameLength;
    name = buffer.slice(5, nameEnd).toString();
    
    let symbolLength = buffer[nameEnd];
    let symbolEnd = nameEnd + 1 + symbolLength;
    symbol = buffer.slice(nameEnd + 1, symbolEnd).toString();
    
    let uriLength = buffer[symbolEnd];
    let uriEnd = symbolEnd + 1 + uriLength;
    uri = buffer.slice(symbolEnd + 1, uriEnd).toString();
    
    return [name, symbol, uri];
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