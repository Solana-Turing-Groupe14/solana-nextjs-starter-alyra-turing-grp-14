import { Box, Button, Center, Stack, Text, useToast } from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { SendIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { AirdropResponseData } from "types"

export default function MintTestPage() {

  const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()
  const [isProcessingConnectedWalletAirdrop, setIsProcessingConnectedWalletAirdrop] = useState(false)
  const [isProcessingApp1AddressAirdrop, setIsProcessingApp1AddressAirdrop] = useState(false)
  const [isProcessingApp2AddressAirdrop, setIsProcessingApp2AddressAirdrop] = useState(false)
  const [isProcessingAppDefaultAddressAirdrop, setIsProcessingAppDefaultAddressAirdrop] = useState(false)

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

  const airdropWallet = async (address:string) => {
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      if (!address) {
        throw new Error('Address is required')
      }
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
          description: `${response.address} received ${response.amount} sol.`,
          status: 'success',
          duration: 10_000,
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
    }
  } // airdropWallet

  const airdropConnectedWallet = async () => {
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      setIsProcessingConnectedWalletAirdrop(true)
      const address:string = connectedWalletPublicKey?.toBase58()||''
      airdropWallet(address)
    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingConnectedWalletAirdrop(false)
    }
  } // airdropConnectedWallet

  const airdropApp1Wallet = async () => {
    try {
      setIsProcessingApp1AddressAirdrop(true)
      const address:string = process.env.NEXT_PUBLIC_MINTAP01||''
      airdropWallet(address)
    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingApp1AddressAirdrop(false)
    }
  } // airdropApp1Wallet

  const airdropApp2Wallet = async () => {
    try {
      setIsProcessingApp2AddressAirdrop(true)
      const address:string = process.env.NEXT_PUBLIC_MINTAP02||''
      airdropWallet(address)
    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingApp2AddressAirdrop(false)
    }
  } // airdropApp2Wallet

  const airdropAppDefaultWallet = async () => {
    try {
      setIsProcessingAppDefaultAddressAirdrop(true)
      const address:string = process.env.NEXT_PUBLIC_MINT_APP_DEFAULT||''
      airdropWallet(address)
    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingAppDefaultAddressAirdrop(false)
    }
  } // airdropAppDefaultWallet


  return (
    <div className="mx-auto my-20 flex w-full max-w-md flex-col gap-6 rounded-2xl p-6">
      <Text fontSize='3xl'>Tool(s)</Text>
      <div className="flex flex-col gap-4 ">

      <Box bg='' w='100%' p={4} color=''>

      <Center w='100%' h='100%' bg='' color=''>
        <SendIcon size='64' />
      </Center>
        

        <Stack direction='column' spacing={4} align='center'>

          <Button
            isDisabled={!connected}
            isLoading={isProcessingConnectedWalletAirdrop}
            onClick={airdropConnectedWallet}
            colorScheme='green' variant='outline'
          >
            Airdrop connected wallet
          </Button>

          <Button
            isDisabled={!connected}
            isLoading={isProcessingApp1AddressAirdrop}
            onClick={airdropApp1Wallet}
            colorScheme='orange' variant='outline'
          >
            Airdrop APP 1 wallet
          </Button>

          <Button
            isDisabled={!connected}
            isLoading={isProcessingApp2AddressAirdrop}
            onClick={airdropApp2Wallet}
            colorScheme='purple' variant='outline'
          >
            Airdrop APP 2 wallet
          </Button>

          <Button
            isDisabled={!connected}
            isLoading={isProcessingAppDefaultAddressAirdrop}
            onClick={airdropAppDefaultWallet}
            colorScheme='red' variant='outline'
          >
            Airdrop APP Default wallet
          </Button>

        </Stack>
</Box>



      </div>

    </div>
  )
}
