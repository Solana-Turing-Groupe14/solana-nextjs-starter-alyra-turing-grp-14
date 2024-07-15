import { AddIcon, AtSignIcon, CheckCircleIcon, SmallAddIcon, } from '@chakra-ui/icons'
import { Box, Button, CloseButton, Input, InputGroup, InputLeftElement, Link, Stack, Text, useToast } from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { ExternalLinkIcon,  } from "lucide-react"
import { SetStateAction, useMemo, useState } from "react"
import {
  mintNftFromCM  as mplxH_mintNftFromCM,
} from "@helpers/mplx.helpers"
import { getAddressUri, getTxUri } from "@helpers/solana.helper"
import { mplhelp_T_MintNftCMInput, mplhelp_T_MintNftCMResult } from "types"
import { PublicKey as soljsweb3PublicKey } from '@solana/web3.js'



export default function MintTestPage() {

  const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()
  const [isProcessingMint, setIsProcessingMint] = useState(false)

  const [candyMachineAddress, setCandyMachineAddress] = useState('')
  const [collectionAddress, setcollectionAddress] = useState('')

  const handleChangeCandyMachineAddress = (event: { target: { value: SetStateAction<string> } }) => setCandyMachineAddress(event.target.value)
  const isValidCandyMachineInput = useMemo(() => {
    let isValid = false
    // TODO: Implement validation
    if (candyMachineAddress.length > 0) {
      try {
        const solPubKey = new soljsweb3PublicKey(candyMachineAddress)
        isValid = soljsweb3PublicKey.isOnCurve(solPubKey)
      } catch (error) {
      }
    }
    return isValid
  }, [candyMachineAddress])

  const handleChangeCollectionAddress = (event: { target: { value: SetStateAction<string> } }) => setcollectionAddress(event.target.value)

  const isValidCollectionInput = useMemo(() => {
    let isValid = false
    // TODO: Implement validation
    if (collectionAddress.length > 0) {
      try {
        const solPubKey = new soljsweb3PublicKey(collectionAddress)
        isValid = soljsweb3PublicKey.isOnCurve(solPubKey)
      } catch (error) {
      }
    }
    return isValid
  }, [collectionAddress])

  const isConnected = useMemo(() => {
    // console.debug('app/pages/mintTest.tsx:isConnected: ', connected && publicKey)
    return connected && connectedWalletPublicKey
  }, [connected, connectedWalletPublicKey]);

  const toast = useToast()

  const warnIsNotConnected = () => {
    console.warn('app/pages/mintTest.tsx: Wallet not connected')
    toast({
      title: 'Wallet not connected.',
      description: "Please connect to an account.",
      status: 'warning',
      duration: 5_000,
      isClosable: true,
      position: 'top-right',
    })
  }
  const mint = async () => {
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      setIsProcessingMint(true)

      // TODO: Implement mint
      if (!wallet?.adapter) {
        console.error('app/pages/mintTest.tsx:mint: Wallet adapter not found')
        return
      }

      const mintIn: mplhelp_T_MintNftCMInput = {
        walletAdapter: wallet.adapter,
        collectionAddress,
        candyMachineAddress,
      }
      const res = await mplxH_mintNftFromCM(
        mintIn
      )

      console.log('app/pages/mintTest.tsx:mint:res: ', res)


      if (res.success) {
        toast({
          title: 'Mint successful',
          description: "NFT minted successfully.",
          status: 'success',
          duration: 5_000,
          isClosable: true,
          position: 'top-right',
        })
      }

    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingMint(false)
    }
  } // mint


  return (
    <div className="mx-auto my-20 flex w-full max-w-lg flex-col gap-6 rounded-2xl p-6">
      <Text fontSize='3xl'>Mint(s) test</Text>
      <div className="flex flex-col gap-4 ">

        <Stack spacing={4}>

          <InputGroup>
            <InputLeftElement pointerEvents='none'>
              <AtSignIcon color='gray.300' />
            </InputLeftElement>
            <Input
              type='text'
              placeholder='Collection address'
              value={collectionAddress}
              onChange={handleChangeCollectionAddress}
            />
          </InputGroup>

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

        </Stack>

        <Button
          isDisabled={!connected || !isValidCandyMachineInput || !isValidCollectionInput}
          isLoading={isProcessingMint}
          onClick={mint}
          colorScheme='purple'
        >
        <AddIcon className='pr-1' />
          Mint test
        </Button>


      </div>

    </div>
  )
}
