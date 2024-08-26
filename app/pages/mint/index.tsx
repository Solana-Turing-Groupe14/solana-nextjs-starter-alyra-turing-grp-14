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
import { MINT_QR_URI_PATH,
  TOAST_ERROR_DELAY, TOAST_SUCCESS_DELAY, TOAST_WARN_DELAY, TOAST_POSITION } from '@consts/client'
import { HOST, PORT } from '@consts/host'
import { addMints /* , deleteMints */ } from '@helpers/poap_alyra.helper'

const FILEPATH = 'app/pages/mint/index.tsx'

const MintTestPage: NextPage = () => {

  const INIT_DELAY = 5_000
  const AFTER_MINT_REFRESH_COUNT_DELAY = 5_000
  const REMAINING_ITEMS_UPDATE_INTERVAL = 10_000

  const router = useRouter()
  const { query } = router;
  const { candyMachineAddress: queryCandyMachineAddress } = query

  const defaultCandyMachineAddress = ``

  // const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()
  const wallet = useWallet()
  const [isProcessingMintPaidByWallet, setIsProcessingMintPaidByWallet] = useState(false)
  const [isProcessingMintPaidByApp, setisProcessingMintPaidByApp] = useState(false)
  const [isValidCandyMachineAddress, setisValidCandyMachineAddress] = useState<boolean>(false)

  const [candyMachineAddress, setCandyMachineAddress] = useState(defaultCandyMachineAddress)
  const [itemsRemaining, setItemsRemaining] = useState<number>(0)

  const cardBgColor = useColorModeValue("white", "gray.700")
  const gradientColor = useColorModeValue("linear(to-l, purple.600, pink.600)", "linear(to-l, purple.300, pink.300)")

  const isConnected = useMemo(() => {
    return wallet.connected && wallet.publicKey
  }, [wallet.connected, wallet.publicKey]);

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
              duration: TOAST_SUCCESS_DELAY,
              isClosable: true,
              position: TOAST_POSITION,
            })
          } else {
            toast({
              title: 'Invalid Candy Machine address',
              description: 'Please enter a valid Candy Machine address',
              status: 'warning',
              duration: TOAST_WARN_DELAY,
              isClosable: true,
              position: TOAST_POSITION,
            })
          }
        } catch (error) {
          const errorMsg = (error instanceof Error ? error.message : `${error}`)
          console.warn(`${LOGPREFIX}error: ${errorMsg}`)
          toast({
            title: 'Invalid Candy Machine address',
            description: `${errorMsg}`,
            status: 'warning',
            duration: TOAST_WARN_DELAY,
            isClosable: true,
            position: TOAST_POSITION,
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
      position: TOAST_POSITION,
    })
  } // warnIsNotConnected

  // ------------------------------

