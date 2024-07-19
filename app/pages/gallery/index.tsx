import { useWallet } from "@solana/wallet-adapter-react";
import { NextPage } from "next"
import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Box, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import dynamic from 'next/dynamic'

const NFTViewer = dynamic(() => import('@components/NFTViewer'), { ssr: false })

const FILEPATH = 'app/pages/gallery/index.tsx';

const GalleryPage: NextPage = () => {
  const { connected, publicKey } = useWallet();
  const [nftMints, setNftMints] = useState<string[]>([]);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!connected || !publicKey) return;

      const connection = new Connection("https://api.mainnet-beta.solana.com");

      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: TOKEN_PROGRAM_ID
        });

        const nftMintAddresses = tokenAccounts.value
          .filter(accountInfo => {
            const tokenAmount = accountInfo.account.data.parsed.info.tokenAmount;
            return tokenAmount.decimals === 0 && tokenAmount.uiAmount === 1;
          })
          .map(accountInfo => accountInfo.account.data.parsed.info.mint);

        setNftMints(nftMintAddresses);
      } catch (error) {
        console.error(`${FILEPATH}:fetchNFTs: error: ${error}`);
      }
    };

    fetchNFTs();
  }, [connected, publicKey]);

  if (!connected) {
    return <Text>Please connect your wallet to view your NFTs.</Text>;
  }

  return (
    <Box p={6}>
      <Text fontSize="3xl" mb={6}>My NFTs</Text>
      <SimpleGrid columns={[1, 2, 3]} spacing={6}>
        {nftMints.map((mintAddress) => (
          <VStack key={mintAddress} borderWidth={1} borderRadius="lg" p={4}>
            <NFTViewer mintAddress={mintAddress} />
          </VStack>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default GalleryPage;