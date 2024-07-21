import { CheckCircleIcon } from '@chakra-ui/icons'
import {
  Box, Button, Center, CloseButton, Container, FormControl, FormLabel,
  Heading, Input, InputGroup, Link, SimpleGrid, Text, useColorModeValue, useToast, VStack
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { motion } from "framer-motion"
import { ExternalLinkIcon, SendIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { ERROR_DELAY, SUCCESS_DELAY, WARN_DELAY } from '@consts/client'
import { AIRDROP_DEFAULT_AMOUNT, AIRDROP_MAX_AMOUNT } from '@consts/commons'
import { getAddressUri, shortenAddress } from "@helpers/solana.helper"
import { AirdropResponseData } from "types"
import { FILE } from 'dns'

const FILEPATH = 'app/pages/tools.tsx'

export default function ToolsPage() {

  const { connected, publicKey: connectedWalletPublicKey } = useWallet()
  const [isProcessingConnectedWalletAirdrop, setIsProcessingConnectedWalletAirdrop] = useState(false)
  const [isProcessingApp1AddressAirdrop, setIsProcessingApp1AddressAirdrop] = useState(false)
  const [isProcessingApp2AddressAirdrop, setIsProcessingApp2AddressAirdrop] = useState(false)
  const [isProcessingAppDefaultAddressAirdrop, setIsProcessingAppDefaultAddressAirdrop] = useState(false)

  const [airdropAmount, setAirdropAmount] = useState<number>(AIRDROP_DEFAULT_AMOUNT)

  const isConnected = useMemo(() => {
    console.debug(`${FILEPATH}:isConnected: ${ connected && connectedWalletPublicKey}`)
    return connected && connectedWalletPublicKey
  }, [connected, connectedWalletPublicKey]);

  const toast = useToast()
  const toastSuccessBgColor = useColorModeValue("green.600", "green.200")
  const toastTestColor = useColorModeValue("white", "black")

  const bgColor = useColorModeValue("gray.50", "gray.800")
  const cardBgColor = useColorModeValue("white", "gray.700")
  const buttonTextColor = useColorModeValue("gray.800", "white")

  const warnIsNotConnected = () => {
    console.warn(`${FILEPATH}:  Wallet not connected`)
    // throw new WalletNotConnectedError()
    toast({
      title: 'Wallet not connected.',
      description: "Please connect to an account.",
      status: 'warning',
      duration: WARN_DELAY,
      isClosable: true,
      position: 'top-right',
    })
  }

  // const isValidAirdropAmount = (amount:number) => {
  //   return amount >= 0 && amount <= AIRDROP_MAX_AMOUNT
  // } // isValidAirdropAmount

  const isValidAirdropAmount = useMemo(() => {
    return airdropAmount > 0 && airdropAmount <= AIRDROP_MAX_AMOUNT
  }, [airdropAmount])

  // ----------------------------

  const airdropWallet = async (
    address: string,
    amount: number,
    name: string | null | undefined
  ) => {
    // Guard
    if (!isConnected) {
      warnIsNotConnected(); return
    }
    try {
      if (!address) {
        throw new Error('Address is required')
      }
      const res = await fetch('/api/airdrop', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: address,
          amount: amount,
        })
      });
      const response: AirdropResponseData = await res.json();
      console.debug('app/pages/mintTest.tsx:aidrop: response', response);
      if (response && response.success && response.amount) {
        const addressUri = getAddressUri(address)
        const shortenedAddress = shortenAddress(address)
        toast({
          duration: SUCCESS_DELAY,
          position: 'top-right',
          render: ({ onClose }) => (
            <Box
              bg={toastSuccessBgColor}
              color={toastTestColor}
              borderRadius='lg'
              p={4}
            >
              <div className='flex justify-between'>
                <div className='flex '>
                  <CheckCircleIcon boxSize={5} className='ml-1 mr-2' />
                  <Text fontWeight="bold" >Wallet airdropped</Text>
                </div>
                <CloseButton size='sm' onClick={onClose} />
              </div>
              <div className='px-2 py-1'>
                {name ?
                  <div className='p-1'>
                    <div className='flex'>
                      <Text>{name}</Text>
                      <Text className='p-1'>received</Text>
                      <Text className='p-1' fontWeight="bold">{response.amount}</Text>
                      <Text>SOL.</Text>
                    </div>
                  </div>
                  :
                  <div className='p-1'>
                    <Text>{address}</Text>
                    <div className='flex'>
                      <Text className='p-1'>received</Text>
                      <Text className='p-1' fontWeight="bold">{response.amount}</Text>
                      <Text>SOL.</Text>
                    </div>
                  </div>
                }
              </div>
              <div className='m-2'>
                {addressUri &&
                  <Link href={addressUri} isExternal className="flex text-end">
                    <div className='mr-2'>
                      {/* {name?name:shortenedAddress} */}
                      {name ? name : shortenedAddress}
                    </div>
                    <ExternalLinkIcon size='16px' />
                  </Link>
                }
              </div>
            </Box>
          ),
        })

      } else {
        const error = (response && response.success === false ? response.error : 'Unknown error')
        toast({
          title: 'Airdrop failed',
          description: error,
          status: 'error',
          duration: ERROR_DELAY,
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
      const address: string = connectedWalletPublicKey?.toBase58() || ''
      airdropWallet(address, airdropAmount, null)
    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingConnectedWalletAirdrop(false)
    }
  } // airdropConnectedWallet

  const airdropApp1Wallet = async () => {
    try {
      setIsProcessingApp1AddressAirdrop(true)
      const address: string = process.env.NEXT_PUBLIC_MINTAP01 || ''
      airdropWallet(address, airdropAmount, 'App 1')
    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingApp1AddressAirdrop(false)
    }
  } // airdropApp1Wallet

  const airdropApp2Wallet = async () => {
    try {
      setIsProcessingApp2AddressAirdrop(true)
      const address: string = process.env.NEXT_PUBLIC_MINTAP02 || ''
      airdropWallet(address, airdropAmount, 'App 2')
    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingApp2AddressAirdrop(false)
    }
  } // airdropApp2Wallet

  const airdropAppDefaultWallet = async () => {
    try {
      setIsProcessingAppDefaultAddressAirdrop(true)
      const address: string = process.env.NEXT_PUBLIC_MINT_APP_DEFAULT || ''
      airdropWallet(address, airdropAmount, 'App Default')
    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingAppDefaultAddressAirdrop(false)
    }
  } // airdropAppDefaultWallet

  // ----------------------------

  const handleDefaultSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  } // handleDefaultSubmit

  const handleChangeAirdropAmount = (event: React.ChangeEvent<HTMLInputElement>) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeAirdropAmount: `
    try {
      console.debug(`${LOGPREFIX}event.target.value: `, event.target.value)
      let value: number
      if (typeof event.target.value === 'string') {
        value = parseInt(event.target.value)
        if (isNaN(value)) {
          return
        }
        if (value < 0) {
          value = 0
        }
        if (value > AIRDROP_MAX_AMOUNT) {
          toast({
            title: 'Airdrop amount too high',
            description: `Airdrop amount must be at most ${AIRDROP_MAX_AMOUNT}`,
            status: 'warning',
            duration: WARN_DELAY,
            isClosable: true,
            position: 'top-right',
          })
          value = AIRDROP_MAX_AMOUNT
        }
        setAirdropAmount(value)
      }
    } catch (error) {
      console.error(`${LOGPREFIX}error: `, error)
    }
  } // handleChangeAirdropAmount

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
            Airdrop Tools
          </Heading>

          <Box bg={cardBgColor} w='100%' p={8} borderRadius="lg" boxShadow="md">
            <Center w='100%' h='100%' mb={6}>
              <SendIcon size={64} />
            </Center>

            <SimpleGrid columns={[1, 2]} spacing={4}>
              <Button
                isDisabled={!connected || !isValidAirdropAmount}
                isLoading={isProcessingConnectedWalletAirdrop}
                onClick={airdropConnectedWallet}
                colorScheme='green'
                variant='outline'
                size="lg"
                color={buttonTextColor}
              >
                Airdrop Connected Wallet
              </Button>

              <Button
                isDisabled={!connected || !isValidAirdropAmount}
                isLoading={isProcessingApp1AddressAirdrop}
                onClick={airdropApp1Wallet}
                colorScheme='orange'
                variant='outline'
                size="lg"
                color={buttonTextColor}
              >
                Airdrop APP 1 Wallet
              </Button>

              <Button
                isDisabled={!connected || !isValidAirdropAmount}
                isLoading={isProcessingApp2AddressAirdrop}
                onClick={airdropApp2Wallet}
                colorScheme='purple'
                variant='outline'
                size="lg"
                color={buttonTextColor}
              >
                Airdrop APP 2 Wallet
              </Button>

              <Button
                isDisabled={!connected || !isValidAirdropAmount}
                isLoading={isProcessingAppDefaultAddressAirdrop}
                onClick={airdropAppDefaultWallet}
                colorScheme='red'
                variant='outline'
                size="lg"
                color={buttonTextColor}
              >
                Airdrop APP Default Wallet
              </Button>
            </SimpleGrid>

            <form onSubmit={handleDefaultSubmit} className="mt-6">
              <FormControl>
                <FormLabel>Airdrop Amount</FormLabel>
                <InputGroup>
                  <Input
                    type='number'
                    min={0}
                    max={AIRDROP_MAX_AMOUNT}
                    value={airdropAmount}
                    onChange={handleChangeAirdropAmount}
                    placeholder='Airdrop amount'
                    bg={bgColor}
                  />
                </InputGroup>
              </FormControl>
            </form>
          </Box>
        </VStack>
      </motion.div>
    </Container>
  )
}