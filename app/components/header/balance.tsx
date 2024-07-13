import { Text } from '@chakra-ui/react';
import React from 'react';

interface BalanceProps {
    balance: number | null | undefined;
}

const Balance: React.FC<BalanceProps> = ({ balance }) => {
    // console.debug(`app/components/header/balance.tsx: balance=${balance}`);
    const displayBalance = () => {
        return ( <>
                <Text paddingRight={1}>Balance:</Text>
                {
                    balance !== undefined ?
                    <Text as="b">{balance}</Text>
                    :
                    <Text as='mark'>unavailable</Text>
                }
            </>)
    };
    return (
        <div className="flex">{displayBalance()}</div>
    );
};

export default Balance;