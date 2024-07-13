import { Button, Text, useToast } from "@chakra-ui/react"
// import { Typography } from "@components/ui/typography"
import { /* useConnection, */ useWallet } from "@solana/wallet-adapter-react"
import { useMemo, useState } from "react"
// import { WalletNotConnectedError } from "@solana/wallet-adapter-base"
// import React from "react"



export default function MintTestPage() {

  const { connected, publicKey: connectedWalletPublicKey } = useWallet()
  const [isProcessingAirdrop, setIsProcessingAirdrop] = useState(false)
  const [isProcessingMint, setIsProcessingMint] = useState(false)


  // const isConnected = connected && publicKey

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


  const airdrop = async () => {
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      setIsProcessingAirdrop(true)
      const res = await fetch('/api/airdrop-test', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: connectedWalletPublicKey?.toBase58(),
        })
      });
      const response = await res.json();
      if (response && response.success && response.amount) {
        console.debug('app/pages/mintTest.tsx:aidrop: response', response);
        toast({
          title: 'Wallet airdropped.',
          description: `received ${response.amount} sol.`,
          status: 'success',
          duration: 5_000,
          isClosable: true,
          position: 'top-right',
        })
      } else {
        console.warn('app/pages/mintTest.tsx:aidrop: response', response);
        toast({
          title: 'Airdrop failed ?',
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
      setIsProcessingAirdrop(false)
    }
  }

  const mint = async () => {
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      setIsProcessingMint(true)
      const res = await fetch('/api/mint-test', {
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
      setIsProcessingMint(false)
    }
  }

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
          onClick={airdrop}
          colorScheme='green'
        >
          Airdrop
        </Button>
        <Button
          isDisabled={!connected}
          isLoading={isProcessingMint}
          onClick={mint}
          colorScheme='blue'
        >
          Mint
        </Button>
      </div>
    </div>
  )
}
