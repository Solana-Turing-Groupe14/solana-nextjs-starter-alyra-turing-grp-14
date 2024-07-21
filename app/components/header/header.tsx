import React, { ReactNode, useEffect, useState } from 'react';
import { Link, Box, Flex, IconButton, useColorMode, useDisclosure, VStack, HStack, Container, Text } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import ConnectWalletButton from "@components/connect-wallet-button";
import { siteConfig } from "@config/site";
import { getSolanaBalance } from '@helpers/solana.helper';
import Balance from './balance';
import NextImage from 'next/image';

const MenuItems = [
  { text: "Home", href: "/" },
  { text: "Create Collection", href: "/createCollection" },
  { text: "Mint", href: "/mint/" },
  { text: "Display QR", href: "/qr/displayQr" },
  { text: "Gallery", href: "/gallery" },
  { text: "Tools", href: "/tools" },
];

interface MenuItemProps {
  children: ReactNode;
  to?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ children, to = "/" }) => (
  <Link
    href={to}
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: 'gray.200',
    }}
  >
    {children}
  </Link>
);

export default function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const wallet = useWallet();
  const [solanaBalance, setSolanaBalance] = useState<number | null | undefined>(null);

  const BALANCE_UPDATE_INTERVAL = 10_000;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const updateBalance = () => {
      if (wallet.publicKey) {
        getSolanaBalance(wallet.publicKey.toBase58())
          .then((balance) => setSolanaBalance(balance))
          .catch((err) => console.error(`header.tsx: getSolanaBalance error: ${err}`));
      } else {
        setSolanaBalance(null);
      }
    };

    updateBalance();
    interval = setInterval(updateBalance, BALANCE_UPDATE_INTERVAL);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [wallet.publicKey]);

  return (
    <Box as="header" position="fixed" w="100%" zIndex={20} borderBottom="1px" borderColor="gray.200" bg={colorMode === 'light' ? 'white' : 'gray.800'}>
      <Container maxW="container.xl">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <Box>
              <NextImage src="/assets/logo.png" alt={siteConfig.name} width={32} height={32} />
            </Box>
            <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
              {MenuItems.map((link) => (
                <MenuItem key={link.text} to={link.href}>{link.text}</MenuItem>
              ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            <ConnectWalletButton />
            <Balance balance={solanaBalance} />
            <IconButton
              size={'md'}
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              aria-label={'Switch Theme'}
              onClick={toggleColorMode}
              ml={2}
            />
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <VStack as={'nav'} spacing={4}>
              {MenuItems.map((link) => (
                <MenuItem key={link.text} to={link.href}>{link.text}</MenuItem>
              ))}
            </VStack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
}