/*
  const testSaveAddMintToContract = async () => {
    const LOGPREFIX = `${FILEPATH}:testSaveAddMintToContract: `
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      // Call our program : save mint
      // await saveMints( wallet, ['Hy23e4zuQds7Yh1VL7aZKdAaLyGcRFxKSYioKK74B6t3'])
      // await saveMints( wallet, ['6DnSXpqiHoY4SzDhFfMinyxLrem9NAARxJYxynzQGEVr'])
      // await saveMints( wallet, ['7SKmzK2nKirixwJj1FvYH5oMw6NGv4XS1CAHBH4f7sHp'])

      await addMints( wallet, ['7SKmzK2nKirixwJj1FvYH5oMw6NGv4XS1CAHBH4f7sHp',
        '6DnSXpqiHoY4SzDhFfMinyxLrem9NAARxJYxynzQGEVr',
        'Hy23e4zuQds7Yh1VL7aZKdAaLyGcRFxKSYioKK74B6t3',
        'Djeaa87hT9ijY7kHAEDD8TVu9x8GT8tLJxhNLhapVTxU',
        'Djeaa87hT9ijY7kHAEDD8TVu9x8GT8tLJxhNLhapVTxU',
        '7SKmzK2nKirixwJj1FvYH5oMw6NGv4XS1CAHBH4f7sHp',
        '3wTK45JVCSg3DMxtQHxxrH2mrzVWYwdHRbsy419TC837',
        '2wwkRrW8Ju2f2t8vrnEvnKHuo41WDNw9aC8QfDQK56Zm',
        '2wwkRrW8Ju2f2t8vrnEvnKHuo41WDNw9aC8QfDQK56Zm',
        '2wwkRrW8Ju2f2t8vrnEvnKHuo41WDNw9aC8QfDQK56Zm',
        '2wwkRrW8Ju2f2t8vrnEvnKHuo41WDNw9aC8QfDQK56Zm',
        '6DnSXpqiHoY4SzDhFfMinyxLrem9NAARxJYxynzQGEVr',
        '9mbvZ7RjtfHZ53ZpeVJv8b2m2iPNK324GUcUEUePD2vJ',
      ])

    } catch (error) {
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      console.error(`${LOGPREFIX}`, errorMsg);
    } finally {
    }
  } // testSaveAddMintToContract

  const testSaveDeleteMintToContract = async () => {
    const LOGPREFIX = `${FILEPATH}:testSaveAddMintToContract: `
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      // Call our program : save mint
      await deleteMints( wallet, ['Hy23e4zuQds7Yh1VL7aZKdAaLyGcRFxKSYioKK74B6t3'])
      // await saveMints( wallet, ['6DnSXpqiHoY4SzDhFfMinyxLrem9NAARxJYxynzQGEVr'])
      // await saveMints( wallet, ['7SKmzK2nKirixwJj1FvYH5oMw6NGv4XS1CAHBH4f7sHp'])

      // await deleteMints( wallet, ['7SKmzK2nKirixwJj1FvYH5oMw6NGv4XS1CAHBH4f7sHp',
      //   '6DnSXpqiHoY4SzDhFfMinyxLrem9NAARxJYxynzQGEVr',
      //   'Hy23e4zuQds7Yh1VL7aZKdAaLyGcRFxKSYioKK74B6t3',
      //   'Djeaa87hT9ijY7kHAEDD8TVu9x8GT8tLJxhNLhapVTxU',
      //   'Djeaa87hT9ijY7kHAEDD8TVu9x8GT8tLJxhNLhapVTxU',
      //   '7SKmzK2nKirixwJj1FvYH5oMw6NGv4XS1CAHBH4f7sHp',
      //   '3wTK45JVCSg3DMxtQHxxrH2mrzVWYwdHRbsy419TC837',
      //   '2wwkRrW8Ju2f2t8vrnEvnKHuo41WDNw9aC8QfDQK56Zm',
      //   '2wwkRrW8Ju2f2t8vrnEvnKHuo41WDNw9aC8QfDQK56Zm',
      //   '2wwkRrW8Ju2f2t8vrnEvnKHuo41WDNw9aC8QfDQK56Zm',
      //   '2wwkRrW8Ju2f2t8vrnEvnKHuo41WDNw9aC8QfDQK56Zm',
      //   '6DnSXpqiHoY4SzDhFfMinyxLrem9NAARxJYxynzQGEVr',
      //   '9mbvZ7RjtfHZ53ZpeVJv8b2m2iPNK324GUcUEUePD2vJ',
      // ])

    } catch (error) {
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      console.error(`${LOGPREFIX}`, errorMsg);
    } finally {
    }
  } // testSaveAddMintToContract
*/

  const submitMintPaidByWallet = async () => {
    const LOGPREFIX = `${FILEPATH}:submitMintPaidByWallet: `
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      setIsProcessingMintPaidByWallet(true)
      // if (!wallet?.adapter) {
      if (!wallet?.wallet?.adapter) {
          console.error(`${LOGPREFIX} Wallet adapter not found`)
        return
      }
      const mintInput: mplhelp_T_MintNftCm_fromWallet_Input = {
        // walletAdapter: wallet.adapter,
        walletAdapter: wallet.wallet.adapter,
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
        // wait few seconds before updating the remaining items
        setTimeout(() => {
          updateRemainingItems()
        }, AFTER_MINT_REFRESH_COUNT_DELAY)
        // Call our program : save mint
        await addMints( wallet, [mintResponse.mintAddress])
      } else {
        const errorMsg = (mintResponse && mintResponse.success === false ? mintResponse.error : 'Unknown error')
        console.error(`${LOGPREFIX}`, errorMsg);
        toast({
          title: 'Mint failed',
          description: `${errorMsg}`,
          status: 'error',
          duration: TOAST_ERROR_DELAY,
          isClosable: true,
          position: TOAST_POSITION,
        })
      }
    } catch (error) {
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      console.error(`${LOGPREFIX}`, errorMsg);
      toast({
        title: 'Mint failed',
        description: `${errorMsg}`,
        status: 'error',
        duration: TOAST_ERROR_DELAY,
        isClosable: true,
        position: TOAST_POSITION,
      })
    } finally {
      setIsProcessingMintPaidByWallet(false)
    }
  } // submitMintPaidByWallet

  // ------------------------------

  const submitMintPaidByApp = async () => {
    const LOGPREFIX = `${FILEPATH}:submitMintPaidByApp: `
    // Guard
    if (!isConnected||!wallet) {
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
          minterAddress: wallet.publicKey?.toBase58()
        })
      });
      const mintResponse: mintFromCmFromAppResponseData = await res.json();

      console.debug(`${LOGPREFIX} mint:mintResponse: `, mintResponse)
      if (mintResponse.success) {
        const mintAddressUri = getAddressUri(mintResponse.mintAddress)
        const shortenedAddress = shortenAddress(mintResponse.mintAddress)
        const nftName = undefined
        toast({
          duration: TOAST_SUCCESS_DELAY,
          position: TOAST_POSITION,
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
          duration: TOAST_ERROR_DELAY,
          isClosable: true,
          position: TOAST_POSITION,
        })
      }
    } catch (error) {
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      console.error(`${LOGPREFIX}`, errorMsg);
      toast({
        title: 'Mint failed',
        description: `${errorMsg}`,
        status: 'error',
        duration: TOAST_ERROR_DELAY,
        isClosable: true,
        position: TOAST_POSITION,
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
    const getMPL_F_publicKey = (address: string):MPL_T_PublicKey|null => {
      try {
        const publicKey: MPL_T_PublicKey = MPL_F_publicKey(address)
        return publicKey
        }
      catch (error) {
        return null
      }
    }
    try {
      if (_candyMachineAddress.length === 0 || _candyMachineAddress.length < 32) {
        return 0
      }
      const candyMachinePublicKey = getMPL_F_publicKey(_candyMachineAddress)
      if (!candyMachinePublicKey) {
        return 0
      }
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
                  isDisabled={!wallet.connected || itemsRemaining <= 0 || !isValidCandyMachineAddress}
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
                  isDisabled={!wallet.connected || itemsRemaining <= 0 || !isValidCandyMachineAddress}
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

{/*
              <Fade in={true}>
                <Button
                  onClick={testSaveAddMintToContract}
                  colorScheme='orange'
                  size="lg"
                  width="full"
                  leftIcon={<AddIcon />}
                  borderRadius="full"
                >
                  Test save ADD mint to contract
                </Button>
              </Fade>
              <Fade in={true}>
                <Button
                  onClick={testSaveDeleteMintToContract}
                  colorScheme='orange'
                  size="lg"
                  width="full"
                  leftIcon={<AddIcon />}
                  borderRadius="full"
                >
                  Test save DELETE mint to contract
                </Button>
              </Fade>
*/}

            </VStack>
          </form>
        </VStack>
      </motion.div>
    </Container>
  )
}

export default MintTestPage