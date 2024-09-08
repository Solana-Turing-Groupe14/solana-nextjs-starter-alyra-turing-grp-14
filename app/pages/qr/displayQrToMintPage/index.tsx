import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Center,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  Link,
  Text,
  useColorModeValue,
  VStack,
  Flex,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ExternalLinkIcon, QrCode as QrCodeLucid } from "lucide-react";
import { useRouter } from "next/router";
import { QrCode } from "@components/ui/qrCode";
import { DISPLAY_DIRECT_MINT_FROM_QR_URI_PATH, MINT_URI_PATH } from '@consts/client';
import { ADDRESS_LENGTH } from '@consts/commons';
import { HOST, PORT } from "@consts/host";

const FILEPATH = 'app/pages/qr/displayQrToMintPage/index.tsx';

export default function ToolsPage() {

  const DEFAULT_CANDY_MACHINE_ADDRESS = ''
  const DEFAULT_URL = ''

  const router = useRouter()
  const { query } = router;
  const { candyMachineAddress: queryCandyMachineAddress } = query
  const [candyMachineAddress, setCandyMachineAddress] = useState<string>(DEFAULT_CANDY_MACHINE_ADDRESS)
  const [urlToMintPage, setUrlToMintPage] = useState<string>(DEFAULT_URL)
  const [urlToDirectMintQrPage, setUrlToDirectMintQrPage] = useState<string>(DEFAULT_URL)

  const bgColor = useColorModeValue("purple.50", "gray.800");
  const cardBgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const headingColor = useColorModeValue("purple.600", "purple.300");
  const linkColor = useColorModeValue("purple.500", "purple.300");
  const inputBgColor = useColorModeValue("gray.100", "gray.600");

  // ----------------------------

  const getMintPageUri = useCallback((_candyMachineAddress: string) => {
    const LOGPREFIX = `${FILEPATH}:getMintPageUri: `
    try {
      const mintPath = HOST + (PORT?`:${PORT}`:'') + MINT_URI_PATH + '?candyMachineAddress=' + _candyMachineAddress
      return mintPath
    } catch (error) {
      console.error(`${LOGPREFIX}error: `, error)
    }
    return ''
  }, 
  []
  ) // getMintPageUri

  const getDirectMintQrPageUri = useCallback((_candyMachineAddress: string) => {
    const LOGPREFIX = `${FILEPATH}:getMintPageUri: `
    try {
      const mintPath = HOST + (PORT?`:${PORT}`:'') + DISPLAY_DIRECT_MINT_FROM_QR_URI_PATH + '?candyMachineAddress=' + _candyMachineAddress
      return mintPath
    } catch (error) {
      console.error(`${LOGPREFIX}error: `, error)
    }
    return ''
  }, 
  []
  ) // getDirectMintQrPageUri

  const candyMachineMintPageUri = useMemo(() => {
    return getMintPageUri(candyMachineAddress)
  }, [candyMachineAddress, getMintPageUri])

  const candyMachineDirectMintQr = useMemo(() => {
    return getDirectMintQrPageUri(candyMachineAddress)
  }, [candyMachineAddress, getDirectMintQrPageUri])

  // ----------------------------

  const handleDefaultSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  } // handleDefaultSubmit

  // ----------------------------

  const handleChangeCandyMachineAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeCandyMachineAddress: `
    try {
      const newCandyMachineAddress = event.target.value
      setCandyMachineAddress(newCandyMachineAddress)
      const mintPagePath = getMintPageUri(newCandyMachineAddress)
      setUrlToMintPage(mintPagePath)
      const directMintQrPagePath =  getDirectMintQrPageUri(newCandyMachineAddress)
      setUrlToDirectMintQrPage(directMintQrPagePath)
    } catch (error) {
      console.error(`${LOGPREFIX}error: `, error)
    }
  } // handleChangeCandyMachineAddress

  // ----------------------------

  useEffect(() => {
    const init = async () => {
      if (!candyMachineAddress && queryCandyMachineAddress) {
        setCandyMachineAddress(queryCandyMachineAddress.toString())
        setUrlToMintPage(getMintPageUri(queryCandyMachineAddress.toString()))
        setUrlToDirectMintQrPage(getDirectMintQrPageUri(queryCandyMachineAddress.toString()))
    } // if
  } // init
    init()
  }, [candyMachineAddress, getDirectMintQrPageUri, getMintPageUri, queryCandyMachineAddress])


  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={10}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <VStack spacing={8} align="stretch">
            <Box textAlign="center" mb={6}>
              <Heading as="h1" size="2xl" mb={4} color={headingColor}>
                QR Code Generator for Mint Page
              </Heading>
              <Text fontSize="xl" color={textColor}>
                Create QR codes for easy access to your NFT minting pages
              </Text>
            </Box>

            <Box bg={cardBgColor} boxShadow="xl" borderRadius="xl" p={8}>
              <Center w="100%" h="100%" mb={6}>
                <QrCodeLucid className="transition-all delay-500 sm:size-12 md:size-24 xl:size-32" color={headingColor} />
              </Center>

              <form onSubmit={handleDefaultSubmit}>
                <VStack spacing={6}>
                  <FormControl>
                    <FormLabel color={textColor}>Candy Machine Address</FormLabel>
                    <InputGroup>
                      <Input
                        type="string"
                        maxLength={ADDRESS_LENGTH}
                        value={candyMachineAddress}
                        onChange={handleChangeCandyMachineAddress}
                        placeholder="Enter Candy Machine Address"
                        bg={inputBgColor}
                        borderRadius="md"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textColor}>URL to Mint Page</FormLabel>
                    <InputGroup>
                      <Input
                        type="string"
                        value={urlToMintPage}
                        isReadOnly={true}
                        placeholder="Mint Page URL"
                        bg={inputBgColor}
                        borderRadius="md"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel color={textColor}>URL to Direct Mint QR Page</FormLabel>
                    <InputGroup>
                      <Input
                        type="string"
                        value={urlToDirectMintQrPage}
                        isReadOnly={true}
                        placeholder="Direct Mint QR Page URL"
                        bg={inputBgColor}
                        borderRadius="md"
                      />
                    </InputGroup>
                  </FormControl>
                </VStack>
              </form>
            </Box>

            {candyMachineAddress && candyMachineMintPageUri && (
              <Box bg={cardBgColor} boxShadow="md" borderRadius="xl" p={6} mt={6}>
                <Text fontSize="lg" fontWeight="bold" mb={4} color={textColor}>
                  Mint Page QR Code
                </Text>
                <Link color={linkColor} href={candyMachineMintPageUri} isExternal>
                  <Flex align="center" mb={4}>
                    <ExternalLinkIcon size={16} className="mr-2" />
                    <Text>{candyMachineAddress}</Text>
                  </Flex>
                </Link>
                <QrCode text={candyMachineMintPageUri} id={candyMachineAddress} />
              </Box>
            )}

            {candyMachineAddress && candyMachineDirectMintQr && (
              <Box bg={cardBgColor} boxShadow="md" borderRadius="xl" p={6} mt={6}>
                <Text fontSize="lg" fontWeight="bold" mb={4} color={textColor}>
                  Direct Mint QR Code
                </Text>
                <Link color={linkColor} href={candyMachineDirectMintQr} isExternal>
                  <Flex align="center" mb={4}>
                    <ExternalLinkIcon size={16} className="mr-2" />
                    <Text>{candyMachineAddress}</Text>
                  </Flex>
                </Link>
                <QrCode text={candyMachineDirectMintQr} id={candyMachineAddress} />
              </Box>
            )}
          </VStack>
        </motion.div>
      </Container>
    </Box>
  );
}