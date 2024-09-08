import React from 'react';
import { Box, Text, SimpleGrid, Badge } from '@chakra-ui/react';

interface Attribute {
  trait_type: string;
  value: string;
}

interface NFTAttributesDisplayProps {
  attributes: Attribute[];
}

const NFTAttributesDisplay: React.FC<NFTAttributesDisplayProps> = ({ attributes }) => {
  if (!attributes || attributes.length === 0) {
    return <Text>No attributes found</Text>;
  }

  return (
    <Box>
      <Text fontSize="xl" fontWeight="bold" mb={2}>Attributes</Text>
      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
        {attributes.map((attr, index) => (
          <Box key={index} borderWidth="1px" borderRadius="lg" p={3}>
            <Text fontWeight="semibold">{attr.trait_type}</Text>
            <Badge colorScheme="blue">{attr.value}</Badge>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default NFTAttributesDisplay;
