import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Container,
  Badge,
  Tooltip,
  IconButton,
  useToast,
  Spinner,
  Stack,
  useBreakpointValue,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { getPoapAlyraUserAccounts, deleteMints } from '@helpers/poap_alyra.helper';
import { pa_help_T_poapAlyraAccounts } from 'types';
import { CopyIcon, CheckCircleIcon, DeleteIcon } from '@chakra-ui/icons';
import { PublicKey } from '@solana/web3.js';

type UserAccountState = 
  | { status: 'loading' }
  | { status: 'error', message: string }
  | { status: 'loaded', data: pa_help_T_poapAlyraAccounts | null };

const UserData: React.FC = () => {
  const [userAccountState, setUserAccountState] = useState<UserAccountState>({ status: 'loading' });
  const [selectedNFT, setSelectedNFT] = useState<PublicKey | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const wallet = useWallet();
  const toast = useToast();

  const bgColor = useColorModeValue("purple.50", "gray.800");
  const cardBgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const headingColor = useColorModeValue("purple.600", "purple.300");
  const mintColor = useColorModeValue("purple.500", "purple.200");
  const burnColor = useColorModeValue("red.500", "red.300");

  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const init = async () => {
      if (wallet.connected && wallet.publicKey) {
        try {
          const accounts = await getPoapAlyraUserAccounts(wallet.publicKey);
          setUserAccountState({ status: 'loaded', data: accounts });
        } catch (error) {
          console.error("Error fetching user accounts:", error);
          setUserAccountState({ status: 'error', message: "Failed to fetch user data" });
          toast({
            title: "Error fetching user data",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        setUserAccountState({ status: 'error', message: "Wallet not connected" });
      }
    };
    init();
  }, [wallet, toast]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} copied to clipboard!`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const truncateAddress = (address: string, start = 6, end = 4) => {
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

  const renderUserAddress = (userAccount: pa_help_T_poapAlyraAccounts['userAccount'] | undefined) => {
    if (!userAccount || !userAccount.owner) {
      return <Text color={textColor}>Not available</Text>;
    }

    const address = userAccount.owner.toBase58();
    const displayAddress = isMobile ? truncateAddress(address) : address;

    return (
      <Tooltip label={isMobile ? address : "Click to copy"} placement="top">
        <Badge 
          colorScheme="purple" 
          p={2} 
          borderRadius="md" 
          cursor="pointer"
          onClick={() => copyToClipboard(address, "Address")}
          fontSize={{ base: "xs", md: "sm" }}
          maxW="100%"
          isTruncated
        >
          {displayAddress}
          <IconButton
            aria-label="Copy address"
            icon={<CopyIcon />}
            size="xs"
            ml={2}
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(address, "Address");
            }}
          />
        </Badge>
      </Tooltip>
    );
  };

  const handleNFTClick = (mint: PublicKey) => {
    setSelectedNFT(mint);
    onOpen();
  };

  const handleBurnNFT = async () => {
    if (selectedNFT && wallet.publicKey) {
      try {
        await deleteMints(wallet, [selectedNFT.toBase58()]);
        toast({
          title: "NFT burned successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        // Refresh user data
        const accounts = await getPoapAlyraUserAccounts(wallet.publicKey);
        setUserAccountState({ status: 'loaded', data: accounts });
        onClose();
      } catch (error) {
        console.error("Error burning NFT:", error);
        toast({
          title: "Failed to burn NFT",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const renderMintedNFTs = (userMintsAccount: pa_help_T_poapAlyraAccounts['userMintsAccount'] | undefined) => {
    if (!userMintsAccount || !userMintsAccount.listMinted || userMintsAccount.listMinted.length === 0) {
      return <Text color={textColor}>No NFTs minted yet.</Text>;
    }

    return (
      <List spacing={3}>
        {userMintsAccount.listMinted.map((mint: PublicKey, index: number) => (
          <ListItem key={mint.toBase58()} display="flex" alignItems="center" flexWrap="wrap">
            <ListIcon as={CheckCircleIcon} color={mintColor} />
            <Text color={textColor} mr={2} fontSize={{ base: "sm", md: "md" }}>NFT {index + 1}:</Text>
            <Tooltip label={isMobile ? mint.toBase58() : "Click to view details"} placement="top">
              <Badge 
                colorScheme="purple" 
                p={1} 
                borderRadius="md" 
                cursor="pointer"
                onClick={() => handleNFTClick(mint)}
                fontSize={{ base: "xs", md: "sm" }}
                maxW="100%"
                isTruncated
              >
                {isMobile ? truncateAddress(mint.toBase58(), 4, 4) : mint.toBase58()}
                <IconButton
                  aria-label="View NFT details"
                  icon={<CopyIcon />}
                  size="xs"
                  ml={2}
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNFTClick(mint);
                  }}
                />
              </Badge>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    );
  };

  const renderCounters = (userMintsAccount: pa_help_T_poapAlyraAccounts['userMintsAccount'] | undefined, userBurnsAccount: pa_help_T_poapAlyraAccounts['userBurnsAccount'] | undefined) => {
    const mintCount = userMintsAccount?.listMinted?.length || 0;
    const burnCount = userBurnsAccount?.listBurned?.length || 0;

    return (
      <StatGroup>
        <Stat>
          <StatLabel color={textColor}>Minted NFTs</StatLabel>
          <StatNumber color={mintColor}>{mintCount}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel color={textColor}>Burned NFTs</StatLabel>
          <StatNumber color={burnColor}>{burnCount}</StatNumber>
        </Stat>
      </StatGroup>
    );
  };

  const renderContent = () => {
    switch (userAccountState.status) {
      case 'loading':
        return (
          <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
            <Spinner size="xl" color="purple.500" />
          </Box>
        );
      case 'error':
        return <Text color="red.500">{userAccountState.message}</Text>;
      case 'loaded':
        if (userAccountState.data === null) {
          return <Text color={textColor}>No user data available.</Text>;
        }
        return (
          <VStack spacing={{ base: 4, md: 6 }} align="stretch">
            <Stack direction={{ base: "column", md: "row" }} justifyContent="space-between" alignItems={{ base: "flex-start", md: "center" }}>
              <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={textColor}>User Address:</Text>
              {renderUserAddress(userAccountState.data.userAccount)}
            </Stack>
            {renderCounters(userAccountState.data.userMintsAccount, userAccountState.data.userBurnsAccount)}
            <Box>
              <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" mb={{ base: 2, md: 4 }} color={textColor}>Minted NFTs:</Text>
              {renderMintedNFTs(userAccountState.data.userMintsAccount)}
            </Box>
          </VStack>
        );
    }
  };

  return (
    <Box bg={bgColor} py={{ base: 6, md: 10 }}>
      <Container maxW={{ base: "container.sm", md: "container.xl" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <VStack spacing={{ base: 6, md: 8 }} align="stretch">
            <Heading as="h1" size={{ base: "xl", md: "2xl" }} textAlign="center" color={headingColor}>
              User Data
            </Heading>
            <Box bg={cardBgColor} boxShadow="xl" borderRadius="xl" p={{ base: 4, md: 8 }}>
              {renderContent()}
            </Box>
          </VStack>
        </motion.div>
      </Container>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>NFT Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>NFT Address: {selectedNFT?.toBase58()}</Text>
            {/* Add more NFT details here */}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" leftIcon={<DeleteIcon />} mr={3} onClick={handleBurnNFT}>
              Burn NFT
            </Button>
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserData;