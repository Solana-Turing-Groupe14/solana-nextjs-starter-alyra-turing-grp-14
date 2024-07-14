import { Button, Text, useToast } from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useMemo, useState } from "react"
import { createMyCollection as mplxH_createMyCollection } from "@helpers/mplx.helpers"
import { AirdropResponseData,
  CollectionCreationResponseData
} from "types"

export default function MintTestPage() {

  const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()
  const [isProcessingAirdrop, setIsProcessingAirdrop] = useState(false)
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
    // throw new WalletNotConnectedError()
    toast({
      title: 'Wallet not connected.',
      description: "Please connect to an account.",
      status: 'warning',
      duration: 5_000,
      isClosable: true,
      position: 'top-right',
    })
  }


  const airdropConnectedWallet = async () => {
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      setIsProcessingAirdrop(true)
      const address:string = connectedWalletPublicKey?.toBase58()||''
      const res = await fetch('/api/airdrop-test', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: address,
        })
      });
      const response:AirdropResponseData = await res.json();
      console.debug('app/pages/mintTest.tsx:aidrop: response', response);
      if (response && response.success && response.amount) {
        toast({
          title: 'Wallet airdropped.',
          description: `received ${response.amount} sol.`,
          status: 'success',
          duration: 5_000,
          isClosable: true,
          position: 'top-right',
        })
      } else {
        const error = (response && response.success === false ? response.error : 'Unknown error') 
        toast({
          title: 'Airdrop failed',
          description: error,
          status: 'error',
          duration: 15_000,
          isClosable: true,
          position: 'top-right',
        })
      }

    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingAirdrop(false)
    }
  } // airdrop

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
        console.debug('app/pages/mintTest.tsx:mint: response', response);
        toast({
          title: 'Collection created.',
          description: `address: ${response.address}`,
          status: 'success',
          duration: 60_000,
          isClosable: true,
          position: 'top-right',
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
      const r = await mplxH_createMyCollection(wallet.adapter)
      console.debug('app/pages/mintTest.tsx:createMyCollection: response', r);
      if (r && r.success) {
        toast({
          title: '(my)Collection created.',
          description: `address: ${r.address}`,
          status: 'success',
          duration: 60_000,
          isClosable: true,
          position: 'top-right',
        })
      } else {
        console.warn('app/pages/mintTest.tsx:createMyCollection: response', r);
        toast({
          title: '(my)Collection creation failed',
          description: r?.error,
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

{/*       <Typography as="h2" level="h6" className="font-bold">
        Mint(s) test
      </Typography>
 */}
      <Text fontSize='3xl'>Mint(s) test</Text>
      <div className="flex flex-col gap-4 ">

        <Button
          isDisabled={!connected}
          isLoading={isProcessingAirdrop}
          onClick={airdropConnectedWallet}
          colorScheme='green'
        >
          Airdrop connected wallet
        </Button>

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
