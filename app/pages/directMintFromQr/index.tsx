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
import { API_MINT_FREE_PATH,
  TOAST_SUCCESS_DELAY, TOAST_WARN_DELAY, TOAST_POSITION } from '@consts/client'
import { mintFromCmFromAppResponseData } from "types"
import { getAddressUri, shortenAddress } from "@helpers/solana.helper"
import { CheckCircleIcon } from "@chakra-ui/icons"
import { ExternalLinkIcon } from "lucide-react"

const FILEPATH = 'app/pages/directMintFromQr/index.tsx'

export default function DirectMintFromQrPage() {

  const INIT_DELAY = 5_000

  const router = useRouter()
  const { query } = router;
  const { candyMachineAddress: queryCandyMachineAddress } = query
  const { connected, publicKey: connectedWalletPublicKey } = useWallet()

  const toast = useToast()

  // ----------------------------

  const warnIsNotConnected = useCallback(() => {
    console.warn(`${FILEPATH}:  Wallet not connected`)
    toast({
      title: 'Wallet not connected.',
      description: "Please connect to an account.",
      status: 'warning',
      duration: TOAST_WARN_DELAY,
      isClosable: true,
      position: TOAST_POSITION,
    })
  }, [toast]) // warnIsNotConnected

  // --------------

  const isConnected = useMemo(() => {
    return connected && connectedWalletPublicKey
  }, [connected, connectedWalletPublicKey]);

  // ----------------------------

  const mintToConnectedWallet = useCallback( async (
    candyMachineAddress: string,
    address: string,
  ) => {
    const LOGPREFIX = `${FILEPATH}:mintToConnectedWallet: `
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
      // console.debug(`${LOGPREFIX}response=`, res);
      // console.dir(res)
      const mintResponse: mintFromCmFromAppResponseData = await res.json();
      // console.debug('app/pages/mintTest.tsx:aidrop: mintResponse', mintResponse);
      if (mintResponse && mintResponse.success && mintResponse.mintAddress) {
        // console.debug(`${LOGPREFIX}mintAddress: `, mintResponse.mintAddress)
        const mintAddressUri = getAddressUri(mintResponse.mintAddress)
        const shortenedAddress = shortenAddress(mintResponse.mintAddress)
        const nftName = undefined
        toast({
          duration: TOAST_SUCCESS_DELAY,
          position: TOAST_POSITION,
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
          duration: TOAST_WARN_DELAY,
          isClosable: true,
          position: TOAST_POSITION,
        })
      }

    } catch (error) {
      console.error(error)
    } finally {
    }
  } , [isConnected, toast, warnIsNotConnected]) // mintToConnectedWallet

  // ----------------------------

  useEffect(() => {
    const LOGPREFIX = `${FILEPATH}:useEffect: `
    try {
      let timeout: NodeJS.Timeout|null = null
      const init = async () => {
        if (!connectedWalletPublicKey) {
          warnIsNotConnected(); return
        }
        if (!queryCandyMachineAddress) {
          console.warn(`${LOGPREFIX}queryCandyMachineAddress is required`)
          toast({
            title: 'candyMachineAddress is required.',
            description: "Please provide a candyMachineAddress.",
            status: 'warning',
            duration: TOAST_WARN_DELAY,
            isClosable: true,
            position: TOAST_POSITION,
          })
          return
        }
        mintToConnectedWallet(queryCandyMachineAddress.toString(), connectedWalletPublicKey.toString())
        } // init
      // wait some time before init to allow wallet connection and params to be set
      timeout = setTimeout(() => {
        init()
      }, INIT_DELAY)

      return () => {
        if (timeout) {
          clearTimeout(timeout)
        }
      }
    } catch (error) {
      const errorMsg = (error instanceof Error) ? error.message : 'Error'
      console.error(`${LOGPREFIX}`, errorMsg)
    }

  }, [connectedWalletPublicKey, mintToConnectedWallet, queryCandyMachineAddress, toast, warnIsNotConnected])

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