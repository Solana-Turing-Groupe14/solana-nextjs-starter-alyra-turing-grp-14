import {
  Box, Center, Container, FormControl, FormLabel,
  Heading, Input, InputGroup, Link, SimpleGrid, Text, useColorModeValue, useToast, VStack
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { motion } from "framer-motion"
import { ExternalLinkIcon, QrCode,
  // ExternalLinkIcon
} from "lucide-react"
import { useRouter } from "next/router"
import { useMemo, useState } from "react"
import { MINT_URI_PATH, WARN_DELAY } from '@consts/client'
import { ADDRESS_LENGTH } from '@consts/commons'
// import { usePathname } from "next/navigation"
import { HOST, PORT } from "@consts/host"
// import { getAddressUri, shortenAddress } from "@helpers/solana.helper"

const FILEPATH = 'app/pages/qr/displayQr/index.tsx'

export default function ToolsPage() {

  const DEFAULT_CANDY_MACHINE_ADDRESS = ''
  const DEFAULT_URL = ''

  const router = useRouter()
  const { query } = router;
  console.log(`${FILEPATH}: query`, query)
  const { candyMachineAddress: queryCandyMachineAddress } = query

  const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()

  const [candyMachineAddress, setCandyMachineAddress] = useState<string>(DEFAULT_CANDY_MACHINE_ADDRESS)

  const [url, setUrl] = useState<string>(DEFAULT_URL)


  // const pathname = usePathname()
  // console.dir(pathname)

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

  const handleChangeCandyMachineAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeCandyMachineAddress: `
    try {
      console.debug(`${LOGPREFIX}event.target.value: `, event.target.value)
      const mintPath = HOST + (PORT?`:${PORT}`:'') + MINT_URI_PATH + '?candyMachineAddress=' + event.target.value
      setCandyMachineAddress(event.target.value)
      setUrl(mintPath)
    } catch (error) {
      console.error(`${LOGPREFIX}error: `, error)
    }
  } // handleChangeCandyMachineAddress

  // ----------------------------

  const handleChangeUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeUrl: `
    try {
      console.debug(`${LOGPREFIX}event.target.value: `, event.target.value)
      // setUrl(event.target.value)
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
              <QrCode className="sm:size-12 md:size-24 xl:size-32 transition-all delay-500" />
            </Center>

            <form onSubmit={handleDefaultSubmit} className="mt-6">
              <FormControl>

                <FormLabel>Candy Machine</FormLabel>
                <InputGroup>
                  <Input
                    type='string'
                    maxLength={ADDRESS_LENGTH}
                    value={candyMachineAddress}
                    onChange={handleChangeCandyMachineAddress}
                    placeholder='Candy Machine Address'
                    bg={bgColor}
                  />
                </InputGroup>

                <FormLabel>Url</FormLabel>
                <InputGroup>
                  <Input
                    type='string'

                    value={url}
                    onChange={handleChangeUrl}
                    placeholder='Url'
                    bg={bgColor}
                  />
                </InputGroup>

                <Link href={url} isExternal className="flex text-end">
                  <div className='mr-2'>
                    {"Mint"}
                  </div>
                  <ExternalLinkIcon size='16px' />
                </Link>

              </FormControl>
            </form>
          </Box>
        </VStack>
      </motion.div>
    </Container>
  )
}