import {
  Box, Center, Container, FormControl, FormLabel,
  Heading, Input, InputGroup, Link, SimpleGrid, Text, useColorModeValue, useToast, VStack
} from "@chakra-ui/react"
import { useMediaQuery } from "@chakra-ui/react"
// import { useWallet } from "@solana/wallet-adapter-react"
import { motion } from "framer-motion"
import { ExternalLinkIcon, QrCode,
  // ExternalLinkIcon
} from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { QRCode } from 'react-qrcode-logo';
import { MINT_URI_PATH } from '@consts/client'
import { ADDRESS_LENGTH } from '@consts/commons'
// import { usePathname } from "next/navigation"
import { HOST, PORT } from "@consts/host"
import { text } from "stream/consumers"
// import { getAddressUri, shortenAddress } from "@helpers/solana.helper"

const FILEPATH = 'app/pages/qr/displayQrToMintPage/index.tsx'

export default function ToolsPage() {

  const DEFAULT_CANDY_MACHINE_ADDRESS = ''
  const DEFAULT_URL = ''

  const router = useRouter()
  const { query } = router;
  console.log(`${FILEPATH}: query`, query)
  const { candyMachineAddress: queryCandyMachineAddress } = query

  // const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()

  const [candyMachineAddress, setCandyMachineAddress] = useState<string>(DEFAULT_CANDY_MACHINE_ADDRESS)

  const [url, setUrl] = useState<string>(DEFAULT_URL)


  // const pathname = usePathname()
  // console.dir(pathname)

  const [isSmall] = useMediaQuery("(max-width: 768px)")
  const [isMediuml] = useMediaQuery("(max-width: 1280px)")

  // const isConnected = useMemo(() => {
  //   // console.debug('app/pages/mintTest.tsx:isConnected: ', connected && publicKey)
  //   return connected && connectedWalletPublicKey
  // }, [connected, connectedWalletPublicKey]);

  // const toast = useToast()
  // const toastSuccessBgColor = useColorModeValue("green.600", "green.200")
  // const toastTestColor = useColorModeValue("white", "black")

  const bgColor = useColorModeValue("gray.50", "gray.800")
  const cardBgColor = useColorModeValue("white", "gray.700")
  // const buttonTextColor = useColorModeValue("gray.800", "white")

  const candyMachineMintUri = useMemo(() => {
    const mintPath = HOST + (PORT?`:${PORT}`:'') + MINT_URI_PATH + '?candyMachineAddress=' + candyMachineAddress
    return mintPath
  }, [candyMachineAddress])

  // const warnIsNotConnected = () => {
  //   console.warn('app/pages/mintTest.tsx: Wallet not connected')
  //   toast({
  //     title: 'Wallet not connected.',
  //     description: "Please connect to an account.",
  //     status: 'warning',
  //     duration: WARN_DELAY,
  //     isClosable: true,
  //     position: 'top-right',
  //   })
  // }

  // ----------------------------

  const handleDefaultSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  } // handleDefaultSubmit

  // ----------------------------

  const getMintUri = (_candyMachineAddress: string) => {
    const LOGPREFIX = `${FILEPATH}:getMintUri: `
    try {
      // console.debug(`${LOGPREFIX}candyMachineAddress: `, _candyMachineAddress)
      const mintPath = HOST + (PORT?`:${PORT}`:'') + MINT_URI_PATH + '?candyMachineAddress=' + _candyMachineAddress
      // console.debug(`${LOGPREFIX}mintPath: `, mintPath)
      return mintPath
    } catch (error) {
      console.error(`${LOGPREFIX}error: `, error)
    }
    return ''
  } // getMintUri

  // ----------------------------

  const handleChangeCandyMachineAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeCandyMachineAddress: `
    try {
      const newCandyMachineAddress = event.target.value
      // console.debug(`${LOGPREFIX}newCandyMachineAddress=`, newCandyMachineAddress)
      setCandyMachineAddress(newCandyMachineAddress)
      const mintPath =  getMintUri(newCandyMachineAddress)
      // const mintPath = HOST + (PORT?`:${PORT}`:'') + MINT_URI_PATH + '?candyMachineAddress=' + event.target.value
      setUrl(mintPath)
    } catch (error) {
      console.error(`${LOGPREFIX}error: `, error)
    }
  } // handleChangeCandyMachineAddress

  // ----------------------------

  // const handleChangeUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const LOGPREFIX = `${FILEPATH}:handleChangeUrl: `
  //   try {
  //     // console.debug(`${LOGPREFIX}event.target.value: `, event.target.value)
  //     // setUrl(event.target.value)
  //   } catch (error) {
  //     console.error(`${LOGPREFIX}error: `, error)
  //   }
  // } // handleChangeUrl

  // ----------------------------

  useEffect(() => {
    const init = async () => {
      console.log('useEffect: queryCandyMachineAddress', queryCandyMachineAddress)
      if (!candyMachineAddress && queryCandyMachineAddress) {
        setCandyMachineAddress(queryCandyMachineAddress.toString())
        setUrl(getMintUri(queryCandyMachineAddress.toString()))
    } // if
  } // init
    init()
  }, [candyMachineAddress, queryCandyMachineAddress])

  // ----------------------------

  const textColor = useColorModeValue("black", "white")
  const linkColor = useColorModeValue("teal.500", "teal.300")

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
            Display QR Code (link to) mint page
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
                    // onChange={handleChangeUrl}
                    isReadOnly={true}
                    placeholder='Url'
                    bg={bgColor}
                  />
                </InputGroup>

                <Box
                  className='mt-3 p-1 overflow-hidden'
                  border={'1px solid '}
                  borderRadius={'md'}
                  display={ (candyMachineAddress && candyMachineMintUri.length ? '' : 'none') }
                >
                  <Text className='pr-2 flex'>
                    Mint page Url:
                  </Text>
                  <Link color={linkColor} isExternal href={candyMachineMintUri} className='flex'>
                    <Text className='pr-2' color={textColor}>
                      <ExternalLinkIcon size='16px' />
                    </Text>
                      {candyMachineAddress}
                  </Link>
                </Box>

              </FormControl>
            </form>

          </Box>
        </VStack>

      </motion.div>

      <Box
        className='mt-3 flex p-1 justify-center'
        border={'none '}
        borderRadius={'md'}
        display={ (candyMachineAddress && candyMachineMintUri.length ? 'flex' : 'none') }
      >
        <QRCode
          value={candyMachineMintUri}
          id={candyMachineAddress}
          size={isSmall? 192 : (isMediuml?512:1024)}
          bgColor={'white'}
          fgColor={'black'}
          quietZone={4}
          ecLevel={'Q'} // error correction : L, M, Q, H (default is 'M', the bigger the logo, the higher the error correction level)
          logoImage={'/favicon-96x96.png'}
          removeQrCodeBehindLogo={true}
        />
      </Box>

    </Container>
  )
}