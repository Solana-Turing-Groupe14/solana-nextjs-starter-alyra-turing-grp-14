import { AttachmentIcon, CheckCircleIcon, ExternalLinkIcon as ExternalLinkIconChakra } from '@chakra-ui/icons'
import { Box, Button, CloseButton, Container, Fade, Flex, FormControl, FormLabel,
  Heading, Input, InputGroup, InputLeftElement, Link,
  NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper,
  ScaleFade, SimpleGrid, SlideFade, Slider, SliderFilledTrack, SliderThumb, SliderTrack,
  Text, useBreakpointValue, useColorModeValue, useToast, VStack
} from "@chakra-ui/react"
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'
import { useWallet } from "@solana/wallet-adapter-react"
import { motion } from "framer-motion"
import { ExternalLinkIcon as ExternalLinkIconLucid, UploadCloudIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { MINT_FEE_DEFAULT_AMOUNT, MINT_FEE_MAX_AMOUNT, MINT_FEE_MIN_AMOUNT, NFT_COUNT_MAX } from '@consts/commons'
import {
  createCmNftCollection_fromWallet as mplxH_createCmNftCollection_fromWallet,
  createNftCollection_fromWallet as mplxH_createNftCollection_fromWallet,
  finalizeCmNftCollectionConfig_fromWallet as mplxH_finalizeCmNftCollectionConfig_fromWallet,
  setIdentityPayer_WalletAdapter,
} from "@helpers/mplx.helper.dynamic"
import { getUmiStorage } from '@helpers/mplx.storage.helper'
import { getAddressUri } from "@helpers/solana.helper"
import { MPL_F_createGenericFileFromBrowserFile } from '@imports/mtplx.storage.imports'
import {
  CreateCompleteCollectionCmConfigResponseData,
  mplhelp_T_CmNftCollection_Params,
  mplhelp_T_CreateCmNftCollection_fromWallet_Input,
  mplhelp_T_CreateCmNftCollection_Result,
  mplhelp_T_CreateNftCollection_fromWallet_Input,
  mplhelp_T_CreateNftCollection_Result,
  mplhelp_T_FinalizeCmNftCollectionConfig_fromWallet_Input,
  mplhelp_T_FinalizeCmNftCollectionConfig_Result,
  mplhelp_T_NameUriArray,
  T_CreateCompleteCollectionCmConfigInputData,
} from "types"

/* eslint-disable react/no-children-prop */

const FILEPATH = 'app/pages/createCollection.tsx'

export default function CreateCollectionPage() {
  const SUCCESS_DELAY = 60_000
  const WARN_DELAY = 15_000
  const ERROR_DELAY = 60_000

  const randomStringNumber = Math.random().toString(10).substring(2,5)
  const MAX_FILE_SIZE = 1000 // 1MB

  const minNftCount = 0

  const defaultCollectionName = `Test coll. name ${randomStringNumber}`
  const defaultCollectionDescription = `Test coll. desc. ${randomStringNumber}`
  const defaultNftNamePrefix = `Test NFT prefix ${randomStringNumber}`
  const defaultNftUploadedImageUri = ""
  const defaultNftCollectionUploadedMetadataUri = ""
  const defaultUploadedCollectionUploadedNftsNameUriArray:mplhelp_T_NameUriArray = []

  const [collectionName, setCollectionName] = useState<string>(defaultCollectionName)
  const [collectionDescription, setCollectionDescription] = useState<string>(defaultCollectionDescription)
  const [nftNamePrefix, setNftNamePrefix] = useState<string>(defaultNftNamePrefix)
  const [image, setImage] = useState<File | undefined>()
  const [nftCount, setNftCount] = useState<number>(minNftCount)
  const [mintFee, setMintFee] = useState<number>(MINT_FEE_DEFAULT_AMOUNT)
  const [uploadedImageUri, setUploadedImageUri] = useState<string>(defaultNftUploadedImageUri)
  const [uploadedCollectionUploadedMetadataUri, setUploadedCollectionUploadedMetadataUri] = useState<string>(defaultNftCollectionUploadedMetadataUri)
  const [uploadedCollectionUploadedNftsNameUriArray, setUploadedCollectionUploadedNftsNameUriArray] = useState<mplhelp_T_NameUriArray>(defaultUploadedCollectionUploadedNftsNameUriArray)

  const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()
  const [isProcessingNftCollectionCreation, setIsProcessingNftCollectionCreation] = useState(false)
  const [isProcessingSponsoredNftCollectionCreation, setIsProcessingSponsoredNftCollectionCreation] = useState(false)

  const toast = useToast()

  const isConnected = useMemo(() => {
    return connected && connectedWalletPublicKey
  }, [connected, connectedWalletPublicKey])

  const isValidFileInput = useMemo(() => {
    return image !== undefined
  }, [image])

  const isValidCollectionInput = useMemo(() => {
    return nftCount > minNftCount &&
      nftCount <= NFT_COUNT_MAX &&
      collectionName.trim().length > 0 &&
      collectionDescription.trim().length > 0 &&
      uploadedImageUri.trim().length > 0 &&
      uploadedCollectionUploadedMetadataUri.trim().length > 0 &&
      uploadedCollectionUploadedNftsNameUriArray &&
      uploadedCollectionUploadedNftsNameUriArray.length === nftCount
  }, [nftCount, collectionName, collectionDescription, uploadedImageUri, uploadedCollectionUploadedMetadataUri, uploadedCollectionUploadedNftsNameUriArray])

  const warnIsNotConnected = () => {
    console.warn(`${FILEPATH}:warnIsNotConnected: Wallet not connected`)
    toast({
      title: 'Wallet not connected.',
      description: "Please connect to an account.",
      status: 'warning',
      duration: WARN_DELAY,
      isClosable: true,
      position: 'top-right',
    })
  }

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
      if (!uploadedImageUri) {
        console.error(`${LOGPREFIX}Image not found / uploaded`)
        return
      }
      if (!uploadedCollectionUploadedMetadataUri) {
        console.error(`${LOGPREFIX}Metadata not found / uploaded`)
        toast({
          title: 'Metadata not found',
          description: "Please upload metadata.",
          status: 'warning',
          duration: WARN_DELAY,
          isClosable: true,
          position: 'top-right',
        })
        return
      }
      if (!uploadedCollectionUploadedNftsNameUriArray || uploadedCollectionUploadedNftsNameUriArray.length !== nftCount) {
        console.error(`${LOGPREFIX}NFTs not found / uploaded`)
        toast({
          title: 'NFTs not found',
          description: "Please upload NFTs.",
          status: 'warning',
          duration: WARN_DELAY,
          isClosable: true,
          position: 'top-right',
        })
        return
      }

      const year = 2024;
      const month = 6;
      const day = 28;
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

      // Image: uploadedImageUri

      // // Create collection Metadata JSON
      // const metadataJson = {
      //   name: collectionName,
      //   description: collectionDescription,
      //   // symbol: 'NFT',
      //   uri: uploadedImageUri, // UPLOADED IMAGE
      //   // attributes: [],
      //   properties: {
      //     files: [
      //       {
      //         uri: uploadedImageUri,
      //         // type: 'image',
      //         type: (image?image?.type:'image'),
      //       }
      //     ]
      //   },
      // }

      // console.debug(`${LOGPREFIX}metadataJson`, metadataJson);
      // const umiStorage = getUmiStorage()
      // setIdentityPayer_WalletAdapter(wallet.adapter, umiStorage, true)
      // umiStorage.use(irysUploader())

      // const metadataJsonUri = await umiStorage.uploader.uploadJson(metadataJson)
      // console.debug(`${LOGPREFIX}uri`, metadataJsonUri);


      // throw new Error('Check Metadata upload')

      // Create collection uri


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
                    <ExternalLinkIconLucid size='16px' />
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
          collectionSigner: createNftCollectionResponse.collectionSigner,
          nftNamePrefix: nftNamePrefix,
          // metadataPrefixUri: `https://example.com/metadata/${randomStringNumber}/`,
          metadataPrefixUri: '',
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
                      <ExternalLinkIconLucid size='16px' />
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
            nameUriArray: uploadedCollectionUploadedNftsNameUriArray,
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
                        <ExternalLinkIconLucid size='16px' />
                      </Link>
                    }
                    {uriCandyMachine &&
                      <Link href={uriCandyMachine} isExternal className="flex text-end">
                        <div className='mr-2'>
                          Candy Machine
                        </div>
                        <ExternalLinkIconLucid size='16px' />
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
      if (!uploadedImageUri) {
        console.error(`${LOGPREFIX}Image not found / uploaded`)
        return
      }
      if (!uploadedCollectionUploadedMetadataUri) {
        console.error(`${LOGPREFIX}Metadata not found / uploaded`)
        toast({
          title: 'Metadata not found',
          description: "Please upload metadata.",
          status: 'warning',
          duration: WARN_DELAY,
          isClosable: true,
          position: 'top-right',
        })
        return
      }
      if (!uploadedCollectionUploadedNftsNameUriArray || uploadedCollectionUploadedNftsNameUriArray.length !== nftCount) {
        console.error(`${LOGPREFIX}NFTs not found / uploaded`)
        toast({
          title: 'NFTs not found',
          description: "Please upload NFTs.",
          status: 'warning',
          duration: WARN_DELAY,
          isClosable: true,
          position: 'top-right',
        })
        return
      }
      const year = 2024;
      const month = 6;
      const day = 28;
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
        // collectionUri: `https://example.com2/my-collection-${randomStringNumber}.json`, // TODO : UPLOAD COLLECTION
        collectionUri: uploadedCollectionUploadedMetadataUri,
        // metadataPrefixUri: `https://example.com/metadata/${randomStringNumber}/`, // TODO : UPLOAD METADATA
        metadataPrefixUri: '',
        collectionDescription,
        nftNamePrefix,
        nameUriArray: uploadedCollectionUploadedNftsNameUriArray,
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
                    <ExternalLinkIconLucid size='16px' />
                  </Link>
                }
                {uriCandyMachine &&
                  <Link href={uriCandyMachine} isExternal className="flex text-end">
                    <div className='mr-2'>
                      Candy Machine
                    </div>
                    <ExternalLinkIconLucid size='16px' />
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

  const handleChangeCollectionName = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCollectionName(event.target.value)
  }

  const handleChangeCollectionDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCollectionDescription(event.target.value)
  }

  const handleChangeNftCount = (_value: number|string) => {
    let value: number
    if (typeof _value === 'string') {
      value = parseInt(_value)
      if (isNaN(value)) return
    } else {
      value = _value
    }
    setNftCount(value)
  }

  const handleChangeNftNamePrefix = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNftNamePrefix(event.target.value)
  }

  const handleChangeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) {
      event.target.value = ''
      setUploadedImageUri('')
      return
    }
    const file = event.target.files[0]
    const fileSizeKiloBytes = file.size / 1024
    if (fileSizeKiloBytes > MAX_FILE_SIZE) {
      alert(`File size is greater than maximum limit of ${MAX_FILE_SIZE}.`)
      event.target.value = ''
      setUploadedImageUri('')
      return
    }
    setImage(file)
    setUploadedImageUri('')
  }

  const handleChangeNftMintFee = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseFloat(event.target.value)
    if (isNaN(value)) return
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
    setMintFee(value)
  }

  const handleUploadJsonFiles = async () => {
    const LOGPREFIX = `${FILEPATH}:handleUploaJsonFiles: `
    try {
      if (!isConnected || !wallet /* useless but prevents warning on setIdentity */) {
        warnIsNotConnected(); return
      }
      if (!nftCount || nftCount <= 0) {
        console.error(`${LOGPREFIX}NFT count must be greater than 0`)
        toast({
          title: 'NFT count must be greater than 0',
          description: "Please increase NFT count to at least 1.",
          status: 'warning',
          duration: WARN_DELAY,
          isClosable: true,
          position: 'top-right',
        })
        return
      }
      // Create collection Metadata JSON
      const collectionMetadataJson = {
        name: collectionName,
        description: collectionDescription,
        // symbol: 'NFT',
        // external_url: "https://mywebsite.com",
        // seller_fee_basis_points: 100,
        uri: uploadedImageUri, // UPLOADED IMAGE
        // attributes: [],
        properties: {
          files: [
            {
              uri: uploadedImageUri,
              // type: 'image',
              type: (image?image?.type:'image'),
            }
          ],
          category: "image",
          // creators: [
          //   {
          //     "address": ".....",
          //     "share": 100
          //   }
          // ]
        },
      }

      console.debug(`${LOGPREFIX}metadataJson`, collectionMetadataJson);
      const umiStorage = getUmiStorage()
      setIdentityPayer_WalletAdapter(wallet.adapter, umiStorage, true)
      umiStorage.use(irysUploader())

      const metadataJsonUri = await umiStorage.uploader.uploadJson(collectionMetadataJson)
      console.debug(`${LOGPREFIX}uri`, metadataJsonUri);

      if (!metadataJsonUri) {
        console.error(`${LOGPREFIX}No metadataJsonUri`)
        toast({
          title: 'Metadata upload failed',
          description: "Invalid uri after upload",
          status: 'warning',
          duration: WARN_DELAY,
          isClosable: true,
          position: 'top-right',
        })
        setUploadedCollectionUploadedMetadataUri('') // Clear uploaded metadata uri
        return
      }

      setUploadedCollectionUploadedMetadataUri(metadataJsonUri)

      toast({
        title: 'Metadata uploaded',
        description: "Metadata generated & uploaded successfully.",
        status: 'success',
        duration: SUCCESS_DELAY,
        isClosable: true,
        position: 'top-right',
      })


      // TODO: Generate NFTs metadata
      // TODO: Generate NFTs metadata
      // TODO: Generate NFTs metadata
      // TODO: Generate NFTs metadata
      // TODO: Generate NFTs metadata
      // TODO: Generate NFTs metadata
      // TODO: Generate NFTs metadata
      // TODO: Generate NFTs metadata
      // TODO: Generate NFTs metadata
      // TODO: Generate NFTs metadata
      const nameUriArray: mplhelp_T_NameUriArray = [
        // { name: 'NFT1', uri: 'https://example.com/nft1.json' },
        // { name: 'NFT2', uri: 'https://example.com/nft2.json' },
        // { name: 'NFT3', uri: 'https://example.com/nft3.json' },
        // { name: 'NFT4', uri: 'https://example.com/nft4.json' },
        // { name: 'NFT5', uri: 'https://example.com/nft5.json' },
      ]
      for (let i = 0; i < nftCount; i++) {
        // TODO: generate/upload NFT JSON
        nameUriArray.push({ name: `NFT${i+1}`, uri: `https://example.com/nft${i+1}.json` })
      }

      setUploadedCollectionUploadedNftsNameUriArray( nameUriArray )


      console.debug(`${LOGPREFIX}metadataJsonUri`, metadataJsonUri);
      console.dir(metadataJsonUri)
    } catch (error) {
      console.error(`${LOGPREFIX}error`, error);
    }
  } // handleUploaJsonFiles

  const handleUploadImageFile = async () => {
    const LOGPREFIX = `${FILEPATH}:handleUploadImageFile: `
    try {
      if (!isConnected || !wallet /* useless but prevents warning on setIdentity */) {
        warnIsNotConnected(); return
      }
      if (!image) {
        console.error(`${LOGPREFIX}No image to upload`)
        toast({
          title: 'No image to upload',
          description: "Please select an image to upload.",
          status: 'warning',
          duration: WARN_DELAY,
          isClosable: true,
          position: 'top-right',
        })
        return
      }
      // 
      // image.
      // UploaderUploadOptions
      const umiStorage = getUmiStorage()
      setIdentityPayer_WalletAdapter(wallet.adapter, umiStorage, true)

      // umiStorage.use(myproviderUploader)
      // IrysUploaderOptions
      umiStorage.use(irysUploader())

      const genericF = await MPL_F_createGenericFileFromBrowserFile(image)
      // const fileUris = await nftStorageUploader.upload([genericF] );
      // const fileUris = await umiStorage.uploader.upload([genericF]);

      const fileUris = await umiStorage.uploader.upload([genericF], {
        // signal: myAbortSignal,
        onProgress: (percent) => {
          console.log(`${percent * 100}% uploaded...`);
        },
      })
      const fileUri = fileUris[0]
      if (!fileUri) {
        console.error(`${LOGPREFIX}No fileUri`)
        toast({
          title: 'No fileUri',
          description: "No fileUri",
          status: 'warning',
          duration: WARN_DELAY,
          isClosable: true,
          position: 'top-right',
        })
        setUploadedImageUri('') // Clear uploaded image uri
        return
      }

      setUploadedImageUri(fileUri)
      toast({
        title: 'Image uploaded',
        description: "Image uploaded successfully.",
        status: 'success',
        duration: SUCCESS_DELAY,
        isClosable: true,
        position: 'top-right',
      })

      console.debug(`${LOGPREFIX}fileUris`, fileUris);
      console.dir(fileUris)
    } catch (error) {
      console.error(`${LOGPREFIX}error`, error);
    }
  } // handleUploadImageFile

  const bgColor = useColorModeValue("gray.50", "gray.800")
  const cardBgColor = useColorModeValue("white", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")

  const columnCount = useBreakpointValue({ base: 1, md: 2 })

  return (
    <Container maxW="container.xl" py={10}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading as="h1" size="2xl" textAlign="center" mb={10}>
          Create Your NFT Collection
        </Heading>

        <SimpleGrid columns={columnCount} spacing={10}>
          <Box>
            <ScaleFade initialScale={0.9} in={true}>
              <FormControl>
                <VStack spacing={6} align="stretch">
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <AttachmentIcon color="gray.300" />
                    </InputLeftElement>
                    <Input
                      value={collectionName}
                      onChange={handleChangeCollectionName}
                      placeholder="Collection name"
                      bg={cardBgColor}
                      borderRadius="full"
                    />
                  </InputGroup>

                  <InputGroup>
                    <Input
                      value={collectionDescription}
                      onChange={handleChangeCollectionDescription}
                      placeholder="Collection description"
                      bg={cardBgColor}
                      borderRadius="full"
                    />
                  </InputGroup>

                  <InputGroup>
                    <Input
                      value={nftNamePrefix}
                      onChange={handleChangeNftNamePrefix}
                      placeholder="NFT name prefix"
                      bg={cardBgColor}
                      borderRadius="full"
                    />
                  </InputGroup>

                  <InputGroup>
                    <Input
                      value={mintFee}
                      onChange={handleChangeNftMintFee}
                      placeholder="Set mint fee"
                      bg={cardBgColor}
                      borderRadius="full"
                    />
                  </InputGroup>

                  <Box>
                    <FormLabel>NFT Count</FormLabel>
                    <Flex>
                      <NumberInput
                        maxW="100px"
                        mr="2rem"
                        value={nftCount}
                        onChange={handleChangeNftCount}
                        min={minNftCount}
                        max={NFT_COUNT_MAX}
                        bg={cardBgColor}
                        borderRadius="md"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Slider
                        flex="1"
                        focusThumbOnChange={false}
                        value={nftCount}
                        onChange={handleChangeNftCount}
                        min={minNftCount}
                        max={NFT_COUNT_MAX}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb fontSize="sm" boxSize="32px" children={nftCount} />
                      </Slider>
                    </Flex>
                  </Box>
                </VStack>
              </FormControl>
            </ScaleFade>
          </Box>

          <Box>
            <SlideFade in={true} offsetY="20px">
              <VStack spacing={6} align="stretch">
                <Box>
                  <FormLabel>Upload Image</FormLabel>
                  <input
                    type="file"
                    onChange={handleChangeImage}
                    accept="image/jpeg, image/png"
                    style={{ display: "none" }}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button as="span" leftIcon={<UploadCloudIcon />} colorScheme="teal" variant="outline" width="full">
                      Choose Image
                    </Button>
                  </label>
                </Box>

                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <ExternalLinkIconChakra color="gray.300" />
                  </InputLeftElement>
                  <Input
                    value={uploadedImageUri}
                    placeholder="Uploaded image URL"
                    isReadOnly
                    bg={cardBgColor}
                    borderRadius="full"
                  />
                </InputGroup>

                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <ExternalLinkIconChakra color="gray.300" />
                  </InputLeftElement>
                  <Input
                    value={uploadedCollectionUploadedMetadataUri}
                    placeholder="Uploaded metadata URL"
                    isReadOnly
                    bg={cardBgColor}
                    borderRadius="full"
                  />
                </InputGroup>

                <Button
                  leftIcon={<UploadCloudIcon />}
                  colorScheme="purple"
                  isDisabled={!connected || !isValidFileInput}
                  onClick={handleUploadImageFile}
                  width="full"
                >
                  Upload Image
                </Button>

                <Button
                  leftIcon={<UploadCloudIcon />}
                  colorScheme="blue"
                  isDisabled={!connected || !isValidFileInput}
                  onClick={handleUploadJsonFiles}
                  width="full"
                >
                  Upload Metadata
                </Button>
              </VStack>
            </SlideFade>
          </Box>
        </SimpleGrid>

        <Fade in={true}>
          <VStack spacing={4} mt={10}>
          <Button
          size="lg"
          isDisabled={!connected || !isValidCollectionInput}
          isLoading={isProcessingNftCollectionCreation}
          onClick={createCompleteNftCollection}
          colorScheme="purple"
          width="full"
          borderRadius="full"
        >
          Create NFT Collection (Wallet Fees)
        </Button>

        <Button
          size="lg"
          isDisabled={!connected || !isValidCollectionInput}
          isLoading={isProcessingSponsoredNftCollectionCreation}
          onClick={createCompleteNftCollectionSponsored}
          colorScheme="green"
          width="full"
          borderRadius="full"
        >
          Create NFT Collection (Sponsored Fees)
        </Button>
      </VStack>
    </Fade>
  </motion.div>
</Container>
)
}