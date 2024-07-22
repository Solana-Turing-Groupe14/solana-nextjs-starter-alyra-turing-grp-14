import {
  Box, Center, Container, FormControl, FormLabel,
  Heading, Input, InputGroup, Link, Text, useColorModeValue, VStack
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { ExternalLinkIcon, QrCode as QrCodeLucid,
} from "lucide-react"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { QrCode } from "@components/ui/qrCode"
import { DISPLAY_DIRECT_MINT_FROM_QR_URI_PATH, MINT_URI_PATH } from '@consts/client'
import { ADDRESS_LENGTH } from '@consts/commons'
import { HOST, PORT } from "@consts/host"

const FILEPATH = 'app/pages/qr/displayQrToMintPage/index.tsx'

export default function ToolsPage() {

  const DEFAULT_CANDY_MACHINE_ADDRESS = ''
  const DEFAULT_URL = ''

  const router = useRouter()
  const { query } = router;
  const { candyMachineAddress: queryCandyMachineAddress } = query
  const [candyMachineAddress, setCandyMachineAddress] = useState<string>(DEFAULT_CANDY_MACHINE_ADDRESS)
  const [urlToMintPage, setUrlToMintPage] = useState<string>(DEFAULT_URL)
  const [urlToDirectMintQrPage, setUrlToDirectMintQrPage] = useState<string>(DEFAULT_URL)

  const bgColor = useColorModeValue("gray.50", "gray.800")
  const cardBgColor = useColorModeValue("white", "gray.700")

  // ----------------------------

  const getMintPageUri = useCallback((_candyMachineAddress: string) => {
    const LOGPREFIX = `${FILEPATH}:getMintPageUri: `
    try {
      const mintPath = HOST + (PORT?`:${PORT}`:'') + MINT_URI_PATH + '?candyMachineAddress=' + _candyMachineAddress
      return mintPath
    } catch (error) {
      console.error(`${LOGPREFIX}error: `, error)
    }
    return ''
  }, 
  []
  ) // getMintPageUri

  const getDirectMintQrPageUri = useCallback((_candyMachineAddress: string) => {
    const LOGPREFIX = `${FILEPATH}:getMintPageUri: `
    try {
      const mintPath = HOST + (PORT?`:${PORT}`:'') + DISPLAY_DIRECT_MINT_FROM_QR_URI_PATH + '?candyMachineAddress=' + _candyMachineAddress
      return mintPath
    } catch (error) {
      console.error(`${LOGPREFIX}error: `, error)
    }
    return ''
  }, 
  []
  ) // getDirectMintQrPageUri

  const candyMachineMintPageUri = useMemo(() => {
    return getMintPageUri(candyMachineAddress)
  }, [candyMachineAddress, getMintPageUri])

  const candyMachineDirectMintQr = useMemo(() => {
    return getDirectMintQrPageUri(candyMachineAddress)
  }, [candyMachineAddress, getDirectMintQrPageUri])

  // ----------------------------

  const handleDefaultSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  } // handleDefaultSubmit

  // ----------------------------

  const handleChangeCandyMachineAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeCandyMachineAddress: `
    try {
      const newCandyMachineAddress = event.target.value
      setCandyMachineAddress(newCandyMachineAddress)
      const mintPagePath = getMintPageUri(newCandyMachineAddress)
      setUrlToMintPage(mintPagePath)
      const directMintQrPagePath =  getDirectMintQrPageUri(newCandyMachineAddress)
      setUrlToDirectMintQrPage(directMintQrPagePath)
    } catch (error) {
      console.error(`${LOGPREFIX}error: `, error)
    }
  } // handleChangeCandyMachineAddress

  // ----------------------------

  useEffect(() => {
    const init = async () => {
      if (!candyMachineAddress && queryCandyMachineAddress) {
        setCandyMachineAddress(queryCandyMachineAddress.toString())
        setUrlToMintPage(getMintPageUri(queryCandyMachineAddress.toString()))
        setUrlToDirectMintQrPage(getDirectMintQrPageUri(queryCandyMachineAddress.toString()))
    } // if
  } // init
    init()
  }, [candyMachineAddress, getDirectMintQrPageUri, getMintPageUri, queryCandyMachineAddress])

  // ----------------------------

  const textColor = useColorModeValue("black", "white")
  const linkColor = useColorModeValue("teal.500", "teal.300")

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
            Display QR Code (link to) mint page
          </Heading>

          <Box bg={cardBgColor} w='100%' p={8} borderRadius="lg" boxShadow="md">
            <Center w='100%' h='100%' mb={6}>
              <QrCodeLucid className="transition-all delay-500 sm:size-12 md:size-24 xl:size-32" />
            </Center>

            <form onSubmit={handleDefaultSubmit} className="mt-6">
              <FormControl>

                <FormLabel>Candy Machine</FormLabel>
                <InputGroup>
                  <Input
                    type='string'
                    maxLength={ADDRESS_LENGTH}
                    value={candyMachineAddress}
                    onChange={handleChangeCandyMachineAddress}
                    placeholder='Candy Machine Address'
                    bg={bgColor}
                  />
                </InputGroup>

                <FormLabel>Url to Mint page</FormLabel>
                <InputGroup>
                  <Input
                    type='string'

                    value={urlToMintPage}
                    // onChange={handleChangeUrl}
                    isReadOnly={true}
                    placeholder='Url'
                    bg={bgColor}
                  />
                </InputGroup>

                <FormLabel>Url to Direct Mint QR page</FormLabel>
                <InputGroup>
                  <Input
                    type='string'

                    value={urlToDirectMintQrPage}
                    // onChange={handleChangeUrl}
                    isReadOnly={true}
                    placeholder='Url'
                    bg={bgColor}
                  />
                </InputGroup>

              </FormControl>
            </form>

          </Box>
        </VStack>

      </motion.div>

      <Box
        className='mt-3 justify-center p-1'
        border={'1px solid '}
        borderRadius={'md'}
        display={ (candyMachineAddress && candyMachineMintPageUri.length ? '' : 'none') }
      >
      <Box
            className='mt-1 overflow-hidden p-1'
            border={'none '}
            borderRadius={'md'}
            display={ (candyMachineAddress && candyMachineMintPageUri.length ? '' : 'none') }
          >
            <Text className='flex pr-2'>
              Mint page:
            </Text>
            <Link color={linkColor} isExternal href={candyMachineMintPageUri} className='flex'>
              <Text className='pr-2' color={textColor}>
                <ExternalLinkIcon size='16px' />
              </Text>
                {candyMachineAddress}
            </Link>
        </Box>

        <QrCode text={candyMachineMintPageUri} id={candyMachineAddress} />

      </Box>

      <Box
        className='mt-3 justify-center p-1'
        border={'1px solid '}
        borderRadius={'md'}
        display={ (candyMachineAddress && candyMachineDirectMintQr.length ? '' : 'none') }
      >
      <Box
            className='mt-1 overflow-hidden p-1'
            border={'none '}
            borderRadius={'md'}
            display={ (candyMachineAddress && candyMachineDirectMintQr.length ? '' : 'none') }
          >
            <Text className='flex pr-2'>
              QR Direct Mint:
            </Text>
            <Link color={linkColor} isExternal href={candyMachineDirectMintQr} className='flex'>
              <Text className='pr-2' color={textColor}>
                <ExternalLinkIcon size='16px' />
              </Text>
                {candyMachineAddress}
            </Link>
        </Box>

        <QrCode text={candyMachineDirectMintQr} id={candyMachineAddress} />

      </Box>

    </Container>
  )
}