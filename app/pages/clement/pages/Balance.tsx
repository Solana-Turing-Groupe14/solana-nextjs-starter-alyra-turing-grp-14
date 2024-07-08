import React from 'react';

interface BalanceProps {
    balance: number | null;
}

const Balance: React.FC<BalanceProps> = ({ balance }) => {
    const calculateBalance = () => {
        return (balance ?
            <>Balance: <b>{balance}</b> SOL</>
            :
            <>Balance unavailable</>)
    };

    return (
        <div>
        <p>
            {calculateBalance()}
        </p>
      </div>
    );
};

export default Balance;