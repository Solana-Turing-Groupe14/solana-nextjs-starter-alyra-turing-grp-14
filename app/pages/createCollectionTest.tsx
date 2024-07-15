import { CheckCircleIcon } from '@chakra-ui/icons'
import { Box, Button, CloseButton, Link, Text, useToast } from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { ExternalLinkIcon } from "lucide-react"
import { useMemo, useState } from "react"
import {
  createMyCollection as mplxH_createMyCollection,
  createMyFullNftCollection as mplxH_createMyFullNftCollection
} from "@helpers/mplx.helpers"
import { getAddressUri, getTxUri } from "@helpers/solana.helper"
import { CollectionCreationResponseData } from "types"



export default function MintTestPage() {

  const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()
  const [isProcessingGlobalMint, setIsProcessingGlobalMint] = useState(false)
  const [isProcessingSponsoredCollectionCreation, setIsProcessingSponsoredCollectionCreation] = useState(false)
  const [isProcessingMyCollectionCreation, setIsProcessingMyCollectionCreation] = useState(false)
  const [isProcessingMyNftCollectionCreation, setIsProcessingMyNftCollectionCreation] = useState(false)

  const isConnected = useMemo(() => {
    // console.debug('app/pages/createCollectionTest.tsx:isConnected: ', connected && publicKey)
    return connected && connectedWalletPublicKey
  }, [connected, connectedWalletPublicKey]);

  const toast = useToast()

  const warnIsNotConnected = () => {
    console.warn('app/pages/createCollectionTest.tsx: Wallet not connected')
    toast({
      title: 'Wallet not connected.',
      description: "Please connect to an account.",
      status: 'warning',
      duration: 5_000,
      isClosable: true,
      position: 'top-right',
    })
  }
  const globalMint = async () => {
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      setIsProcessingGlobalMint(true)
      const res = await fetch('/api/global-mint-test', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'signerName',
          type: 'freeMint',
        })
      });
      const response = await res.json();
      console.debug('app/pages/createCollectionTest.tsx:mint: response', response);
    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingGlobalMint(false)
    }
  } // globalMint

  const createSponsoredCollection = async () => {
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      setIsProcessingSponsoredCollectionCreation(true)
      const res = await fetch('/api/collection-creation-sponsored-test', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'signerName',
          type: 'freeMint',
        })
      });
      const response:CollectionCreationResponseData = await res.json();
      console.debug('app/pages/createCollectionTest.tsx:mint: response', response);
      if (response && response.success) {

        // toast({
        //   title: 'Collection created.',
        //   description: `address: ${response.address}`,
        //   status: 'success',
        //   duration: 60_000,
        //   isClosable: true,
        //   position: 'top-right',
        // })

        const uri = getTxUri(response.address)
        toast({
          duration: 15_000,
          position: 'top-right',
          render: ({ onClose }) => (
            <Box color='black' p={3} bg='green.200' borderRadius='lg'>
              <div className='flex'>
                <CheckCircleIcon boxSize={5} className='ml-1 mr-2'/>
                <Text fontWeight= "bold" >Collection (only) created.</Text>
                <CloseButton size='sm' onClick={onClose} />
              </div>
              <div className='m-2'>
                {uri &&
                  <Link href={uri} isExternal className="flex text-end">
                    <div className='mr-2'>
                      Transaction
                    </div>
                    <ExternalLinkIcon size='16px' />
                  </Link>
                }
              </div>
            </Box>
          ),
        })

        // toast({
        //   title: '(my)Collection created.',
        //   description: `address: ${response.address}`,
        //   status: 'success',
        //   duration: 60_000,
        //   isClosable: true,
        //   position: 'top-right',
        //   render: () => (
        //     <Box color='white' p={3} bg='blue.500' borderRadius='lg'>
        //       <Text>(sponsored) Collection created.</Text>
        //       {uri &&
        //         <Link href={uri} isExternal className="flex text-end">
        //           transaction <ExternalLinkIcon size='32px' />
        //         </Link>
        //       }
        //     </Box>
        //   ),
        // })
      } else {
        console.warn('app/pages/createCollectionTest.tsx:aidrop: response', response);
        toast({
          title: 'Collection creation failed',
          description: response?.error,
          status: 'error',
          duration: 15_000,
          isClosable: true,
          position: 'top-right',
        })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingSponsoredCollectionCreation(false)
    }
  } // createSponsoredCollection

  const createMyCollection = async () => {
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      setIsProcessingMyCollectionCreation(true)
      if (!wallet) {
        console.error('app/pages/createCollectionTest.tsx:createMyCollection: Wallet not found')
        return
      }
      const response = await mplxH_createMyCollection(wallet.adapter)
      console.debug('app/pages/createCollectionTest.tsx:createMyCollection: response', response);
      if (response && response.success) {

        // toast({
        //   title: '(my)Collection created.',
        //   // description: `address: ${response.address}`,
        //   description: `tx: ${getTxUri(response.address)}`,
        //   status: 'success',
        //   duration: 60_000,
        //   isClosable: true,
        //   position: 'top-right',
        // })

        const uri = getTxUri(response.address)
        toast({
          duration: 15_000,
          position: 'top-right',
          render: ({ onClose }) => (
            <Box color='black' p={3} bg='green.200' borderRadius='lg'>
                <div className='flex'>
                <CheckCircleIcon boxSize={5} className='ml-1 mr-2'/>
                <Text fontWeight= "bold" >(own) Collection (only) created.</Text>
                <CloseButton size='sm' onClick={onClose} />
              </div>
              <div className='m-2'>
                {uri &&
                  <Link href={uri} isExternal className="flex text-end">
                    <div className='mr-2'>
                      Transaction
                    </div>
                    <ExternalLinkIcon size='16px' />
                  </Link>
                }
              </div>
            </Box>
          ),
        })
      } else {
        console.warn('app/pages/createCollectionTest.tsx:createMyCollection: response', response);
        toast({
          title: '(my)Collection creation failed',
          description: response?.error,
          status: 'error',
          duration: 15_000,
          isClosable: true,
          position: 'top-right',
        })
      }

    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingMyCollectionCreation(false)
    }
  } // createMyCollection

  const createMyNftCollection = async () => {
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      setIsProcessingMyNftCollectionCreation(true)
      if (!wallet) {
        console.error('app/pages/createCollectionTest.tsx:createMyNftCollection: Wallet not found')
        return
      }

      const year = 2023;
      const month = 12;
      const day = 31;
      const hour = 16;
      const minute = 33;
      const second = 59;
      const millisecond = 0;
      const startDateTime = new Date(year, month, day, hour, minute, second, millisecond);
      // const endDateTime = new Date(year+1, month, day, hour, minute, second, millisecond);
      const endDateTime = null;

      const response = await mplxH_createMyFullNftCollection(
        wallet.adapter,
        'MyNftCollection', // Collection name
        'https://example.com2/my-collection.json', // Collection uri
        'Quick NFT', // NFT prefix name
        5, // NFT count
        'https://example.com/metadata/', // NFT metadata prefix uri
        startDateTime,
        endDateTime
      )
      console.debug('app/pages/createCollectionTest.tsx:createMyNftCollection: response', response);
      if (response && response.success) {

        // toast({
        //   title: '(my)Collection created.',
        //   // description: `address: ${response.address}`,
        //   description: `TODO`,
        //   status: 'success',
        //   duration: 60_000,
        //   isClosable: true,
        //   position: 'top-right',
        // })

        const uriCandyMachine = getAddressUri(response.candyMachineAddress)
        const uriCollection = getAddressUri(response.collectionAddress)

        toast({
          duration: 15_000,
          position: 'top-right',
          render: ({ onClose }) => (
            <Box color='black' p={3} bg='green.200' borderRadius='lg'>
              <div className='flex'>
                <CheckCircleIcon boxSize={5} className='ml-1 mr-2'/>
                <Text fontWeight= "bold" >(own) (full) NFT Collection created.</Text>
                <CloseButton size='sm' onClick={onClose} />
              </div>
              <div className='m-2'>
                {uriCandyMachine &&
                  <Link href={uriCandyMachine} isExternal className="flex text-end">
                    <div className='mr-2'>
                      Candy Machine
                    </div>
                    <ExternalLinkIcon size='16px' />
                  </Link>
                }
                {uriCollection &&
                  <Link href={uriCollection} isExternal className="flex text-end">
                    <div className='mr-2'>
                      Collection
                    </div>
                    <ExternalLinkIcon size='16px' />
                  </Link>
                }
              </div>
            </Box>
          ),
        })
      } else {
        console.warn('app/pages/createCollectionTest.tsx:createMyNftCollection: response', response);
        toast({
          title: '(my)Collection creation failed',
          description: response?.error,
          status: 'error',
          duration: 15_000,
          isClosable: true,
          position: 'top-right',
        })
      }

    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingMyNftCollectionCreation(false)
    }
  } // createMyNftCollection

  return (
    <div className="mx-auto my-20 flex w-full max-w-lg flex-col gap-6 rounded-2xl p-6">
      <Text fontSize='3xl'>Mint(s) test</Text>
      <div className="flex flex-col gap-4 ">

        <Button
          isDisabled={!connected}
          isLoading={isProcessingGlobalMint}
          onClick={globalMint}
          colorScheme='purple'
        >
          GLOBAL Mint test
        </Button>

        <Button
          isDisabled={!connected}
          isLoading={isProcessingSponsoredCollectionCreation}
          onClick={createSponsoredCollection}
          colorScheme='green'
        >
          Create sponsored collection (fees paid by the app)
        </Button>

        <Button
          isDisabled={!connected}
          isLoading={isProcessingMyCollectionCreation}
          onClick={createMyCollection}
          colorScheme='orange'
        >
          Create My own collection (fees paid by wallet owner)
        </Button>

        <Button
          isDisabled={!connected}
          isLoading={isProcessingMyNftCollectionCreation}
          onClick={createMyNftCollection}
          colorScheme='red'
        >
          Create My own NFT collection (fees paid by wallet owner)
        </Button>


      </div>

    </div>
  )
}
