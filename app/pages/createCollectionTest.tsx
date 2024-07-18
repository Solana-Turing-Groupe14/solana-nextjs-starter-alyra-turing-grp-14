import { AttachmentIcon, CheckCircleIcon } from '@chakra-ui/icons'
import { Box, Button, CloseButton, Container, Flex, FormControl, FormLabel, Input, InputGroup, InputLeftElement, Link, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text, useToast, VStack } from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { ExternalLinkIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { MINT_FEE_DEFAULT_AMOUNT, MINT_FEE_MAX_AMOUNT, MINT_FEE_MIN_AMOUNT, NFT_COUNT_MAX } from '@consts/commons'
import {
  createCmNftCollection_fromWallet as mplxH_createCmNftCollection_fromWallet,
  createNftCollection_fromWallet as mplxH_createNftCollection_fromWallet,
  finalizeCmNftCollectionConfig_fromWallet as mplxH_finalizeCmNftCollectionConfig_fromWallet,
} from "@helpers/mplx.helper.dynamic"
import {
  createMyCollection as mplxH_createMyCollection,
} from "@helpers/mplx.helper.static"

import { getAddressUri, getTxUri } from "@helpers/solana.helper"
import { CollectionCreationResponseData,
  CreateCompleteCollectionCmConfigResponseData,
  mplhelp_T_CmNftCollection_Params,
  mplhelp_T_CreateCmNftCollection_fromWallet_Input,
  mplhelp_T_CreateCmNftCollection_Result,
  mplhelp_T_CreateNftCollection_fromWallet_Input, mplhelp_T_CreateNftCollection_Result,
  mplhelp_T_FinalizeCmNftCollectionConfig_fromWallet_Input,
  mplhelp_T_FinalizeCmNftCollectionConfig_Result,
  T_CreateCompleteCollectionCmConfigInputData,
} from "types"

/* eslint-disable react/no-children-prop */

const FILEPATH = 'app/pages/createCollectionTest.tsx'

export default function MintTestPage() {

  const SUCCESS_DELAY = 60_000
  const WARN_DELAY = 15_000
  const ERROR_DELAY = 60_000

  const randomStringNumber = Math.random().toString(10).substring(2,5); // 3 random digits
  const MAX_FILE_SIZE = 1000; // 1MB

  const minNftCount = 0

  // TODO: remove/reset test values
  const defaultCollectionName = `Test coll. name ${randomStringNumber}`
  const defaultCollectionDescription = `Test coll. desc. ${randomStringNumber}`
  const defaultNftNamePrefix = `Test NFT prefix ${randomStringNumber}`

  const [collectionName, setCollectionName] = useState<string>( defaultCollectionName );
  const [collectionDescription, setCollectionDescription] = useState<string>( defaultCollectionDescription );
  const [nftNamePrefix, setNftNamePrefix] = useState<string>(defaultNftNamePrefix)
  const [image, setImage] = useState<File | undefined>();
  const [nftCount, setNftCount] = useState<number>(minNftCount)
  const [mintFee, setmMintFee] = useState<number>(MINT_FEE_DEFAULT_AMOUNT)

  const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()
  const [isProcessingGlobalMint, setIsProcessingGlobalMint] = useState(false)
  const [isProcessingSponsoredCollectionCreationHarCoded, setIsProcessingSponsoredCollectionCreationHardcoded] = useState(false)
  const [isProcessingCollectionCreationHardcoded, setIsProcessingCollectionCreationHardcoded] = useState(false)
  const [isProcessingNftCollectionCreation, setIsProcessingNftCollectionCreation] = useState(false)
  const [isProcessingSponsoredNftCollectionCreation, setIsProcessingSponsoredNftCollectionCreation] = useState(false)

  const isConnected = useMemo(() => {
    // console.debug(`${FILEPATH}:isConnected: `, connected && connectedWalletPublicKey)
    return connected && connectedWalletPublicKey
  }, [connected, connectedWalletPublicKey]);

  const isValidCollectionInput = useMemo(() => {
    const LOGPREFIX = `${FILEPATH}:isValidCollectionInput: `
    let isValid = false
    try {
      isValid = nftCount >= minNftCount &&
      nftCount <= NFT_COUNT_MAX &&
      collectionName.trim().length > 0 &&
      collectionDescription.trim().length > 0 &&
      image !== undefined
      ;
    } catch (error) {
      console.error(`${LOGPREFIX}:error: `, error)
    }
    console.debug(`${FILEPATH}:${isValid}`, )
    return isValid
  }, [nftCount, collectionName, collectionDescription, image]);

  const toast = useToast()

  const warnIsNotConnected = () => {
    const LOGPREFIX = `${FILEPATH}:warnIsNotConnected: `
    console.warn(`${LOGPREFIX} Wallet not connected`)
    toast({
      title: 'Wallet not connected.',
      description: "Please connect to an account.",
      status: 'warning',
      duration: WARN_DELAY,
      isClosable: true,
      position: 'top-right',
    })
  }
  const globalMint = async () => {
    const LOGPREFIX = `${FILEPATH}:globalMint: `
    try {
      // Guard
      if (!isConnected) {
        warnIsNotConnected(); return
      }
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
      console.debug(`${LOGPREFIX}response`, response);
    } catch (error) {
      console.error(error)
    } finally {
      setIsProcessingGlobalMint(false)
    }
  } // globalMint

  const createSponsoredCollection = async () => {
    const LOGPREFIX = `${FILEPATH}:createSponsoredCollection: `
    try {
      setIsProcessingSponsoredCollectionCreationHardcoded(true)
      // Guard
      if (!isConnected) {
        warnIsNotConnected(); return
      }
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
      console.debug(`${LOGPREFIX}response`, response);
      if (response && response.success) {
        const uri = getTxUri(response.address)
        toast({
          duration: SUCCESS_DELAY,
          position: 'top-right',
          render: ({ onClose }) => (
            <Box color='black' p={3} bg='green.200' borderRadius='lg'>
              <div className='flex'>
                <CheckCircleIcon boxSize={5} className='ml-1 mr-2'/>
                <Text fontWeight="bold">Collection (only) created.</Text>
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
        console.warn(`${LOGPREFIX}response`, response);
        toast({
          title: 'Collection creation failed',
          description: response?.error,
          status: 'error',
          duration: ERROR_DELAY,
          isClosable: true,
          position: 'top-right',
        })
      }
    } catch (error) {
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      console.error(`${LOGPREFIX}${errorMsg}`)
      toast({
        title: 'Collection creation failed',
        description: errorMsg,
        status: 'error',
        duration: ERROR_DELAY,
        isClosable: true,
        position: 'top-right',
      })
    } finally {
      setIsProcessingSponsoredCollectionCreationHardcoded(false)
    }
  } // createSponsoredCollection

  const createCollectionOnly = async () => {
    const LOGPREFIX = `${FILEPATH}:createCollectionOnly: `
    try {
      setIsProcessingCollectionCreationHardcoded(true)
      // Guard
      if (!isConnected) {
        warnIsNotConnected(); return
      }
      if (!wallet) {
        console.error(`${LOGPREFIX}Wallet not found`)
        return
      }
      const response = await mplxH_createMyCollection(wallet.adapter)
      if (response && response.success) {
        console.debug(`${LOGPREFIX}response`, response);
        const uri = getTxUri(response.address)
        toast({
          duration: SUCCESS_DELAY,
          position: 'top-right',
          render: ({ onClose }) => (
            <Box color='black' p={3} bg='green.200' borderRadius='lg'>
                <div className='flex'>
                <CheckCircleIcon boxSize={5} className='ml-1 mr-2'/>
                <Text fontWeight="bold" >(own) Collection (only) created.</Text>
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
        console.warn(`${LOGPREFIX}response`, response);
        toast({
          title: '(my)Collection creation failed',
          description: response?.error,
          status: 'error',
          duration: ERROR_DELAY,
          isClosable: true,
          position: 'top-right',
        })
      }
    } catch (error) {
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      console.error(`${LOGPREFIX}${errorMsg}`)
      toast({
        title: '(my)Collection creation failed',
        description: errorMsg,
        status: 'error',
        duration: ERROR_DELAY,
        isClosable: true,
        position: 'top-right',
      })
  } finally {
      setIsProcessingCollectionCreationHardcoded(false)
    }
  } // createCollectionOnly

  // ----------------------------

  const createCompleteNftCollection = async () => {
    const LOGPREFIX = `${FILEPATH}:createCompleteNftCollection: `
    try {
      // Guard
      if (!isConnected) {
        warnIsNotConnected(); return
      }
      setIsProcessingNftCollectionCreation(true)
      if (!wallet) {
        console.error(`${LOGPREFIX}Wallet not found`)
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

      // const createMyFullNftCollectionInput:mplhelp_T_CreateMyFullNftCollectionInput = {
      //   walletAdapter: wallet.adapter,
      //   collectionName: collectionName,
      //   collectionUri: `https://example.com2/my-collection-${randomStringNumber}.json`, // TODO : UPLOAD COLLECTION
      //   nftNamePrefix: nftNamePrefix, // TODO: NFT prefix name
      //   itemsCount: nftCount,
      //   metadataPrefixUri: `https://example.com/metadata/${randomStringNumber}/`, // TODO : UPLOAD METADATA
      //   startDateTime,
      //   endDateTime
      // }
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
      // const response = await mplxH_createMyFullNftCollection(
      //   createMyFullNftCollectionInput
      // )

      // 1 - create Collection
      const createNftCollectionInput:mplhelp_T_CreateNftCollection_fromWallet_Input = {
        walletAdapter: wallet.adapter,
        collectionName: collectionName,
        collectionUri: `https://example.com2/my-collection-${randomStringNumber}.json`, // TODO : UPLOAD COLLECTION
      }
      const createNftCollectionResponse:mplhelp_T_CreateNftCollection_Result
        = await mplxH_createNftCollection_fromWallet(
          createNftCollectionInput
        )

      console.debug(`${LOGPREFIX}createNftCollectionResponse`, createNftCollectionResponse);
      if (createNftCollectionResponse && createNftCollectionResponse.success) {
        const uriCollection = getAddressUri(createNftCollectionResponse.collectionAddress)
        toast({
          duration: SUCCESS_DELAY,
          position: 'top-right',
          render: ({ onClose }) => (
            <Box color='black' p={3} bg='green.200' borderRadius='lg'>
              <div className='flex'>
                <CheckCircleIcon boxSize={5} className='ml-1 mr-2'/>
                <Text fontWeight="bold">NFT Collection created.</Text>
                <CloseButton size='sm' onClick={onClose} />
              </div>
              <div className='m-2'>
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
        }) // toast

        // 2 - create Candy Machine
        const cmNftCollectioNParams:mplhelp_T_CmNftCollection_Params = {
          itemsCount: nftCount,
          mintFee: mintFee,
          maxMintPerwallet: 1, // TODO: maxMintPerwallet
          startDateTime,
          endDateTime
        }
        const createCmNftCollectionInput:mplhelp_T_CreateCmNftCollection_fromWallet_Input = {
          walletAdapter: wallet.adapter,
          // collectionAddress: createNftCollectionResponse.collectionAddress,
          collectionSigner: createNftCollectionResponse.collectionSigner,
          nftNamePrefix: nftNamePrefix,
          // TODO : UPLOAD METADATA
          metadataPrefixUri: `https://example.com/metadata/${randomStringNumber}/`,
          // itemsCount: nftCount,
          // startDateTime,
          // endDateTime,
          // mintFee,
          cmNftCollectioNParams,
        }
        const createCmNftCollectionResponse:mplhelp_T_CreateCmNftCollection_Result
          = await mplxH_createCmNftCollection_fromWallet(createCmNftCollectionInput)

        console.debug(`${LOGPREFIX}createCmNftCollectionResponse`, createCmNftCollectionResponse);
        if (createCmNftCollectionResponse && createCmNftCollectionResponse.success) {
          const uriCandyMachine = getAddressUri(createCmNftCollectionResponse.candyMachineAddress)
          toast({
            duration: SUCCESS_DELAY,
            position: 'top-right',
            render: ({ onClose }) => (
              <Box color='black' p={3} bg='green.200' borderRadius='lg'>
                <div className='flex'>
                  <CheckCircleIcon boxSize={5} className='ml-1 mr-2'/>
                    <div className='flex'>
                      <Text fontWeight="normal">NFT Collection</Text>
                      <Text className='mx-1' fontWeight="bold">Candy Machine</Text>
                      <Text fontWeight="normal">created.</Text>
                    </div>

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
                </div>
              </Box>
            ),
          }) // toast

          // 3 - finalize Candy Machine: add NFTs to Candy Machine
          const finalizeCmNftCollectionConfigInput:mplhelp_T_FinalizeCmNftCollectionConfig_fromWallet_Input = {
            walletAdapter: wallet.adapter,
            collectionSigner: createNftCollectionResponse.collectionSigner,
            candyMachineSigner: createCmNftCollectionResponse.candyMachineSigner,
            itemsCount: nftCount,
          }
          const finalizeCmNftCollectionConfigResponse:mplhelp_T_FinalizeCmNftCollectionConfig_Result
            = await mplxH_finalizeCmNftCollectionConfig_fromWallet(finalizeCmNftCollectionConfigInput)

          console.debug(`${LOGPREFIX}finalizeCmNftCollectionConfigResponse`, finalizeCmNftCollectionConfigResponse);

          if (finalizeCmNftCollectionConfigResponse && finalizeCmNftCollectionConfigResponse.success) {
            const uriCandyMachine = getAddressUri(finalizeCmNftCollectionConfigResponse.candyMachineAddress)
            const uriCollection = getAddressUri(finalizeCmNftCollectionConfigResponse.collectionAddress)
            toast({
              duration: SUCCESS_DELAY,
              position: 'top-right',
              render: ({ onClose }) => (
                <Box color='black' p={3} bg='green.200' borderRadius='lg'>
                  <div className='flex'>
                    <CheckCircleIcon boxSize={5} className='ml-1 mr-2'/>
                    <Text fontWeight="bold">NFT(s) added to Candy Machine</Text>
                    <CloseButton size='sm' onClick={onClose} />
                  </div>
                  <div className='m-2'>
                    {uriCollection &&
                      <Link href={uriCollection} isExternal className="flex text-end">
                        <div className='mr-2'>
                          Collection
                        </div>
                        <ExternalLinkIcon size='16px' />
                      </Link>
                    }
                    {uriCandyMachine &&
                      <Link href={uriCandyMachine} isExternal className="flex text-end">
                        <div className='mr-2'>
                          Candy Machine
                        </div>
                        <ExternalLinkIcon size='16px' />
                      </Link>
                    }
                  </div>
                </Box>
              ),
            }) // toast
          } else {
            // Finalize Candy Machine failed
            console.warn(`${LOGPREFIX}finalizeCmNftCollectionConfigResponse`, finalizeCmNftCollectionConfigResponse);
            toast({
              title: 'Finalize Candy Machine failed',
              description: finalizeCmNftCollectionConfigResponse?.error,
              status: 'error',
              duration: ERROR_DELAY,
              isClosable: true,
              position: 'top-right',
            })
          }
        } else {
          // Candy Machine creation failed
          console.warn(`${LOGPREFIX}createCmNftCollectionResponse`, createCmNftCollectionResponse);
          toast({
            title: 'Candy Machine creation failed',
            description: createCmNftCollectionResponse?.error,
            status: 'error',
            duration: ERROR_DELAY,
            isClosable: true,
            position: 'top-right',
          })
        }

      } else {
        // Collection creation failed
        console.warn(`${LOGPREFIX}createNftCollectionResponse`, createNftCollectionResponse);
        toast({
          title: 'Collection creation failed',
          description: createNftCollectionResponse?.error,
          status: 'error',
          duration: ERROR_DELAY,
          isClosable: true,
          position: 'top-right',
        })
      }

    } catch (error) {
      // Global error handling
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      console.error(`${LOGPREFIX}${errorMsg}`);
      toast({
        title: 'Collection creation failed',
        description: errorMsg,
        status: 'error',
        duration: ERROR_DELAY,
        isClosable: true,
        position: 'top-right',
      })

    } finally {
      setIsProcessingNftCollectionCreation(false)
    }
  } // createCompleteNftCollection

  // ----------------------------

  const createCompleteNftCollectionSponsored = async () => {
    const LOGPREFIX = `${FILEPATH}:createCompleteNftCollectionSponsored: `
    try {
      // Guard
      if (!isConnected) {
        warnIsNotConnected(); return
      }
      setIsProcessingSponsoredNftCollectionCreation(true)
      if (!wallet) {
        console.error(`${LOGPREFIX}Wallet not found`)
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

      const cmNftCollectioNParams:mplhelp_T_CmNftCollection_Params = {
        itemsCount: nftCount,
        mintFee: mintFee,
        maxMintPerwallet: 1, // TODO: maxMintPerwallet
        startDateTime,
        endDateTime
      }
      const createCompleteCollectionCmConfigInputData:T_CreateCompleteCollectionCmConfigInputData = {
        collectionName: collectionName,
        collectionUri: `https://example.com2/my-collection-${randomStringNumber}.json`, // TODO : UPLOAD COLLECTION
        metadataPrefixUri: `https://example.com/metadata/${randomStringNumber}/`, // TODO : UPLOAD METADATA
        collectionDescription,
        nftNamePrefix,
        // itemsCount: nftCount,
        // startDateTime,
        // endDateTime,
        // mintFee,
        cmNftCollectioNParams,
      }
      console.debug(`${LOGPREFIX}createCompleteCollectionCmConfigInputData`, createCompleteCollectionCmConfigInputData);

      const res = await fetch('/api/complete-collection-creation-sponsored', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
      body: JSON.stringify(createCompleteCollectionCmConfigInputData)
    });
    const response:CreateCompleteCollectionCmConfigResponseData = await res.json();
      console.debug(`${LOGPREFIX}`, response);

      if (response && response.success) {

        const uriCollection = getAddressUri(response.collectionAddress)
        const uriCandyMachine = getAddressUri(response.candyMachineAddress)
        toast({
          duration: SUCCESS_DELAY,
          position: 'top-right',
          render: ({ onClose }) => (
            <Box color='black' p={3} bg='green.200' borderRadius='lg'>
              <div className='flex'>
                <CheckCircleIcon boxSize={5} className='ml-1 mr-2'/>
                <Text fontWeight="bold">NFT Collection created.</Text>
                <CloseButton size='sm' onClick={onClose} />
              </div>
              <div className='m-2'>
                {uriCollection &&
                  <Link href={uriCollection} isExternal className="flex text-end">
                    <div className='mr-2'>
                      Collection
                    </div>
                    <ExternalLinkIcon size='16px' />
                  </Link>
                }
                {uriCandyMachine &&
                  <Link href={uriCandyMachine} isExternal className="flex text-end">
                    <div className='mr-2'>
                      Candy Machine
                    </div>
                    <ExternalLinkIcon size='16px' />
                  </Link>
                }
              </div>
            </Box>
          ),
        }) // toast

      } else {
        // Error
        const errorMsg = (response && response.success === false ? response.error : 'Unknown error') 
        console.error(`${LOGPREFIX}finalizeCmNftCollectionConfigResponse`, errorMsg);
        toast({
          title: 'Collection creation failed',
          description: errorMsg,
          status: 'error',
          duration: ERROR_DELAY,
          isClosable: true,
          position: 'top-right',
        })
      }
    } catch (error) {
      // Global error handling
      const errorMsg = (error instanceof Error ? error.message : `${error}`)
      console.error(`${LOGPREFIX}${errorMsg}`);
      toast({
        title: 'Collection creation failed',
        description: errorMsg,
        status: 'error',
        duration: ERROR_DELAY,
        isClosable: true,
        position: 'top-right',
      })

    } finally {
      setIsProcessingSponsoredNftCollectionCreation(false)
    }
  } // createCompleteNftCollectionSponsored


  // ----------------------------

  const handleDefaultSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  } // handleDefaultSubmit

  // ----------------------------

  const handleChangeCollectionName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeCollectionName: `
    console.debug(`${LOGPREFIX} handleChangeCollectionName:event: `, event)

    if (!event.target) {
      return
    }
    setCollectionName(event.target.value);
  } // handleChangeCollectionName

  // ----------------------------

  const handleChangeCollectionDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeCollectionName: `
    console.debug(`${LOGPREFIX} handleChangeCollectionName:event: `, event)

    if (!event.target) {
      return
    }
    setCollectionDescription(event.target.value);
  } // handleChangeCollectionDescription

  // ----------------------------

  const handleChangeNftCount = (_value: number|string) => { // event: React.ChangeEvent<HTMLInputElement> => {
    const LOGPREFIX = `${FILEPATH}:handleChangeNftCount: `
    console.debug(`${LOGPREFIX}_value: `, _value)
    let value:number
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

  // ----------------------------

  const handleChangeNftNamePrefix = (event: React.ChangeEvent<HTMLInputElement>) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeNftNamePrefix: `
    console.debug(`${LOGPREFIX} handleChangeNftNamePrefix:event: `, event)

    if (!event.target) {
      return
    }
    setNftNamePrefix(event.target.value);
  } // handleChangeNftNamePrefix

  // ----------------------------

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

  // ----------------------------

  const handleChangeNftMintFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    const LOGPREFIX = `${FILEPATH}:handleChangeNftMintFee: `
    try {
      console.debug(`${LOGPREFIX}event.target.value: `, event.target.value)
      let value:number
      // debugger
      if (typeof event.target.value === 'string') {
        value = parseFloat(event.target.value)
        if (isNaN(value)) {
          return
        }
        if (value > MINT_FEE_MAX_AMOUNT) {
          toast({
            title: 'Mint fee amount too high',
            description: `Mint fee amount must be at most ${MINT_FEE_MAX_AMOUNT}`,
            status: 'warning',
            duration: WARN_DELAY,
            isClosable: true,
            position: 'top-right',
          })
          value = MINT_FEE_MAX_AMOUNT
        }
        if (value < MINT_FEE_MIN_AMOUNT) {
          toast({
            title: 'Mint fee amount too low',
            description: `Mint fee amount must be at least ${MINT_FEE_MIN_AMOUNT}`,
            status: 'warning',
            duration: WARN_DELAY,
            isClosable: true,
            position: 'top-right',
          })
          value = MINT_FEE_MIN_AMOUNT
        }
        setmMintFee(value)
      }
    } catch (error) {
      console.error(`${LOGPREFIX}error: `, error)
    }
  } // handleChangeNftMintFee

  // ----------------------------

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
                />
              </InputGroup>

              <FormLabel className="pt-1">
                Nft mint fee
              </FormLabel>
              <InputGroup>
                <Input
                  value={mintFee}
                  onChange={handleChangeNftMintFee}
                  placeholder='Set mint fee'
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
                  min={minNftCount} max={NFT_COUNT_MAX}
                >
                  <NumberInputField min={minNftCount} max={NFT_COUNT_MAX} />
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
                  max={NFT_COUNT_MAX}
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
                isLoading={isProcessingSponsoredCollectionCreationHarCoded}
                onClick={createSponsoredCollection}
                colorScheme='red'
              >
                Create sponsored collection (fees paid by the app)
                HARDCODED
              </Button>

              <Button
                size={"sm"}
                isDisabled={!connected}
                isLoading={isProcessingCollectionCreationHardcoded}
                onClick={createCollectionOnly}
                colorScheme='orange'
              >
                Create collection (fees paid by wallet owner)
                HARDCODED
              </Button>

              <Button
                size={"sm"}
                isDisabled={!connected || !isValidCollectionInput}
                isLoading={isProcessingNftCollectionCreation}
                onClick={createCompleteNftCollection}
                colorScheme='purple'
              >
                Create NFT collection (fees paid by wallet owner)
              </Button>

              <Button
                size={"sm"}
                isDisabled={!connected || !isValidCollectionInput}
                isLoading={isProcessingSponsoredNftCollectionCreation}
                onClick={createCompleteNftCollectionSponsored}
                colorScheme='green'
              >
                Create NFT collection (Fees sponsored)
              </Button>

            </VStack>

          </Container>

        </form>


      </div>
    </div>
  )
}
