import {
  Box, Center, Container, FormControl, FormLabel, Heading,
  Input, InputGroup, Link, Text, useColorModeValue, VStack
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { ExternalLinkIcon, QrCode as QrCodeLucid,
} from "lucide-react"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { QrCode } from "@components/ui/qrCode"
import { DIRECT_MINT_FROM_QR_URI_PATH } from '@consts/client'
import { ADDRESS_LENGTH } from '@consts/commons'
import { HOST, PORT } from "@consts/host"

const FILEPATH = 'app/pages/qr/displayDirectMintQr/index.tsx'

export default function DisplayDirectMintQrPage() {

  const DEFAULT_CANDY_MACHINE_ADDRESS = ''
  const DEFAULT_URL = ''

  const router = useRouter()
  const { query } = router;
  const { candyMachineAddress: queryCandyMachineAddress } = query

  const [candyMachineAddress, setCandyMachineAddress] = useState<string>(DEFAULT_CANDY_MACHINE_ADDRESS)

  const [url, setUrl] = useState<string>(DEFAULT_URL)

  const bgColor = useColorModeValue("gray.50", "gray.800")
  const cardBgColor = useColorModeValue("white", "gray.700")

  // ----------------------------

  const candyMachinedisplayDirectMintQrUri = useMemo(() => {
    const mintPath = HOST + (PORT?`:${PORT}`:'') + DIRECT_MINT_FROM_QR_URI_PATH + '?candyMachineAddress=' + candyMachineAddress
    return mintPath
  }, [candyMachineAddress])

  // ----------------------------

  const handleDefaultSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  } // handleDefaultSubmit

  // ----------------------------

  const getMintUri = (_candyMachineAddress: string) => {
    const LOGPREFIX = `${FILEPATH}:getMintUri: `
    try {
      const mintPath = HOST + (PORT?`:${PORT}`:'') + DIRECT_MINT_FROM_QR_URI_PATH + '?candyMachineAddress=' + _candyMachineAddress
      return mintPath
    } catch (error) {
      console.error(`${LOGPREFIX}error: `, error)
    }
    return ''
  } // getMintUri

  // ----------------------------

  const handleChangeCandyMachineAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeCandyMachineAddress: `
    try {
      const newCandyMachineAddress = event.target.value
      setCandyMachineAddress(newCandyMachineAddress)
      const mintPath =  getMintUri(newCandyMachineAddress)
      setUrl(mintPath)
    } catch (error) {
      console.error(`${LOGPREFIX}error: `, error)
    }
  } // handleChangeCandyMachineAddress

  // ----------------------------

  useEffect(() => {
    const init = async () => {
      if (!candyMachineAddress && queryCandyMachineAddress) {
        setCandyMachineAddress(queryCandyMachineAddress.toString())
        setUrl(getMintUri(queryCandyMachineAddress.toString()))
    } // if
  } // init
    init()
  }, [candyMachineAddress, queryCandyMachineAddress])

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
            TODO: MINT with QR
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

                <FormLabel className="mt-2">Url</FormLabel>
                <InputGroup>
                  <Input
                    type='string'

                    value={url}
                    // onChange={handleChangeUrl}
                    isReadOnly={true}
                    placeholder='Url'
                    bg={bgColor}
                  />
                </InputGroup>

                <Box
                  className='mt-3 overflow-hidden p-1'
                  border={'1px solid '}
                  borderRadius={'md'}
                  display={ (candyMachineAddress && candyMachinedisplayDirectMintQrUri.length ? '' : 'none') }
                >
                  <Text className='m-2 flex pr-2'>
                    Mint page Url:
                  </Text>
                  <Link color={linkColor} isExternal href={candyMachinedisplayDirectMintQrUri} className='flex'>
                    <Text className='pr-2' color={textColor}>
                      <ExternalLinkIcon size='16px' />
                    </Text>
                      {candyMachineAddress}
                  </Link>
                </Box>

              </FormControl>
            </form>

          </Box>
        </VStack>

      </motion.div>

      <QrCode text={candyMachinedisplayDirectMintQrUri} id={candyMachineAddress} />

    </Container>
  )
}