import { AddIcon, AtSignIcon, CheckCircleIcon,  } from '@chakra-ui/icons'
import { Box, Button, CloseButton, FormControl, Input, InputGroup,
  InputLeftElement, Text, useToast
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { NextPage } from "next"
import { SetStateAction, useCallback, useEffect, useMemo, useState } from "react"
import {
  mintNftFromCM_fromWallet  as mplxH_mintNftFromCM,
} from "@helpers/mplx.helper.dynamic"
import { getUmi } from '@helpers/mplx.helper.static'
// import { getAddressUri, shortenAddress } from '@helpers/solana.helper'
import { MPL_F_fetchCandyMachine, MPL_F_publicKey, MPL_T_PublicKey } from '@imports/mtplx.imports'
import { mplhelp_T_MintNftCMInput, mplhelp_T_MintNftCMResult } from "types"

const FILEPATH = 'app/pages/mint/index.tsx'

const MintTestPage: NextPage = (/* props */) => {

  const SUCCESS_DELAY = 15_000
  // const WARN_DELAY = 15_000
  const ERROR_DELAY = 60_000

  const defaultCandyMachineAddress = ``

  const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()
  const [isProcessingMint, setIsProcessingMint] = useState(false)
  const [isValidCandyMachineAddress, setisValidCandyMachineAddress] = useState<boolean>(false)

  const [candyMachineAddress, setCandyMachineAddress] = useState( defaultCandyMachineAddress )
  const [itemsRemaining, setItemsRemaining] = useState<number>(0)

  const isConnected = useMemo(() => {
    const LOGPREFIX = `${FILEPATH}:isConnected: `
    console.debug(`${LOGPREFIX} ${connected && connectedWalletPublicKey}`)
    return connected && connectedWalletPublicKey
  }, [connected, connectedWalletPublicKey]);

  const toast = useToast()

  const handleChangeCandyMachineAddress = async(event: { target: { value: SetStateAction<string> } }) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeCandyMachineAddress: `
    try {
      setCandyMachineAddress(event.target.value)
      const newCandyMachineAddress = event.target.value.toString()
      if (newCandyMachineAddress.length > 0) {
        try {
          // Check if the address is a valid Candy Machine
          const candyMachinePublicKey: MPL_T_PublicKey = MPL_F_publicKey(newCandyMachineAddress)
          // Load CM
          const candyMachine = await MPL_F_fetchCandyMachine(getUmi(), candyMachinePublicKey)
          const valid =  (candyMachine.publicKey.__publicKey === candyMachinePublicKey.__publicKey)
          console.debug(`${LOGPREFIX}VALID: ${valid}`)
          setisValidCandyMachineAddress(true)
          toast({
            title: 'Valid Candy Machine address',
            status: 'success',
            duration: SUCCESS_DELAY,
            isClosable: true,
            position: 'top-right',
          })
        } catch (error) {
          const errorMsg = (error instanceof Error ? error.message : `${error}`)
          console.error(`${LOGPREFIX}error: ${errorMsg}`)
          toast({
            title: 'Invalid Candy Machine address',
            description: `${errorMsg}`,
            status: 'error',
            duration: ERROR_DELAY,
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
  }

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

  const submitMint = async () => {
    const LOGPREFIX = `${FILEPATH}:mint: `
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      setIsProcessingMint(true)
      if (!wallet?.adapter) {
        console.error(`${LOGPREFIX} Wallet adapter not found`)
        return
      }
      const mintInput: mplhelp_T_MintNftCMInput = {
        walletAdapter: wallet.adapter,
        candyMachineAddress,
      }
      const mintResponse:mplhelp_T_MintNftCMResult = await mplxH_mintNftFromCM(
        mintInput
      )
      console.debug(`${LOGPREFIX} mint:mintResponse: `, mintResponse)
      if (mintResponse.success) {
        // const mintAddressUri = getAddressUri(mintResponse.mintAddress)
        // const shortenedAddress = shortenAddress(mintResponse.mintAddress)
        // const nftName = undefined
        toast({
          duration: SUCCESS_DELAY,
          position: 'top-right',
          render: ({ onClose }) => (
            <Box color='black' p={3} bg='green.200' borderRadius='lg'>
              <div className='flex justify-between'>
                <div className='flex '>
                  <CheckCircleIcon boxSize={5} className='ml-1 mr-2'/>
                  <Text fontWeight= "bold" >Mint done</Text>
                </div>
                <CloseButton size='sm' onClick={onClose} />
              </div>
              {/*
              <div className='px-2 py-1'>
                {mintResponse.mintAddress}
              </div>

              <div className='m-2'>
                {mintAddressUri &&
                  <Link href={mintAddressUri} isExternal className="flex text-end">
                    <div className='mr-2'>
                      {nftName?nftName:shortenedAddress}
                    </div>
                    <ExternalLinkIcon size='16px' />
                  </Link>
                }
              </div>
              */}

            </Box>
          ),
        })

      } else {
        const errorMsg = (mintResponse && mintResponse.success === false ? mintResponse.error : 'Unknown error') 
        console.error(`${LOGPREFIX}finalizeCmNftCollectionConfigResponse`, errorMsg);
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
      console.error(`${LOGPREFIX}finalizeCmNftCollectionConfigResponse`, errorMsg);
      toast({
        title: 'Mint failed',
        description: `${errorMsg}`,
        status: 'error',
        duration: ERROR_DELAY,
        isClosable: true,
        position: 'top-right',
      })
  } finally {
      setIsProcessingMint(false)
    }
  } // submitMint

  const handleDefaultSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const getRemainingItems = useCallback(async (_candyMachineAddress:string):Promise<number> => {
    try {
      const candyMachinePublicKey: MPL_T_PublicKey = MPL_F_publicKey(_candyMachineAddress)
      // Load CM
      const candyMachine = await MPL_F_fetchCandyMachine(getUmi(), candyMachinePublicKey)
      const remainingItems = candyMachine.itemsLoaded - Number(candyMachine.itemsRedeemed.toString(10))
      console.log('getRemainingItems:remainingItems', remainingItems)
      return remainingItems
    } catch (error) {
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      console.error(`${FILEPATH}:getRemainingItems: error: ${errorMsg}`)
      return 0
    }
  } , [])

  const updateRemainingItems = useCallback(async () => {
    const remaining = await getRemainingItems(candyMachineAddress)
    setItemsRemaining(remaining)
  }
  , [candyMachineAddress, getRemainingItems])

  const REMAINING_ITEMS_UPDATE_INTERVAL = 10_000

  useEffect(() => {
    let interval = null
    try {
      if (candyMachineAddress) {
        updateRemainingItems()
        interval = setInterval(() => {
          updateRemainingItems()
        }, REMAINING_ITEMS_UPDATE_INTERVAL)
      }
    } catch (error) {
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      console.error(`${FILEPATH}:useEffect:fetchRemainingItems: error: ${errorMsg}`)
    }
    // cleanup
    return () => {
      if (interval) clearInterval(interval)
      }
  }, [candyMachineAddress, updateRemainingItems]


)

  return (
    <div className="mx-auto my-20 flex w-full max-w-lg flex-col gap-6 rounded-2xl p-6">
      <Text fontSize='3xl'>Mint(s) test</Text>
      <div className="flex flex-col gap-4 ">


        <form onSubmit={handleDefaultSubmit} className="">

        <Box w='100%' boxShadow='sm' p='6' rounded='md' className='flex' >
          <Text
              bgColor={'gray.200'}
              bgClip="text"
              fontSize="xl"
              fontWeight="extrabold"
              className='pr-2'
            >
            Remaining :
          </Text>
          <Text
            bgGradient="linear(to-l, #7928CA, #FF0080)"
            bgClip="text"
            fontSize="2xl"
            fontWeight="extrabold"
            className='pr-2'
            >
            {itemsRemaining}
          </Text>
          <Text
              bgColor={'gray.200'}
              bgClip="text"
              fontSize="xl"
              fontWeight="extrabold"
            >
            to mint
          </Text>
        </Box>

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
                />
              </InputGroup>

          </FormControl>

          <Button
            className="mt-4"
            isDisabled={!connected || itemsRemaining <= 0 || !isValidCandyMachineAddress}
            isLoading={isProcessingMint}
            onClick={submitMint}
            colorScheme='purple'
          >
            <AddIcon className='pr-1' />
            Mint test
          </Button>

        </form>

      </div>

    </div>
  )
}

export default MintTestPage