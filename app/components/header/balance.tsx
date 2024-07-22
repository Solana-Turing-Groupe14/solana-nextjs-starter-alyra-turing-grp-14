import { Text, Box, Flex } from '@chakra-ui/react';
import React from 'react';

interface BalanceProps {
    balance: number | null | undefined;
}

const Balance: React.FC<BalanceProps> = ({ balance }) => {
    const formatBalance = (value: number | null | undefined) => {
        if (value === null || value === undefined) return '0.00000';
        return value.toFixed(3);
    };

    return (
        <Flex align="center" mx={2}>
            <Box>
                <Text fontSize="sm" paddingRight={1} display={{ base: 'none', md: 'inline' }}>Balance:</Text>
                <Text as="b" fontSize="sm">
                    {formatBalance(balance)} SOL
                </Text>
            </Box>
        </Flex>
    );
};

export default Balance;