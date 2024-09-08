import React from 'react';
import { motion } from "framer-motion";
import { AtSignIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { ExternalLinkIcon, Zap } from 'lucide-react';
import {
  Box, Button, CloseButton, Container, Fade, FormControl, Heading, Input, InputGroup,
  InputLeftElement, Link, Text, VStack, useToast
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from "react";

// Assume these imports and constants are correctly set up in your project
import { getUmi, mintNftFromCm_fromWallet as mplxH_mintNftFromCM } from "@helpers/mplx.helper.dynamic";
import { getAddressUri, shortenAddress } from '@helpers/solana.helper';
import { MPL_F_fetchCandyMachine, MPL_F_publicKey, MPL_T_PublicKey } from '@imports/mtplx.imports';
import { mintFromCmFromAppResponseData, mplhelp_T_MintNftCm_fromWallet_Input, mplhelp_T_MintNftCMResult } from "types";
import { MINT_QR_URI_PATH, TOAST_ERROR_DELAY, TOAST_SUCCESS_DELAY, TOAST_WARN_DELAY, TOAST_POSITION } from '@consts/client';
import { HOST, PORT } from '@consts/host';
import { addMints } from '@helpers/poap_alyra.helper';

const MintPage: React.FC = () => {
  const router = useRouter();
  const { candyMachineAddress: queryCandyMachineAddress } = router.query;
  const wallet = useWallet();
  const toast = useToast();
  const umi = useMemo(() => getUmi(), []);

  const [candyMachineAddress, setCandyMachineAddress] = useState<string>('');
  const [itemsRemaining, setItemsRemaining] = useState<number>(0);
  const [isProcessingMint, setIsProcessingMint] = useState<boolean>(false);
  const [isValidCandyMachineAddress, setIsValidCandyMachineAddress] = useState<boolean>(false);

  const isConnected = wallet.connected && wallet.publicKey;

  const candyMachineMintQrUri = useMemo(() => {
    return HOST + (PORT ? `:${PORT}` : '') + MINT_QR_URI_PATH + '?candyMachineAddress=' + candyMachineAddress;
  }, [candyMachineAddress]);

  const checkIsValidCandyMachineAddress = useCallback(async (address: string): Promise<boolean> => {
    try {
      const publicKey = MPL_F_publicKey(address);
      const candyMachine = await MPL_F_fetchCandyMachine(umi, publicKey);
      return candyMachine.publicKey.__publicKey === publicKey.__publicKey;
    } catch (error) {
      console.warn("Invalid Candy Machine address:", error);
      return false;
    }
  }, [umi]);

  const handleChangeCandyMachineAddress = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = event.target.value;
    setCandyMachineAddress(newAddress);
    if (newAddress.length > 0) {
      const isValid = await checkIsValidCandyMachineAddress(newAddress);
      setIsValidCandyMachineAddress(isValid);
      if (isValid) {
        updateRemainingItems(newAddress);
        toast({
          title: 'Valid Candy Machine address',
          status: 'success',
          duration: TOAST_SUCCESS_DELAY,
          isClosable: true,
          position: TOAST_POSITION,
        });
      } else {
        setItemsRemaining(0);
        toast({
          title: 'Invalid Candy Machine address',
          status: 'warning',
          duration: TOAST_WARN_DELAY,
          isClosable: true,
          position: TOAST_POSITION,
        });
      }
    } else {
      setIsValidCandyMachineAddress(false);
      setItemsRemaining(0);
    }
  };

  const updateRemainingItems = useCallback(async (address: string) => {
    try {
      const publicKey = MPL_F_publicKey(address);
      const candyMachine = await MPL_F_fetchCandyMachine(umi, publicKey);
      const remaining = candyMachine.itemsLoaded - Number(candyMachine.itemsRedeemed.toString(10));
      setItemsRemaining(remaining);
    } catch (error) {
      console.error("Error fetching remaining items:", error);
      setItemsRemaining(0);
    }
  }, [umi]);

  const submitMint = async (isPaidByWallet: boolean) => {
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: "Please connect your wallet first.",
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: TOAST_POSITION,
      });
      return;
    }

    setIsProcessingMint(true);
    try {
      let mintResponse: mplhelp_T_MintNftCMResult | mintFromCmFromAppResponseData;
      if (isPaidByWallet) {
        if (!wallet.wallet?.adapter) {
          throw new Error("Wallet adapter not found");
        }
        const mintInput: mplhelp_T_MintNftCm_fromWallet_Input = {
          walletAdapter: wallet.wallet.adapter,
          candyMachineAddress,
        };
        mintResponse = await mplxH_mintNftFromCM(mintInput);
      } else {
        const res = await fetch('/api/mint-free', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candyMachineAddress: candyMachineAddress,
            minterAddress: wallet.publicKey?.toBase58()
          })
        });
        mintResponse = await res.json() as mintFromCmFromAppResponseData;
      }

      if (mintResponse.success) {
        const mintAddressUri = getAddressUri(mintResponse.mintAddress);
        const shortenedAddress = shortenAddress(mintResponse.mintAddress);
        toast({
          duration: TOAST_SUCCESS_DELAY,
          position: TOAST_POSITION,
          render: ({ onClose }) => (
            <Box color='white' p={3} bg='green.500' borderRadius='lg'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center'>
                  <CheckCircleIcon boxSize={5} className='mr-2' />
                  <Text fontWeight="bold">Mint Successful</Text>
                </div>
                <CloseButton size='sm' onClick={onClose} />
              </div>
              <Text mt={2}>{mintResponse.mintAddress}</Text>
              {mintAddressUri && (
                <Link href={mintAddressUri} isExternal className="flex items-center mt-2 text-white">
                  <Text mr={2}>{shortenedAddress}</Text>
                  <ExternalLinkIcon size={16} />
                </Link>
              )}
            </Box>
          ),
        });
        await addMints(wallet, [mintResponse.mintAddress]);
        setTimeout(() => updateRemainingItems(candyMachineAddress), 5000);
      } else {
        throw new Error(mintResponse.error || 'Unknown error');
      }
    } catch (error) {
      console.error("Mint failed:", error);
      toast({
        title: 'Mint failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        duration: TOAST_ERROR_DELAY,
        isClosable: true,
        position: TOAST_POSITION,
      });
    } finally {
      setIsProcessingMint(false);
    }
  };

  useEffect(() => {
    if (typeof queryCandyMachineAddress === 'string') {
      setCandyMachineAddress(queryCandyMachineAddress);
      checkIsValidCandyMachineAddress(queryCandyMachineAddress)
        .then(isValid => {
          setIsValidCandyMachineAddress(isValid);
          if (isValid) updateRemainingItems(queryCandyMachineAddress);
        });
    }
  }, [queryCandyMachineAddress, checkIsValidCandyMachineAddress, updateRemainingItems]);

  return (
    <Container maxW="container.md" py={16}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <VStack spacing={8}>
          <Heading as="h1" size="2xl" textAlign="center" mb={6} color="gray.800">
            Mint Your POAP
          </Heading>

          <Box w='100%' p='6' rounded='xl' bg='white' shadow='xl'>
            <Text fontSize="xl" fontWeight="bold" mb={2} color="gray.700">
              Remaining to mint:
            </Text>
            <Text
              bgGradient='linear(to-r, purple.500, pink.500)'
              bgClip='text'
              fontSize="4xl"
              fontWeight="extrabold"
              textAlign='center'
            >
              {itemsRemaining}
            </Text>
          </Box>

          <form style={{ width: '100%' }}>
            <VStack spacing={6}>
              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents='none'>
                    <AtSignIcon color='gray.400' />
                  </InputLeftElement>
                  <Input
                    type='text'
                    placeholder='Candy Machine address'
                    value={candyMachineAddress}
                    onChange={handleChangeCandyMachineAddress}
                    bg='white'
                    borderColor='gray.300'
                    _hover={{ borderColor: 'gray.400' }}
                    _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px purple.500' }}
                  />
                </InputGroup>
              </FormControl>

              {candyMachineAddress && candyMachineMintQrUri && (
                <Box p={4} bg="gray.50" borderRadius="md" w="full">
                  <Text fontWeight="medium" mb={2}>QR Mint page Url:</Text>
                  <Link href={candyMachineMintQrUri} isExternal color="purple.500" className='flex items-center'>
                    <Text mr={2}>{candyMachineAddress}</Text>
                    <ExternalLinkIcon size={16} />
                  </Link>
                </Box>
              )}

              <Fade in={true}>
                <Button
                  isDisabled={!isConnected || itemsRemaining <= 0 || !isValidCandyMachineAddress}
                  isLoading={isProcessingMint}
                  onClick={() => submitMint(true)}
                  colorScheme='purple'
                  size="lg"
                  width="full"
                  leftIcon={<Zap />}
                  mt={4}
                >
                  Mint (fee paid by wallet)
                </Button>
              </Fade>

              <Fade in={true}>
                <Button
                  isDisabled={!isConnected || itemsRemaining <= 0 || !isValidCandyMachineAddress}
                  isLoading={isProcessingMint}
                  onClick={() => submitMint(false)}
                  colorScheme='green'
                  size="lg"
                  width="full"
                  leftIcon={<Zap />}
                  mt={2}
                >
                  Mint (free)
                </Button>
              </Fade>
            </VStack>
          </form>
        </VStack>
      </motion.div>
    </Container>
  );
};

export default MintPage;