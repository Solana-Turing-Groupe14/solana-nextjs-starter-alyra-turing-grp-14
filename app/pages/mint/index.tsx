import { AddIcon, AtSignIcon, CheckCircleIcon,  } from '@chakra-ui/icons'
import { Box, Button, CloseButton, FormControl, FormLabel, Input, InputGroup,
  InputLeftElement, Link, Text, useToast
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey as soljsweb3PublicKey } from '@solana/web3.js'
import { ExternalLinkIcon } from 'lucide-react'
import { NextPage } from "next"
import { SetStateAction, useMemo, useState } from "react"
import {
  mintNftFromCM_fromWallet  as mplxH_mintNftFromCM,
} from "@helpers/mplx.helper.dynamic"
// import { getAddressUri, getTxUri } from "@helpers/solana.helper"
import { getAddressUri, shortenAddress } from '@helpers/solana.helper'
import { mplhelp_T_MintNftCMInput, mplhelp_T_MintNftCMResult } from "types"

const FILEPATH = 'app/pages/mint/index.tsx'

// export default function MintTestPage() {
const MintTestPage: NextPage = (/* props */) => {


  const SUCCESS_DELAY = 60_000
  // const WARN_DELAY = 15_000
  // const ERROR_DELAY = 60_000

  // const defaultCollectionAddress = `HwUY2vXuuvaximnpbmE6f8ds2TVmC2V4KnweQjAS5AaM`
  const defaultCandyMachineAddress = ``

  const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()
  const [isProcessingMint, setIsProcessingMint] = useState(false)

  const [candyMachineAddress, setCandyMachineAddress] = useState( defaultCandyMachineAddress )
  // const [collectionAddress, setcollectionAddress] = useState( defaultCollectionAddress )

  const isConnected = useMemo(() => {
    const LOGPREFIX = `${FILEPATH}:isConnected: `
    console.debug(`${LOGPREFIX} ${connected && connectedWalletPublicKey}`)
    return connected && connectedWalletPublicKey
  }, [connected, connectedWalletPublicKey]);

  const toast = useToast()


  const handleChangeCandyMachineAddress = (event: { target: { value: SetStateAction<string> } }) => setCandyMachineAddress(event.target.value)

  const isValidCandyMachineInput = useMemo(() => {
    const LOGPREFIX = `${FILEPATH}:isValidCandyMachineInput: `
    let isValid = false
    try {
      if (candyMachineAddress.length > 0) {
        try {
          const solPubKey = new soljsweb3PublicKey(candyMachineAddress)
          isValid = soljsweb3PublicKey.isOnCurve(solPubKey)
        } catch (error) {
        }
      }
      } catch (error) {
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      console.error(`${LOGPREFIX} error: ${errorMsg}`)
    }
    return isValid
  }, [candyMachineAddress])

  // const handleChangeCollectionAddress = (event: { target: { value: SetStateAction<string> } }) => setcollectionAddress(event.target.value)
  // const isValidCollectionInput = useMemo(() => {
  //   let isValid = false
  //   const LOGPREFIX = `${FILEPATH}:isValidCollectionInput: `
  //   try {
  //     if (collectionAddress.length > 0) {
  //       try {
  //         const solPubKey = new soljsweb3PublicKey(collectionAddress)
  //         isValid = soljsweb3PublicKey.isOnCurve(solPubKey)
  //       } catch (error) {
  //       }
  //     }
  //     } catch (error) {
  //     const errorMsg = (error instanceof Error ? error.message : `${error}`)
  //     console.error(`${LOGPREFIX} error: ${errorMsg}`)
  //   }
  //   return isValid
  // }, [collectionAddress])

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

      // TODO: Implement mint
      if (!wallet?.adapter) {
        console.error(`${LOGPREFIX} Wallet adapter not found`)
        return
      }
      const mintInput: mplhelp_T_MintNftCMInput = {
        walletAdapter: wallet.adapter,
        // collectionAddress,
        candyMachineAddress,
      }
      const res:mplhelp_T_MintNftCMResult = await mplxH_mintNftFromCM(
        mintInput
      )
      console.debug(`${LOGPREFIX} mint:res: `, res)
      if (res.success) {
        const mintAddressUri = getAddressUri(res.mintAddress)
        const shortenedAddress = shortenAddress(res.mintAddress)
        const nftName = undefined
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
              <div className='px-2 py-1'>
                {res.mintAddress}
              </div>
              <div className='m-2'>
                {mintAddressUri &&
                  <Link href={mintAddressUri} isExternal className="flex text-end">
                    <div className='mr-2'>
                      {/* {name?name:shortenedAddress} */}
                      {nftName?nftName:shortenedAddress}
                    </div>
                    <ExternalLinkIcon size='16px' />
                  </Link>
                }
              </div>
            </Box>
          ),
        })

      } // if (res.success)

    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingMint(false)
    }
  } // submitMint

  const handleDefaultSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  return (
    <div className="mx-auto my-20 flex w-full max-w-lg flex-col gap-6 rounded-2xl p-6">
      <Text fontSize='3xl'>Mint(s) test</Text>
      <div className="flex flex-col gap-4 ">


        <form onSubmit={handleDefaultSubmit} className="">



          <FormControl>
{/* 
              <FormLabel className="pt-3">Addresses</FormLabel>
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
 */}
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
            // isDisabled={!connected || !isValidCandyMachineInput || !isValidCollectionInput}
            isDisabled={!connected || !isValidCandyMachineInput}
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