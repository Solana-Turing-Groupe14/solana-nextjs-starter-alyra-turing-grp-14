import { AttachmentIcon, CheckCircleIcon } from '@chakra-ui/icons'
import { Box, Button, CloseButton, Container, Flex, FormControl, FormLabel, Input, InputGroup, InputLeftElement, Link, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text, useToast, VStack } from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { ExternalLinkIcon } from "lucide-react"
import { useMemo, useState } from "react"
import {
  createMyFullNftCollection as mplxH_createMyFullNftCollection
} from "@helpers/mplx.helpers.dynamic"
import {
  createMyCollection as mplxH_createMyCollection,
} from "@helpers/mplx.helpers.static"

import { getAddressUri, getTxUri } from "@helpers/solana.helper"
import { CollectionCreationResponseData, mplhelp_T_CreateMyFullNftCollectionInput } from "types"

/* eslint-disable react/no-children-prop */

const FILEPATH = 'app/pages/createCollectionTest.tsx'

export default function MintTestPage() {

  const randomStringNumber = Math.random().toString(10).substring(2,5); // 3 random digits
  const MAX_FILE_SIZE = 1000; // 1MB

  const minNftCount = 0
  const maxNftCount = 100

  // TODO: remove/reset test values
  const defaultCollectionName = `Test coll. name ${randomStringNumber}`
  const defaultCollectionDescription = `Test coll. desc. ${randomStringNumber}`
  const defaultNftNamePrefix = `Test NFT prefix ${randomStringNumber}`

  const [collectionName, setCollectionName] = useState<string>( defaultCollectionName );
  const [collectionDescription, setCollectionDescription] = useState<string>( defaultCollectionDescription );
  const [nftNamePrefix, setNftNamePrefix] = useState<string>(defaultNftNamePrefix)
  const [image, setImage] = useState<File | undefined>();
  const [nftCount, setNftCount] = useState<number>(minNftCount)

  const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()
  const [isProcessingGlobalMint, setIsProcessingGlobalMint] = useState(false)
  const [isProcessingSponsoredCollectionCreation, setIsProcessingSponsoredCollectionCreation] = useState(false)
  const [isProcessingMyCollectionCreation, setIsProcessingMyCollectionCreation] = useState(false)
  const [isProcessingMyNftCollectionCreation, setIsProcessingMyNftCollectionCreation] = useState(false)

  const isConnected = useMemo(() => {
    // console.debug(`${FILEPATH}:isConnected: `, connected && connectedWalletPublicKey)
    return connected && connectedWalletPublicKey
  }, [connected, connectedWalletPublicKey]);

  const isValidCollectionInput = useMemo(() => {
    const isValid =
      nftCount && nftCount >= minNftCount && nftCount <= maxNftCount &&
      collectionName && collectionName.length > 0 &&
      collectionDescription && collectionDescription.length > 0 &&
      image
      ;
    console.debug(`${FILEPATH}:isValidCollectionInput: ${isValid}`, )
    return isValid
  }, [nftCount, collectionName, collectionDescription, image]);

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

      const createMyFullNftCollectionInput:mplhelp_T_CreateMyFullNftCollectionInput = {
        walletAdapter: wallet.adapter,
        collectionName: collectionName,
        collectionUri: `https://example.com2/my-collection-${randomStringNumber}.json`, // TODO : UPLOAD COLLECTION
        nftNamePrefix: nftNamePrefix, // TODO: NFT prefix name
        itemsCount: nftCount,
        metadataPrefixUri: `https://example.com/metadata/${randomStringNumber}/`, // TODO : UPLOAD METADATA
        startDateTime,
        endDateTime
      }
      // const response = await mplxH_createMyFullNftCollection(
      //   wallet.adapter,
      //   'MyNftCollection', // Collection name
      //   'https://example.com2/my-collection.json', // Collection uri
      //   'Quick NFT', // NFT prefix name
      //   5, // NFT count
      //   'https://example.com/metadata/', // NFT metadata prefix uri
      //   startDateTime,
      //   endDateTime
      // )
      const response = await mplxH_createMyFullNftCollection(
        createMyFullNftCollectionInput
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


  const handleDefaultSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  } // handleDefaultSubmit

  const handleChangeCollectionName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeCollectionName: `
    console.debug(`${LOGPREFIX} handleChangeCollectionName:event: `, event)

    if (!event.target) {
      return
    }
    setCollectionName(event.target.value);
  } // handleChangeCollectionName

  const handleChangeCollectionDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeCollectionName: `
    console.debug(`${LOGPREFIX} handleChangeCollectionName:event: `, event)

    if (!event.target) {
      return
    }
    setCollectionDescription(event.target.value);
  } // handleChangeCollectionDescription

  const handleChangeNftCount = (_value: number|string) => { // event: React.ChangeEvent<HTMLInputElement> => {
    const LOGPREFIX = `${FILEPATH}:handleChangeNftCount: `
    console.debug(`${LOGPREFIX} handleChangeNftCount:_value: `, _value)

    let value:number

    // const valueAsNumber = parseInt(valueAsString)
    if (typeof _value === 'string') {
      value = parseInt(_value)
      if (isNaN(value)) {
        return
      }
      // setNftCount(value)
    } else {
      value = _value
    }
    setNftCount(value)
  } // handleChangeNftCount

  const handleChangeNftNamePrefix = (event: React.ChangeEvent<HTMLInputElement>) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeNftNamePrefix: `
    console.debug(`${LOGPREFIX} handleChangeNftNamePrefix:event: `, event)

    if (!event.target) {
      return
    }
    setNftNamePrefix(event.target.value);
  } // handleChangeNftNamePrefix

  //   const handleChangeImage = (event: { target: { files: SetStateAction<File | undefined>[] } }) => {
  const handleChangeImage = /* async */ (event: React.ChangeEvent<HTMLInputElement>) => {

    const LOGPREFIX = `${FILEPATH}:handleChangeImage: `
    console.debug(`${LOGPREFIX} event: `, event)

    // debugger // REMOVE

    if (!event.target.files || !event.target.files[0]) {
        return;
    }
    const fileSizeKiloBytes = event.target.files[0].size / 1024;
    if (fileSizeKiloBytes > MAX_FILE_SIZE) {
        alert("File size is greater than maximum limit of 3MB.");
        return;
    } else if (fileSizeKiloBytes < MAX_FILE_SIZE) {
        setImage(event.target.files[0]);
    }

    // const p = await event.target.files[0].arrayBuffer() // ArrayBuffer
    // console.dir(p)
  };


/*
  const submitNftCollectionCreation = useCallback(async () => {
    const LOGPREFIX = `${FILEPATH}:submitNftCollectionCreation: `
    try {
      setIsProcessingMint(true)
      // Guard
      if (!isConnected) {
        warnIsNotConnected(); return
      }
      if (!wallet?.adapter) {
        console.error(`${LOGPREFIX} Wallet adapter not found`)
        return
      }
      // wait 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5_000))

      console.debug(`${LOGPREFIX} Image`, image)
      console.dir(image)
      if (!image) {
        alert("You did not upload an image.");
        return;
      }
      if (!collectionName || !collectionDescription) {
          alert("Fill out all the details.")
      }



      const mintIn: mplhelp_T_MintNftCMInput = {
        walletAdapter: wallet.adapter,
        collectionAddress,
        candyMachineAddress,
      }
      const res = await mplxH_mintNftFromCM(
        mintIn
      )

      console.debug(`${LOGPREFIX} mint:res: `, res)


      if (res.success) {
        toast({
          title: 'Mint successful',
          description: "NFT minted successfully.",
          status: 'success',
          duration: 5_000,
          isClosable: true,
          position: 'top-right',
        })
      }

      // throw new Error("Not implemented")
      toast({
        title: 'Mint error',
        description: "Not implemented",
        status: 'error',
        duration: 60_000,
        isClosable: true,
        position: 'top-right',
      })
      
    } catch (error) {
      console.error(`${LOGPREFIX} ERROR`, error)
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      toast({
        title: 'Mint error',
        description: errorMsg,
        status: 'success',
        duration: 60_000,
        isClosable: true,
        position: 'top-right',
      })
    } finally {
      setIsProcessingMint(false)
    }

    },
      // publicKey, sendTransaction, connection, image, name, description, soap
      [collectionDescription, image, collectionName, toast]
  );
*/

  return (
    <div className="mx-auto my-20 flex w-full max-w-lg flex-col gap-6 rounded-2xl p-6">
      <Text fontSize='3xl'>Mint(s) test</Text>
      <div className="flex flex-col gap-4 ">

        <Button
            isDisabled={!connected}
            isLoading={isProcessingGlobalMint}
            onClick={globalMint}
            colorScheme='gray'
          >
            GLOBAL Mint test
            (everything is hardcoded)
        </Button>

        <form onSubmit={handleDefaultSubmit} className="">

          <Container maxW='2xl' bg='blue.600' borderRadius='lg' centerContent padding={3}>

            <FormControl>

              <FormLabel>
                Name
              </FormLabel>
              <InputGroup>
                <Input
                  value={collectionName}
                  onChange={handleChangeCollectionName}
                  placeholder='Collection name'
                  // size='md'
                />
              </InputGroup>

              <FormLabel className="pt-1">
                Description
              </FormLabel>
              <InputGroup>
                <Input
                  value={collectionDescription}
                  onChange={handleChangeCollectionDescription}
                  placeholder='Collection description'
                  // size='md'
                />
              </InputGroup>

              <FormLabel className="pt-1">
                Nft Name Prefix
              </FormLabel>
              <InputGroup>
                <Input
                  value={nftNamePrefix}
                  onChange={handleChangeNftNamePrefix}
                  placeholder='Nft name prefix: NFT name will be prefix + mint number'
                  // size='md'
                />
              </InputGroup>

              <FormLabel className="pt-1">
                Image
              </FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents='none'>
                  <AttachmentIcon color='gray.300' />
                </InputLeftElement>
                {/*
                    {image && (
                      <Text>
                        {image.name} ({image.size} bytes)
                      </Text>
                    )}
                */}
                {/* <input type="file" accept="image/jpeg, image/png" onChange={handleChangeImage} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" /> */}
                <input name={"image"}
                  type="file"
                  multiple={false}
                  // onChange={(e) => onChange(e.target.files)}
                  onChange={handleChangeImage}
                  // accept={"image/*"}
                  accept="image/jpeg, image/png"
                  // style={{ display: "none" }}
                  aria-hidden="true"
                />
                <Input
                  type='text'
                  placeholder='Choose an image'
                  value={""}
                  onChange={() => { console.log('Input image onChange') }}
                />
              </InputGroup>

              <Flex>
                <NumberInput
                  maxW='100px' mr='2rem'
                  value={nftCount}
                  onChange={handleChangeNftCount}
                  min={minNftCount} max={maxNftCount}
                >
                  <NumberInputField min={minNftCount} max={maxNftCount} />
                  <NumberInputStepper
                    >
                    <NumberIncrementStepper  />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Slider
                  flex='1'
                  focusThumbOnChange={false}
                  value={nftCount}
                  onChange={handleChangeNftCount}
                  min={minNftCount}
                  max={maxNftCount}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  {/* // eslint-disable-next-line react/no-children-prop */}
                  <SliderThumb fontSize='sm' boxSize='32px' children={nftCount} />
                </Slider>
              </Flex>

              {/*
              <Input placeholder='Select Date and Time' size='md' type='datetime-local' />
              */}

            </FormControl>

            <VStack className=''>

              <Button
                size={"sm"}
                isDisabled={!connected}
                isLoading={isProcessingSponsoredCollectionCreation}
                onClick={createSponsoredCollection}
                colorScheme='green'
              >
                Create sponsored collection (fees paid by the app)
                hardcoded
              </Button>

              <Button
                size={"sm"}
                isDisabled={!connected}
                isLoading={isProcessingMyCollectionCreation}
                onClick={createMyCollection}
                colorScheme='orange'
              >
                Create My own collection (fees paid by wallet owner)
                hardcoded
              </Button>

              <Button
                size={"sm"}
                isDisabled={!connected || !isValidCollectionInput}
                isLoading={isProcessingMyNftCollectionCreation}
                onClick={createMyNftCollection}
                colorScheme='purple'
              >
                Create My own NFT collection (fees paid by wallet owner)
              </Button>
              </VStack>

          </Container>

        </form>


      </div>
    </div>
  )
}
