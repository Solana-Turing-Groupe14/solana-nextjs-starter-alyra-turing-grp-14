import {
  Box, Center, Container, FormControl, FormLabel, Heading,
  Input, InputGroup, Link, Text, useColorModeValue, useToast, VStack
} from "@chakra-ui/react"
// import { useWallet } from "@solana/wallet-adapter-react"
import { motion } from "framer-motion"
import { ExternalLinkIcon, QrCode as QrCodeLucid,
  // ExternalLinkIcon
} from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
//import { QRCode } from 'react-qrcode-logo';
import { QrCode } from "@components/ui/qrCode"
import { DIRECT_MINT_FROM_QR_URI_PATH } from '@consts/client'
import { ADDRESS_LENGTH } from '@consts/commons'
// import { usePathname } from "next/navigation"
import { HOST, PORT } from "@consts/host"
// import { getAddressUri, shortenAddress } from "@helpers/solana.helper"

const FILEPATH = 'app/pages/qr/displayDirectMintQr/index.tsx'

export default function ToolsPage() {

  const DEFAULT_CANDY_MACHINE_ADDRESS = ''
  const DEFAULT_URL = ''

  const router = useRouter()
  const { query } = router;
  console.debug(`${FILEPATH}: query`, query)
  const { candyMachineAddress: queryCandyMachineAddress } = query

  // const { connected, publicKey: connectedWalletPublicKey } = useWallet()

  const [candyMachineAddress, setCandyMachineAddress] = useState<string>(DEFAULT_CANDY_MACHINE_ADDRESS)

  const [url, setUrl] = useState<string>(DEFAULT_URL)


  // const pathname = usePathname()
  // console.dir(pathname)


  // const toast = useToast()
  // const toastSuccessBgColor = useColorModeValue("green.600", "green.200")
  // const toastTestColor = useColorModeValue("white", "black")

  const bgColor = useColorModeValue("gray.50", "gray.800")
  const cardBgColor = useColorModeValue("white", "gray.700")
  // const buttonTextColor = useColorModeValue("gray.800", "white")

   // ----------------------------

  //  const warnIsNotConnected = () => {
  //   console.warn(`${FILEPATH}:  Wallet not connected`)
  //   // throw new WalletNotConnectedError()
  //   toast({
  //     title: 'Wallet not connected.',
  //     description: "Please connect to an account.",
  //     status: 'warning',
  //     duration: WARN_DELAY,
  //     isClosable: true,
  //     position: 'top-right',
  //   })
  // }

  // --------------

  // const isConnected = useMemo(() => {
  //   console.debug(`${FILEPATH}:isConnected: ${ connected && connectedWalletPublicKey}`)
  //   return connected && connectedWalletPublicKey
  // }, [connected, connectedWalletPublicKey]);

  // ----------------------------

  const candyMachinedisplayDirectMintQrUri = useMemo(() => {
    const mintPath = HOST + (PORT?`:${PORT}`:'') + DIRECT_MINT_FROM_QR_URI_PATH + '?candyMachineAddress=' + candyMachineAddress
    return mintPath
  }, [candyMachineAddress])

   // ----------------------------
/* 
  const mintToConnectedWallet = async (
    address: string,
  ) => {
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      if (!address) {
        throw new Error('Address is required')
      }
      const res = await fetch('/api/airdrop', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: address,
          amount: amount,
        })
      });
      // const response: AirdropResponseData = await res.json();
      // console.debug('app/pages/mintTest.tsx:aidrop: response', response);

      // if (response && response.success && response.amount) {
      // } else {
      //   const error = (response && response.success === false ? response.error : 'Unknown error')
      // }

    } catch (error) {
      console.error(error)
    } finally {
    }
  } // mintToConnectedWallet
 */
  // ----------------------------

  const handleDefaultSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  } // handleDefaultSubmit

  // ----------------------------

  const getMintUri = (_candyMachineAddress: string) => {
    const LOGPREFIX = `${FILEPATH}:getMintUri: `
    try {
      // console.debug(`${LOGPREFIX}candyMachineAddress: `, _candyMachineAddress)
      const mintPath = HOST + (PORT?`:${PORT}`:'') + DIRECT_MINT_FROM_QR_URI_PATH + '?candyMachineAddress=' + _candyMachineAddress
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
            TODO: MINT with QR
          </Heading>

          <Box bg={cardBgColor} w='100%' p={8} borderRadius="lg" boxShadow="md">
            <Center w='100%' h='100%' mb={6}>
              <QrCodeLucid className="sm:size-12 md:size-24 xl:size-32 transition-all delay-500" />
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
                  display={ (candyMachineAddress && candyMachinedisplayDirectMintQrUri.length ? '' : 'none') }
                >
                  <Text className='pr-2 flex'>
                    Mint page Url:
                  </Text>
                  <Link color={linkColor} isExternal href={candyMachinedisplayDirectMintQrUri} className='flex'>
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

      <QrCode text={candyMachinedisplayDirectMintQrUri} id={candyMachineAddress} />

    </Container>
  )
}