import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { Box, VStack, Heading, Text, Button, useToast } from '@chakra-ui/react';
import idl from './poap_alyra.json';

const programID = new PublicKey("Chwos3p7sWSZZToE5HCe7RQLiinB2i7uvy6u9jRTReVd");

export default function SolanaPOAPComponent() {
  const [mintCount, setMintCount] = useState(0);
  const [burnCount, setBurnCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { connection } = useConnection();
  const wallet = useWallet();
  const toast = useToast();

  useEffect(() => {
    if (wallet.publicKey) {
      fetchCounts();
    }
  }, [wallet.publicKey]);

  const getProgram = () => {
    const provider = new AnchorProvider(connection, wallet, {});
    return new Program(idl, programID, provider);
  };

  const fetchCounts = async () => {
    try {
      setLoading(true);
      const program = getProgram();
      
      const [userDataPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("AlyraPoapUserData"), wallet.publicKey.toBuffer()],
        programID
      );

      const userData = await program.account.userData.fetch(userDataPDA);
      const userMints = await program.account.userMints.fetch(userData.owner);
      const userBurns = await program.account.userBurns.fetch(userData.owner);

      setMintCount(userMints.totalCountMinted);
      setBurnCount(userBurns.totalCountBurned);
    } catch (error) {
      console.error("Error fetching counts:", error);
      toast({
        title: "Error fetching counts",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const burnNFT = async () => {
    try {
      setLoading(true);
      const program = getProgram();

      // Assuming you have a way to select which NFT to burn
      const nftToBurn = new PublicKey("..."); // Replace with actual NFT public key

      await program.methods.burnMints([nftToBurn])
        .accounts({
          userData: (await PublicKey.findProgramAddress([Buffer.from("AlyraPoapUserData"), wallet.publicKey.toBuffer()], programID))[0],
          userMints: (await PublicKey.findProgramAddress([Buffer.from("AlyraPoapUserMints"), wallet.publicKey.toBuffer()], programID))[0],
          userBurns: (await PublicKey.findProgramAddress([Buffer.from("AlyraPoapUserBurns"), wallet.publicKey.toBuffer()], programID))[0],
          owner: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      await fetchCounts(); // Refresh counts after burning
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
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.publicKey) {
    return (
      <Box p={4} bg="gray.100" borderRadius="lg">
        <Text>Please connect your wallet to view POAP information.</Text>
      </Box>
    );
  }

  return (
    <Box p={4} bg="gray.100" borderRadius="lg" boxShadow="md">
      <VStack spacing={4} align="stretch">
        <Heading size="lg">POAP Information</Heading>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <>
            <Text>Minted NFTs: {mintCount}</Text>
            <Text>Burned NFTs: {burnCount}</Text>
            <Button
              onClick={burnNFT}
              colorScheme="red"
              isLoading={loading}
              loadingText="Burning..."
            >
              Burn NFT
            </Button>
          </>
        )}
      </VStack>
    </Box>
  );
}