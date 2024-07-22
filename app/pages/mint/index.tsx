import { AddIcon, AtSignIcon, CheckCircleIcon } from '@chakra-ui/icons'
import {
  Box, Button, CloseButton, Container, Fade, FormControl, Heading, Input, InputGroup,
  InputLeftElement, Link, ScaleFade, Text, useColorModeValue, useToast, VStack
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { motion } from "framer-motion"
import { ExternalLinkIcon } from 'lucide-react'
import { NextPage } from "next"
import { useRouter } from 'next/router'
import { SetStateAction, useCallback, useEffect, useMemo, useState } from "react"
import { getUmi, mintNftFromCm_fromWallet as mplxH_mintNftFromCM } from "@helpers/mplx.helper.dynamic"
import { getAddressUri, shortenAddress } from '@helpers/solana.helper'
import { MPL_F_fetchCandyMachine, MPL_F_publicKey, MPL_T_PublicKey } from '@imports/mtplx.imports'
import { mintFromCmFromAppResponseData, mplhelp_T_MintNftCm_fromWallet_Input, mplhelp_T_MintNftCMResult } from "types"
import { ERROR_DELAY, MINT_QR_URI_PATH, SUCCESS_DELAY, WARN_DELAY } from '@consts/client'
import { HOST, PORT } from '@consts/host'

const FILEPATH = 'app/pages/mint/index.tsx'

const MintTestPage: NextPage = () => {

  const INIT_DELAY = 5_000
  const AFTER_MINT_REFRESH_COUNT_DELAY = 5_000
  const REMAINING_ITEMS_UPDATE_INTERVAL = 10_000

  const router = useRouter()
  const { query } = router;
  const { candyMachineAddress: queryCandyMachineAddress } = query

  const defaultCandyMachineAddress = ``

  const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()
  const [isProcessingMintPaidByWallet, setIsProcessingMintPaidByWallet] = useState(false)
  const [isProcessingMintPaidByApp, setisProcessingMintPaidByApp] = useState(false)
  const [isValidCandyMachineAddress, setisValidCandyMachineAddress] = useState<boolean>(false)

  const [candyMachineAddress, setCandyMachineAddress] = useState(defaultCandyMachineAddress)
  const [itemsRemaining, setItemsRemaining] = useState<number>(0)

  const cardBgColor = useColorModeValue("white", "gray.700")
  const gradientColor = useColorModeValue("linear(to-l, purple.600, pink.600)", "linear(to-l, purple.300, pink.300)")

  const isConnected = useMemo(() => {
    return connected && connectedWalletPublicKey
  }, [connected, connectedWalletPublicKey]);

  const toast = useToast()
  const toastSuccessBgColor = useColorModeValue("green.600", "green.200")
  const toastTestColor = useColorModeValue("white", "black")

  const umi = useMemo(() => {
    const umi = getUmi()
    return umi
  }, [])

  // ------------------------------

  const checkIsValidCandyMachineAddress = useCallback(async (_candyMachineAddress: string): Promise<boolean> => {
    const LOGPREFIX = `${FILEPATH}:checkIsValidCandyMachineAddress: `
    try {
      const candyMachinePublicKey: MPL_T_PublicKey = MPL_F_publicKey(_candyMachineAddress)
      // Load CM
      try {
        const candyMachine = await MPL_F_fetchCandyMachine(umi, candyMachinePublicKey)
        const valid = (candyMachine.publicKey.__publicKey === candyMachinePublicKey.__publicKey)
        return valid
      } catch (error) {
        const errorMsg = (error instanceof Error ? error.message : `${error}`)
        console.warn(`${LOGPREFIX}error: ${errorMsg}`)
        return false
      }
    } catch (error) {
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      console.error(`${LOGPREFIX}error: ${errorMsg}`)
      return false
    }
  }, [umi]) // checkIsValidCandyMachineAddress

  // ------------------------------

  const candyMachineMintQrUri = useMemo(() => {
    const mintQrPath = HOST + (PORT?`:${PORT}`:'') + MINT_QR_URI_PATH + '?candyMachineAddress=' + candyMachineAddress
    return mintQrPath
  }, [candyMachineAddress])

  // ------------------------------

  const handleChangeCandyMachineAddress = async (event: { target: { value: SetStateAction<string> } }) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeCandyMachineAddress: `
    try {
      setCandyMachineAddress(event.target.value)
      const newCandyMachineAddress = event.target.value.toString()
      if (newCandyMachineAddress.length > 0) {
        try {
          const isValid = await checkIsValidCandyMachineAddress(newCandyMachineAddress)
          setisValidCandyMachineAddress(isValid)
          if (isValid) {
            toast({
              title: 'Valid Candy Machine address',
              status: 'success',
              duration: SUCCESS_DELAY,
              isClosable: true,
              position: 'top-right',
            })
          } else {
            toast({
              title: 'Invalid Candy Machine address',
              description: 'Please enter a valid Candy Machine address',
              status: 'warning',
              duration: WARN_DELAY,
              isClosable: true,
              position: 'top-right',
            })
          }
        } catch (error) {
          const errorMsg = (error instanceof Error ? error.message : `${error}`)
          console.warn(`${LOGPREFIX}error: ${errorMsg}`)
          toast({
            title: 'Invalid Candy Machine address',
            description: `${errorMsg}`,
            status: 'warning',
            duration: WARN_DELAY,
            isClosable: true,
            position: 'top-right',
          })
          setisValidCandyMachineAddress(false)
          setItemsRemaining(0)
        }
      } else {
        setisValidCandyMachineAddress(false)
        setItemsRemaining(0)
      }
    } catch (error) {
      console.error(`${LOGPREFIX}error: ${error}`)
      setisValidCandyMachineAddress(false)
      setItemsRemaining(0)
    }
  } // handleChangeCandyMachineAddress

  // ------------------------------

  const warnIsNotConnected = () => {
    const LOGPREFIX = `${FILEPATH}:warnIsNotConnected: `
    console.warn(`${LOGPREFIX} not connected`)
    toast({
      title: 'Wallet not connected.',
      description: "Please connect to an account.",
      status: 'warning',
      duration: 5_000,
      isClosable: true,
      position: 'top-right',
    })
  } // warnIsNotConnected

  // ------------------------------

  const submitMintPaidByWallet = async () => {
    const LOGPREFIX = `${FILEPATH}:submitMintPaidByWallet: `
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      setIsProcessingMintPaidByWallet(true)
      if (!wallet?.adapter) {
        console.error(`${LOGPREFIX} Wallet adapter not found`)
        return
      }
      const mintInput: mplhelp_T_MintNftCm_fromWallet_Input = {
        walletAdapter: wallet.adapter,
        candyMachineAddress,
      }
      const mintResponse: mplhelp_T_MintNftCMResult = await mplxH_mintNftFromCM(
        mintInput
      )
      // console.debug(`${LOGPREFIX} mint:mintResponse: `, mintResponse)
      if (mintResponse.success) {
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
        // wait few seconds before updating the remaining items
        setTimeout(() => {
          updateRemainingItems()
        }, AFTER_MINT_REFRESH_COUNT_DELAY)
      } else {
        const errorMsg = (mintResponse && mintResponse.success === false ? mintResponse.error : 'Unknown error')
        console.error(`${LOGPREFIX}`, errorMsg);
        toast({
          title: 'Mint failed',
          description: `${errorMsg}`,
          status: 'error',
          duration: ERROR_DELAY,
          isClosable: true,
          position: 'top-right',
        })
      }
    } catch (error) {
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      console.error(`${LOGPREFIX}`, errorMsg);
      toast({
        title: 'Mint failed',
        description: `${errorMsg}`,
        status: 'error',
        duration: ERROR_DELAY,
        isClosable: true,
        position: 'top-right',
      })
    } finally {
      setIsProcessingMintPaidByWallet(false)
    }
  } // submitMintPaidByWallet

  // ------------------------------

  const submitMintPaidByApp = async () => {
    const LOGPREFIX = `${FILEPATH}:submitMintPaidByApp: `
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      setisProcessingMintPaidByApp(true)
      const res = await fetch('/api/mint-free', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candyMachineAddress: candyMachineAddress,
          minterAddress: connectedWalletPublicKey?.toBase58()
        })
      });
      const mintResponse: mintFromCmFromAppResponseData = await res.json();

      // console.debug(`${LOGPREFIX} mint:mintResponse: `, mintResponse)
      if (mintResponse.success) {
        const mintAddressUri = getAddressUri(mintResponse.mintAddress)
        const shortenedAddress = shortenAddress(mintResponse.mintAddress)
        const nftName = undefined
        toast({
          duration: SUCCESS_DELAY,
          position: 'top-right',
          render: ({ onClose }) => (
            <Box
              bg={toastSuccessBgColor}
              color={toastTestColor}
              p={3}
              borderRadius='lg'
            >
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
        // wait few seconds before updating the remaining items
        setTimeout(() => {
          updateRemainingItems()
        }, AFTER_MINT_REFRESH_COUNT_DELAY)
      } else {
        const errorMsg = (mintResponse && mintResponse.success === false ? mintResponse.error : 'Unknown error')
        console.error(`${LOGPREFIX}`, errorMsg);
        toast({
          title: 'Mint failed',
          description: `${errorMsg}`,
          status: 'error',
          duration: ERROR_DELAY,
          isClosable: true,
          position: 'top-right',
        })
      }
    } catch (error) {
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      console.error(`${LOGPREFIX}`, errorMsg);
      toast({
        title: 'Mint failed',
        description: `${errorMsg}`,
        status: 'error',
        duration: ERROR_DELAY,
        isClosable: true,
        position: 'top-right',
      })
    } finally {
      setisProcessingMintPaidByApp(false)
    }
  } // submitMintPaidByApp

  // ------------------------------

  const handleDefaultSubmit = (event: { preventDefault: () => void }) => {
    // console.log('handleDefaultSubmit')
    event.preventDefault();
  }

  // ------------------------------

  const getRemainingItems = useCallback(async (_candyMachineAddress: string): Promise<number> => {
    try {
      const candyMachinePublicKey: MPL_T_PublicKey = MPL_F_publicKey(_candyMachineAddress)
      // Load CM
      try {
        const candyMachine = await MPL_F_fetchCandyMachine(umi, candyMachinePublicKey)
        const remainingItems = candyMachine.itemsLoaded - Number(candyMachine.itemsRedeemed.toString(10))
        return remainingItems
      } catch (error) {
          const errorMsg = (error instanceof Error ? error.message : `${error}`)
          console.warn(`${FILEPATH}:getRemainingItems: error: ${errorMsg}`)
          return 0
      }
    } catch (error) {
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      console.error(`${FILEPATH}:getRemainingItems: error: ${errorMsg}`)
      return 0
    }
  }, [umi]) // getRemainingItems

  // --------------

  const updateRemainingItems = useCallback(async () => {
    // if (!isValidCandyMachineAddress) return
    const remaining = await getRemainingItems(candyMachineAddress)
    setItemsRemaining(remaining)
    setisValidCandyMachineAddress(remaining > 0)
  }
  , [candyMachineAddress, getRemainingItems])

  // ------------------------------

  useEffect(() => {
      let interval: NodeJS.Timeout|null = null
      try {
        if (candyMachineAddress && isValidCandyMachineAddress) {
          updateRemainingItems()
          // if
        }
        interval = setInterval(() => {
          updateRemainingItems()
        }, REMAINING_ITEMS_UPDATE_INTERVAL)
      } catch (error) {
        const errorMsg = (error instanceof Error ? error.message : `${error}`)
        console.error(`${FILEPATH}:useEffect:fetchRemainingItems: error: ${errorMsg}`)
      }
      return () => {
        if (interval) clearInterval(interval)
      }
    },
    [candyMachineAddress, updateRemainingItems, isValidCandyMachineAddress]
  )

  // ----------------------------

  useEffect(() => {
    let timeout: NodeJS.Timeout|null = null
    const init = async () => {
      if (!candyMachineAddress && queryCandyMachineAddress) {
        setCandyMachineAddress(queryCandyMachineAddress.toString())
        if (await checkIsValidCandyMachineAddress(queryCandyMachineAddress.toString())) {
          setisValidCandyMachineAddress(true)
          updateRemainingItems()
        } else {
          setisValidCandyMachineAddress(false)
          setItemsRemaining(0)
        }
      } // if queryCandyMachineAddress
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
  }, [candyMachineAddress, checkIsValidCandyMachineAddress, queryCandyMachineAddress, updateRemainingItems])

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
            Mint NFTs
          </Heading>

          <ScaleFade initialScale={0.9} in={true}>
            <Box w='100%' boxShadow='lg' p='6' rounded='xl' bg={cardBgColor}>
              <Text fontSize="xl" fontWeight="bold" mb={2}>
                Remaining to mint:
              </Text>
              <Text
                bgGradient={gradientColor}
                bgClip="text"
                fontSize="4xl"
                fontWeight="extrabold"
                className='text-center'
              >
                {itemsRemaining}
              </Text>
            </Box>
          </ScaleFade>

          <form onSubmit={handleDefaultSubmit} style={{ width: '100%' }}>
            <VStack spacing={6}>
              <FormControl>
                <InputGroup>
                  <InputLeftElement pointerEvents='none'>
                    <AtSignIcon color='gray.300' />
                  </InputLeftElement>
                  <Input
                    type='text'
                    placeholder='Candy Machine address'
                    value={candyMachineAddress}
                    onChange={handleChangeCandyMachineAddress}
                    bg={cardBgColor}
                    borderRadius="full"
                  />
                </InputGroup>
              </FormControl>


              <Box
                className='mt-3 flex overflow-hidden p-1'
                border={'1px solid '}
                borderRadius={'md'}
                display={ (candyMachineAddress && candyMachineMintQrUri.length ? 'flex' : 'none') }
              >
                <Text className='flex pr-2'>
                  QR Mint page Url:
                </Text>
                <Link color={linkColor} isExternal href={candyMachineMintQrUri} className='flex'>
                  <Text className='pr-2' color={textColor}>
                    <ExternalLinkIcon size='16px' />
                  </Text>
                    {candyMachineAddress}
                </Link>
              </Box>

              <Fade in={true}>
                <Button
                  isDisabled={!connected || itemsRemaining <= 0 || !isValidCandyMachineAddress}
                  isLoading={isProcessingMintPaidByWallet}
                  onClick={submitMintPaidByWallet}
                  colorScheme='purple'
                  size="lg"
                  width="full"
                  leftIcon={<AddIcon />}
                  borderRadius="full"
                >
                  Mint (fee paid by wallet)
                </Button>
              </Fade>

              <Fade in={true}>
                <Button
                  isDisabled={!connected || itemsRemaining <= 0 || !isValidCandyMachineAddress}
                  isLoading={isProcessingMintPaidByApp}
                  onClick={submitMintPaidByApp}
                  colorScheme='green'
                  size="lg"
                  width="full"
                  leftIcon={<AddIcon />}
                  borderRadius="full"
                >
                  Mint (free)
                </Button>
              </Fade>
            </VStack>
          </form>
        </VStack>
      </motion.div>
    </Container>
  )
}

export default MintTestPage