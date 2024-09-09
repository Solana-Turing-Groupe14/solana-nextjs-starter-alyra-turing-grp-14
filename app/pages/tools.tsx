import { CheckCircleIcon } from '@chakra-ui/icons'
import {
  Box, Button, Center, CloseButton, Container, FormControl, FormLabel,
  Heading, Input, InputGroup, Link, SimpleGrid, Text, useColorModeValue, useToast, VStack
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { motion } from "framer-motion"
import { ExternalLinkIcon, SendIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { TOAST_ERROR_DELAY, TOAST_SUCCESS_DELAY, TOAST_WARN_DELAY, TOAST_POSITION } from '@consts/client'
import { AIRDROP_DEFAULT_AMOUNT, AIRDROP_MAX_AMOUNT } from '@consts/commons'
import { getAddressUri, shortenAddress } from "@helpers/solana.helper"
import { AirdropResponseData } from "types"

const FILEPATH = 'app/pages/tools.tsx'

export default function ToolsPage() {
  const { connected, publicKey: connectedWalletPublicKey } = useWallet();
  const [isProcessingConnectedWalletAirdrop, setIsProcessingConnectedWalletAirdrop] = useState(false);
  const [isProcessingApp1AddressAirdrop, setIsProcessingApp1AddressAirdrop] = useState(false);
  const [isProcessingApp2AddressAirdrop, setIsProcessingApp2AddressAirdrop] = useState(false);
  const [isProcessingAppDefaultAddressAirdrop, setIsProcessingAppDefaultAddressAirdrop] = useState(false);
  const [airdropAmount, setAirdropAmount] = useState<number>(AIRDROP_DEFAULT_AMOUNT);

  const toast = useToast();
  
  const bgColor = useColorModeValue("purple.50", "gray.800");
  const cardBgColor = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const headingColor = useColorModeValue("purple.600", "purple.300");
  const buttonColorScheme = "purple";
  const inputBgColor = useColorModeValue("gray.100", "gray.600");
  const toastSuccessBgColor = useColorModeValue("green.500", "green.200");
  const toastTextColor = useColorModeValue("white", "gray.800");

  const isConnected = useMemo(() => connected && connectedWalletPublicKey, [connected, connectedWalletPublicKey]);

  const warnIsNotConnected = () => {
    console.warn(`${FILEPATH}:  Wallet not connected`)
    // throw new WalletNotConnectedError()
    toast({
      title: 'Wallet not connected.',
      description: "Please connect to an account.",
      status: 'warning',
      duration: TOAST_WARN_DELAY,
      isClosable: true,
      position: TOAST_POSITION,
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
      // console.debug('app/pages/mintTest.tsx:aidrop: response', response);
      if (response && response.success && response.amount) {
        const addressUri = getAddressUri(address)
        const shortenedAddress = shortenAddress(address)
        toast({
          duration: TOAST_SUCCESS_DELAY,
          position: TOAST_POSITION,
          render: ({ onClose }) => (
            <Box
              bg={toastSuccessBgColor}
              color={toastTextColor}
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
          duration: TOAST_ERROR_DELAY,
          isClosable: true,
          position: TOAST_POSITION,
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
      // console.debug(`${LOGPREFIX}event.target.value: `, event.target.value)
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
            duration: TOAST_WARN_DELAY,
            isClosable: true,
            position: TOAST_POSITION,
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
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={10}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <VStack spacing={8} align="stretch">
            <Box textAlign="center" mb={6}>
              <Heading as="h1" size="2xl" mb={4} color={headingColor}>
                Airdrop Tools
              </Heading>
              <Text fontSize="xl" color={textColor}>
                Easily airdrop SOL to various wallets
              </Text>
            </Box>

            <Box bg={cardBgColor} boxShadow="xl" borderRadius="xl" p={8}>
              <Center w="100%" h="100%" mb={6}>
                <SendIcon size={64} color={headingColor} />
              </Center>

              <SimpleGrid columns={[1, 2]} spacing={6}>
                <Button
                  isDisabled={!connected || !isValidAirdropAmount}
                  isLoading={isProcessingConnectedWalletAirdrop}
                  onClick={airdropConnectedWallet}
                  colorScheme={buttonColorScheme}
                  size="lg"
                  width="full"
                >
                  Airdrop Connected Wallet
                </Button>

                <Button
                  isDisabled={!connected || !isValidAirdropAmount}
                  isLoading={isProcessingApp1AddressAirdrop}
                  onClick={airdropApp1Wallet}
                  colorScheme={buttonColorScheme}
                  variant="outline"
                  size="lg"
                  width="full"
                >
                  Airdrop APP 1 Wallet
                </Button>

                <Button
                  isDisabled={!connected || !isValidAirdropAmount}
                  isLoading={isProcessingApp2AddressAirdrop}
                  onClick={airdropApp2Wallet}
                  colorScheme={buttonColorScheme}
                  variant="outline"
                  size="lg"
                  width="full"
                >
                  Airdrop APP 2 Wallet
                </Button>

                <Button
                  isDisabled={!connected || !isValidAirdropAmount}
                  isLoading={isProcessingAppDefaultAddressAirdrop}
                  onClick={airdropAppDefaultWallet}
                  colorScheme={buttonColorScheme}
                  variant="outline"
                  size="lg"
                  width="full"
                >
                  Airdrop APP Default Wallet
                </Button>
              </SimpleGrid>

              <form onSubmit={handleDefaultSubmit} style={{ marginTop: "2rem" }}>
                <FormControl>
                  <FormLabel color={textColor}>Airdrop Amount</FormLabel>
                  <InputGroup>
                    <Input
                      type="number"
                      min={0}
                      max={AIRDROP_MAX_AMOUNT}
                      value={airdropAmount}
                      onChange={handleChangeAirdropAmount}
                      placeholder="Enter airdrop amount"
                      bg={inputBgColor}
                      color={textColor}
                      borderRadius="md"
                    />
                  </InputGroup>
                </FormControl>
              </form>
            </Box>
          </VStack>
        </motion.div>
      </Container>
    </Box>
  );
}