import {
  Box,
  CloseButton,
  Container,
  Link,
  Text,
  useToast,
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { motion } from "framer-motion"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo } from "react"
import { API_MINT_FREE_PATH, SUCCESS_DELAY, WARN_DELAY } from '@consts/client'
import { mintFromCmFromAppResponseData } from "types"
import { getAddressUri, shortenAddress } from "@helpers/solana.helper"
import { CheckCircleIcon } from "@chakra-ui/icons"
import { ExternalLinkIcon } from "lucide-react"

const FILEPATH = 'app/pages/directMintFromQr/index.tsx'

export default function ToolsPage() {

  // const DEFAULT_CANDY_MACHINE_ADDRESS = ''
  // const DEFAULT_URL = ''

  const INIT_DELAY = 10_000

  const router = useRouter()
  const { query } = router;
  console.debug(`${FILEPATH}: query`, query)
  const { candyMachineAddress: queryCandyMachineAddress } = query
  console.debug(`${FILEPATH}: queryCandyMachineAddress`, queryCandyMachineAddress)

  const { connected, publicKey: connectedWalletPublicKey } = useWallet()

  // const [candyMachineAddress, setCandyMachineAddress] = useState<string>(DEFAULT_CANDY_MACHINE_ADDRESS)

  // const [url, setUrl] = useState<string>(DEFAULT_URL)


  // const pathname = usePathname()
  // console.dir(pathname)

  // const [isSmall] = useMediaQuery("(max-width: 768px)")
  // const [isMediuml] = useMediaQuery("(max-width: 1280px)")

  const toast = useToast()
  // const toastSuccessBgColor = useColorModeValue("green.600", "green.200")
  // const toastTestColor = useColorModeValue("white", "black")

  // const bgColor = useColorModeValue("gray.50", "gray.800")
  // const cardBgColor = useColorModeValue("white", "gray.700")
  // const buttonTextColor = useColorModeValue("gray.800", "white")

   // ----------------------------

   const warnIsNotConnected = useCallback(() => {
    console.warn(`${FILEPATH}:  Wallet not connected`)
    toast({
      title: 'Wallet not connected.',
      description: "Please connect to an account.",
      status: 'warning',
      duration: WARN_DELAY,
      isClosable: true,
      position: 'top-right',
    })
  }, [toast]) // warnIsNotConnected

  // --------------

  const isConnected = useMemo(() => {
    console.debug(`${FILEPATH}:isConnected: ${ connected && connectedWalletPublicKey}`)
    return connected && connectedWalletPublicKey
  }, [connected, connectedWalletPublicKey]);

  // ----------------------------

  const mintToConnectedWallet = useCallback( async (
    candyMachineAddress: string,
    address: string,
  ) => {
    const LOGPREFIX = `${FILEPATH}:mintToConnectedWallet: `
    console.debug(`${LOGPREFIX}candyMachineAddress=`, candyMachineAddress)
    console.debug(`${LOGPREFIX}address=`, address)
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      if (!address) {
        throw new Error('Address is required')
      }
      const res = await fetch(API_MINT_FREE_PATH, {
        method: 'POST', // GET !
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minterAddress: address,
          candyMachineAddress: candyMachineAddress,
        })
      });
      console.debug(`${LOGPREFIX}response=`, res);
      console.dir(res)
      const mintResponse: mintFromCmFromAppResponseData = await res.json();
      console.debug('app/pages/mintTest.tsx:aidrop: mintResponse', mintResponse);

      if (mintResponse && mintResponse.success && mintResponse.mintAddress) {
        console.debug(`${LOGPREFIX}mintAddress: `, mintResponse.mintAddress)
        const mintAddressUri = getAddressUri(mintResponse.mintAddress)
        const shortenedAddress = shortenAddress(mintResponse.mintAddress)
        const nftName = undefined
        toast({
          duration: SUCCESS_DELAY,
          position: 'top-right',
          render: ({ onClose }) => (
            <Box color='black' p={3} bg='green.200' borderRadius='lg'>
              <div className='flex justify-between'>
                <div className='flex '>
                  <CheckCircleIcon boxSize={5} className='ml-1 mr-2' />
                  <Text fontWeight="bold" >Mint done</Text>
                </div>
                <CloseButton size='sm' onClick={onClose} />
              </div>
              <div className='px-2 py-1'>
                {mintResponse.mintAddress}
              </div>

              <div className='m-2'>
                {mintAddressUri &&
                  <Link href={mintAddressUri} isExternal className="flex text-end">
                    <div className='mr-2'>
                      {nftName ? nftName : shortenedAddress}
                    </div>
                    <ExternalLinkIcon size='16px' />
                  </Link>
                }
              </div>

            </Box>
          ),
        })
      } else {
        const error = (mintResponse && mintResponse.success === false ? mintResponse.error : 'Unknown error')
        console.error(`${LOGPREFIX}error: `, error)
        toast({
          title: 'Error minting.',
          description: error,
          status: 'error',
          duration: WARN_DELAY,
          isClosable: true,
          position: 'top-right',
        })
      }

    } catch (error) {
      console.error(error)
    } finally {
    }
  } , [isConnected, toast, warnIsNotConnected]) // mintToConnectedWallet

  // ----------------------------

  // const handleDefaultSubmit = (event: { preventDefault: () => void }) => {
  //   event.preventDefault();
  // } // handleDefaultSubmit

  // ----------------------------

  // const getMintUri = (_candyMachineAddress: string) => {
  //   const LOGPREFIX = `${FILEPATH}:getMintUri: `
  //   try {
  //     // console.debug(`${LOGPREFIX}candyMachineAddress: `, _candyMachineAddress)
  //     const mintPath = HOST + (PORT?`:${PORT}`:'') + DIRECT_MINT_FROM_QR_URI_PATH + '?candyMachineAddress=' + _candyMachineAddress
  //     // console.debug(`${LOGPREFIX}mintPath: `, mintPath)
  //     return mintPath
  //   } catch (error) {
  //     console.error(`${LOGPREFIX}error: `, error)
  //   }
  //   return ''
  // } // getMintUri

  // ----------------------------

  // const handleChangeCandyMachineAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const LOGPREFIX = `${FILEPATH}:handleChangeCandyMachineAddress: `
  //   try {
  //     const newCandyMachineAddress = event.target.value
  //     // console.debug(`${LOGPREFIX}newCandyMachineAddress=`, newCandyMachineAddress)
  //     setCandyMachineAddress(newCandyMachineAddress)
  //     const mintPath =  getMintUri(newCandyMachineAddress)
  //     // const mintPath = HOST + (PORT?`:${PORT}`:'') + MINT_URI_PATH + '?candyMachineAddress=' + event.target.value
  //     setUrl(mintPath)
  //   } catch (error) {
  //     console.error(`${LOGPREFIX}error: `, error)
  //   }
  // } // handleChangeCandyMachineAddress

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
    const LOGPREFIX = `${FILEPATH}:useEffect: `
    let timeout = null
    const init = async () => {
      // console.debug(`${LOGPREFIX}queryCandyMachineAddress`, queryCandyMachineAddress)
      // console.debug(`${LOGPREFIX}connectedWalletPublicKey=${connectedWalletPublicKey}`)

      if (!connectedWalletPublicKey) {
        warnIsNotConnected(); return
      }
      if (!queryCandyMachineAddress) {
        console.warn(`${LOGPREFIX}queryCandyMachineAddress is required`)
        toast({
          title: 'candyMachineAddress is required.',
          description: "Please provide a candyMachineAddress.",
          status: 'warning',
          duration: WARN_DELAY,
          isClosable: true,
          position: 'top-right',
        })
        return
      }
      // console.debug(`${LOGPREFIX}TODO: TRIGGER MINT`)
      // console.debug(`${LOGPREFIX}TODO: TRIGGER MINT`)
      // console.debug(`${LOGPREFIX}TODO: TRIGGER MINT`)
      // console.debug(`${LOGPREFIX}TODO: TRIGGER MINT`)
      // console.debug(`${LOGPREFIX}TODO: TRIGGER MINT`)
      // console.debug(`${LOGPREFIX}TODO: TRIGGER MINT`)
      console.debug(`${LOGPREFIX}TODO: TRIGGER MINT`)
      console.debug(`${LOGPREFIX}TODO: TRIGGER MINT`)
      mintToConnectedWallet(queryCandyMachineAddress.toString(), connectedWalletPublicKey.toString())
    //   if (!candyMachineAddress && queryCandyMachineAddress) {
    //     setCandyMachineAddress(queryCandyMachineAddress.toString())
    //     setUrl(getMintUri(queryCandyMachineAddress.toString()))
    // } // if
  } // init

    // wait 10 seconds
    timeout = setTimeout(() => {
      init()
    }, INIT_DELAY)
    // init()

    return () => {
      // cleanup
      if (timeout) {
        // console.debug(`${LOGPREFIX}cleanup: clearTimeout`)
        clearTimeout(timeout)
      }
    }

  }, [connectedWalletPublicKey, mintToConnectedWallet, queryCandyMachineAddress, toast, warnIsNotConnected])

  // ----------------------------

  // const textColor = useColorModeValue("black", "white")
  // const linkColor = useColorModeValue("teal.500", "teal.300")

  // ----------------------------

  return (
    <Container maxW="container.md" py={10}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >

        <Box>Direct Mint from QR</Box>
        <Box>TODO: display or redirect to Mint result</Box>

      </motion.div>

    </Container>
  )
}