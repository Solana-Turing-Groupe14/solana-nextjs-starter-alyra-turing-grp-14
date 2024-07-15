import { Box, Button, Link, Text, useToast } from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useMemo, useState } from "react"
import { createMyCollection as mplxH_createMyCollection } from "@helpers/mplx.helpers"
import { CollectionCreationResponseData } from "types"
import { getTxUri } from "@helpers/solana.helper"
import { ExternalLinkIcon } from "lucide-react"

export default function MintTestPage() {

  const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()
  const [isProcessingGlobalMint, setIsProcessingGlobalMint] = useState(false)
  const [isProcessingSponsoredCollectionCreation, setIsProcessingSponsoredCollectionCreation] = useState(false)
  const [isProcessingMyCollectionCreation, setIsProcessingMyCollectionCreation] = useState(false)

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
      console.debug('app/pages/mintTest.tsx:mint: response', response);
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
      console.debug('app/pages/mintTest.tsx:mint: response', response);
      if (response && response.success) {
        toast({
          title: 'Collection created.',
          // description: `address: ${response.address}`,
          description: `tx: ${getTxUri(response.address)}`,
          status: 'success',
          duration: 60_000,
          isClosable: true,
          position: 'top-right',
        })

        const uri = getTxUri(response.address)
        toast({
          title: '(my)Collection created.',
          description: `address: ${response.address}`,
          status: 'success',
          duration: 60_000,
          isClosable: true,
          position: 'top-right',
          render: () => (
            <Box color='white' p={3} bg='blue.500' borderRadius='lg'>
              <Text>(sponsored) Collection created.</Text>
              {uri &&
                <Link href={uri} isExternal className="flex text-end">
                  transaction <ExternalLinkIcon size='32px' />
                </Link>
              }
            </Box>
          ),
        })
      } else {
        console.warn('app/pages/mintTest.tsx:aidrop: response', response);
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
  } // mint

  const createMyCollection = async () => {
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      setIsProcessingMyCollectionCreation(true)
      if (!wallet) {
        console.error('app/pages/mintTest.tsx:createMyCollection: Wallet not found')
        return
      }
      const response = await mplxH_createMyCollection(wallet.adapter)
      console.debug('app/pages/mintTest.tsx:createMyCollection: response', response);
      if (response && response.success) {
        const uri = getTxUri(response.address)
        toast({
          title: '(my)Collection created.',
          description: `address: ${response.address}`,
          status: 'success',
          duration: 60_000,
          isClosable: true,
          position: 'top-right',
          render: () => (
            <Box color='white' p={3} bg='blue.500' borderRadius='lg'>
              <Text>(own) Collection created.</Text>
              {uri &&
                <Link href={uri} isExternal className="flex text-end">
                  transaction <ExternalLinkIcon size='32px' />
                </Link>
              }
            </Box>
          ),
        })
      } else {
        console.warn('app/pages/mintTest.tsx:createMyCollection: response', response);
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
  } // mint

  return (
    <div className="mx-auto my-20 flex w-full max-w-md flex-col gap-6 rounded-2xl p-6">
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
          colorScheme='orange'
        >
          Create sponsored collection (fees paid by the app)
        </Button>

        <Button
          isDisabled={!connected}
          isLoading={isProcessingMyCollectionCreation}
          onClick={createMyCollection}
          colorScheme='red'
        >
          Create My own collection (fees paid by wallet owner)
        </Button>


      </div>

    </div>
  )
}
