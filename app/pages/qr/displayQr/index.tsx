import { CheckCircleIcon } from '@chakra-ui/icons'
import {
  Box, Button, Center, CloseButton, Container, FormControl, FormLabel,
  Heading, Input, InputGroup, Link, SimpleGrid, Text, useColorModeValue, useToast, VStack
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { motion } from "framer-motion"
import { ExternalLinkIcon, SendIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { AIRDROP_DEFAULT_AMOUNT, AIRDROP_MAX_AMOUNT } from '@consts/commons'
import { getAddressUri, shortenAddress } from "@helpers/solana.helper"
import { AirdropResponseData } from "types"

const FILEPATH = 'app/pages/tools.tsx'

export default function ToolsPage() {

  const SUCCESS_DELAY = 10_000
  const WARN_DELAY = 15_000
  const ERROR_DELAY = 30_000

  const { connected, publicKey: connectedWalletPublicKey } = useWallet()
  const [url, setUrl] = useState<number>(AIRDROP_DEFAULT_AMOUNT)

  const isConnected = useMemo(() => {
    // console.debug('app/pages/mintTest.tsx:isConnected: ', connected && publicKey)
    return connected && connectedWalletPublicKey
  }, [connected, connectedWalletPublicKey]);

  const toast = useToast()
  const toastSuccessBgColor = useColorModeValue("green.600", "green.200")
  const toastTestColor = useColorModeValue("white", "black")

  const bgColor = useColorModeValue("gray.50", "gray.800")
  const cardBgColor = useColorModeValue("white", "gray.700")
  const buttonTextColor = useColorModeValue("gray.800", "white")
  
  const warnIsNotConnected = () => {
    console.warn('app/pages/mintTest.tsx: Wallet not connected')
    toast({
      title: 'Wallet not connected.',
      description: "Please connect to an account.",
      status: 'warning',
      duration: WARN_DELAY,
      isClosable: true,
      position: 'top-right',
    })
  }

  // ----------------------------
  const handleDefaultSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  } // handleDefaultSubmit

  // ----------------------------

  const handleChangeUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeUrl: `
    try {
      console.debug(`${LOGPREFIX}event.target.value: `, event.target.value)
      let value: number
      if (typeof event.target.value === 'string') {
        value = parseInt(event.target.value)
        if (isNaN(value)) {
          return
        }
        if (value < 0) {
          value = 0
        }
        setUrl(value)
      }
    } catch (error) {
      console.error(`${LOGPREFIX}error: `, error)
    }
  } // handleChangeUrl

  // ----------------------------

  return (
    <Container maxW="container.md" py={10}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={8}>
          <Heading as="h1" size="2xl" textAlign="center" mb={6}>
            Display (collection) QR Code
          </Heading>

          <Box bg={cardBgColor} w='100%' p={8} borderRadius="lg" boxShadow="md">
            <Center w='100%' h='100%' mb={6}>
              <SendIcon size={64} />
            </Center>

            <form onSubmit={handleDefaultSubmit} className="mt-6">
              <FormControl>
                <FormLabel>Url</FormLabel>
                <InputGroup>
                  <Input
                    type='number'
                    min={0}
                    max={AIRDROP_MAX_AMOUNT}
                    value={url}
                    onChange={handleChangeUrl}
                    placeholder='Url'
                    bg={bgColor}
                  />
                </InputGroup>
              </FormControl>
            </form>
          </Box>
        </VStack>
      </motion.div>
    </Container>
  )
}