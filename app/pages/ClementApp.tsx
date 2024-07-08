import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Balance from '@clement-pages/Balance';
import Dashboard from '@clement-pages/Dashboard';
import { getSolanaBalance } from '@helpers/solana.helper';

// MultiButton Next dynamic import
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

function ClementApp() {

  
  const wallet = useWallet();
  const [solanaBalance, setSolanaBalance] = useState<number | null>(null);

  useEffect(() => {
    if (wallet.publicKey) {
      getSolanaBalance(wallet.publicKey.toBase58())
        .then((balance) => setSolanaBalance(balance));
    } else {
      setSolanaBalance(null);
    }
    return () => {
      //
    }
  }, [wallet.publicKey]);

  return (
    <div className="AppClement">
      <div className="headerClement">
        <div className='walletClement'>
          <Balance balance={solanaBalance}/>
          <WalletMultiButtonDynamic /> {/* instead of <WalletMultiButton/> */}
          </div>
      </div>
      <Dashboard />
    </div>
  );
}

export default ClementApp;