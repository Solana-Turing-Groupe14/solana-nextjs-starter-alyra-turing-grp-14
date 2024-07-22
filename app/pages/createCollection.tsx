import { AttachmentIcon, CheckCircleIcon, ExternalLinkIcon as ExternalLinkIconChakra } from '@chakra-ui/icons'
import {
  Box, Button, CloseButton, Container, Fade, Flex, FormControl, FormLabel,
  Heading, Input, InputGroup, InputLeftElement, Link,
  NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper,
  ScaleFade, SimpleGrid, SlideFade, Slider, SliderFilledTrack, SliderThumb, SliderTrack,
  Text, useBreakpointValue, useColorModeValue, useToast, VStack
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { motion } from "framer-motion"
import { ExternalLinkIcon, ExternalLinkIcon as ExternalLinkIconLucid, Image as ImageLucid, ImagePlus, UploadCloudIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { MINT_URI_PATH } from '@consts/client'
import {
  MINT_FEE_DEFAULT_AMOUNT, MINT_FEE_MAX_AMOUNT, MINT_FEE_MIN_AMOUNT,
  NFT_COLLECTION_SYMBOL_MAXLENGTH, NFT_COUNT_MAX, NFT_NAME_PREFIX_MAXLENGTH
} from '@consts/commons'
import { HOST, PORT } from '@consts/host'
import {
  createCmNftCollection_fromWallet as mplxH_createCmNftCollection_fromWallet,
  createNftCollection_fromWallet as mplxH_createNftCollection_fromWallet,
  finalizeCmNftCollectionConfig_fromWallet as mplxH_finalizeCmNftCollectionConfig_fromWallet,
} from "@helpers/mplx.helper.dynamic"
import { getUmiStorage, uploadJson, uploadSingleFile } from '@helpers/mplx.storage.helper'
import { getAddressUri } from "@helpers/solana.helper"
import {
  CreateCompleteCollectionCmConfigResponseData,
  mplhelp_T_CmNftCollection_Params,
  mplhelp_T_CreateCmNftCollection_fromWallet_Input,
  mplhelp_T_CreateNftCollection_fromWallet_Input,
  mplhelp_T_CreateNftCollection_Result,
  mplhelp_T_FinalizeCmNftCollectionConfig_fromWallet_Input,
  mplhelp_T_FinalizeCmNftCollectionConfig_Result,
  mplhelp_T_NameUriArray,
  T_CreateCompleteCollectionCmConfigInputData,
} from "types"
import { setIdentityPayer_WalletAdapter } from '@helpers/mplx.helper.common.dynamic'

/* eslint-disable react/no-children-prop */

const FILEPATH = 'app/pages/createCollection.tsx'

export default function CreateCollectionPage() {
  const SUCCESS_DELAY = 60_000
  const WARN_DELAY = 15_000
  const ERROR_DELAY = 60_000

  const randomStringNumber = Math.random().toString(10).substring(2, 5)
  const MAX_FILE_SIZE = 1000 // 1MB
  const DEFAULT_CANDY_MACHINE_ADDRESS = ''

  const minNftCount = 0

  const defaultCollectionName = `Test coll. name ${randomStringNumber}`
  const defaultCollectionDescription = `Test coll. desc. ${randomStringNumber}`
  const defaultNftNamePrefix = `Test NFT prefix ${randomStringNumber}`
  const defaultCollectionSymbol = `SYM ${randomStringNumber}`
  const defaultNftUploadedImageUri = ""
  const defaultNftCollectionUploadedMetadataUri = ""
  const defaultUploadedCollectionUploadedNftsNameUriArray: mplhelp_T_NameUriArray = []

  const [collectionName, setCollectionName] = useState<string>(defaultCollectionName)
  const [collectionDescription, setCollectionDescription] = useState<string>(defaultCollectionDescription)
  const [collectionSymbol, setcollectionSymbol] = useState(defaultCollectionSymbol)
  const [nftNamePrefix, setNftNamePrefix] = useState<string>(defaultNftNamePrefix)
  const [image, setImage] = useState<File | undefined>()
  const [nftCount, setNftCount] = useState<number>(minNftCount)
  const [mintFee, setMintFee] = useState<number>(MINT_FEE_DEFAULT_AMOUNT)
  const [uploadedImageUri, setUploadedImageUri] = useState<string>(defaultNftUploadedImageUri)
  const [uploadedCollectionUploadedMetadataUri, setUploadedCollectionUploadedMetadataUri] = useState<string>(defaultNftCollectionUploadedMetadataUri)
  const [uploadedCollectionUploadedNftsNameUriArray, setUploadedCollectionUploadedNftsNameUriArray] = useState<mplhelp_T_NameUriArray>(defaultUploadedCollectionUploadedNftsNameUriArray)

  const [candyMachineAddress, setCandyMachineAddress] = useState<string>(DEFAULT_CANDY_MACHINE_ADDRESS)

  const { connected, publicKey: connectedWalletPublicKey, wallet } = useWallet()
  const [isProcessingNftCollectionCreation, setIsProcessingNftCollectionCreation] = useState(false)
  const [isProcessingSponsoredNftCollectionCreation, setIsProcessingSponsoredNftCollectionCreation] = useState(false)

  const toast = useToast()
  const toastSuccessBgColor = useColorModeValue("green.600", "green.200")
  const toastTestColor = useColorModeValue("white", "black")

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

  const candyMachineMintUri = useMemo(() => {
    const mintPath = HOST + (PORT ? `:${PORT}` : '') + MINT_URI_PATH + '?candyMachineAddress=' + candyMachineAddress
    return mintPath
  }, [candyMachineAddress])

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
      // Vérifications initiales
      if (!isConnected || !wallet || !uploadedImageUri || !uploadedCollectionUploadedMetadataUri || !uploadedCollectionUploadedNftsNameUriArray || uploadedCollectionUploadedNftsNameUriArray.length !== nftCount) {
        console.error(`${LOGPREFIX}Missing required data`)
        toast({
          title: 'Missing data',
          description: "Please ensure all required data is provided.",
          status: 'error',
          duration: ERROR_DELAY,
          isClosable: true,
          position: 'top-right',
        })
        return
      }
      setIsProcessingNftCollectionCreation(true)

      // 1. Créer la collection
      console.log(`${LOGPREFIX}Creating collection with URI:`, uploadedCollectionUploadedMetadataUri);
      const createNftCollectionInput: mplhelp_T_CreateNftCollection_fromWallet_Input = {
        walletAdapter: wallet.adapter,
        collectionName: collectionName,
        collectionUri: uploadedCollectionUploadedMetadataUri,
      }
      const createNftCollectionResponse = await mplxH_createNftCollection_fromWallet(createNftCollectionInput)
      if (!createNftCollectionResponse.success) {
        throw new Error(`Failed to create collection: ${createNftCollectionResponse.error}`)
      }
      console.log(`${LOGPREFIX}Collection created successfully:`, createNftCollectionResponse);

      // 2. Créer la Candy Machine
      const cmNftCollectioNParams: mplhelp_T_CmNftCollection_Params = {
        itemsCount: nftCount,
        mintFee: mintFee,
        maxMintPerwallet: 1,
        startDateTime: new Date(),
        endDateTime: null
      }
      const createCmNftCollectionInput: mplhelp_T_CreateCmNftCollection_fromWallet_Input = {
        walletAdapter: wallet.adapter,
        collectionSigner: createNftCollectionResponse.collectionSigner,
        nftNamePrefix: nftNamePrefix,
        metadataPrefixUri: '', // Laissé vide intentionnellement
        cmNftCollectioNParams,
      }
      const createCmNftCollectionResponse = await mplxH_createCmNftCollection_fromWallet(createCmNftCollectionInput)
      if (!createCmNftCollectionResponse.success) {
        throw new Error(`Failed to create Candy Machine: ${createCmNftCollectionResponse.error}`)
      }
      console.log(`${LOGPREFIX}Candy Machine created successfully:`, createCmNftCollectionResponse);

      // 3. Finaliser la configuration de la Candy Machine
      console.log(`${LOGPREFIX}Finalizing Candy Machine with metadata:`, uploadedCollectionUploadedNftsNameUriArray);
      const finalizeCmNftCollectionConfigInput: mplhelp_T_FinalizeCmNftCollectionConfig_fromWallet_Input = {
        walletAdapter: wallet.adapter,
        collectionSigner: createNftCollectionResponse.collectionSigner,
        candyMachineSigner: createCmNftCollectionResponse.candyMachineSigner,
        itemsCount: nftCount,
        nameUriArray: uploadedCollectionUploadedNftsNameUriArray,
      }
      const finalizeCmNftCollectionConfigResponse = await mplxH_finalizeCmNftCollectionConfig_fromWallet(finalizeCmNftCollectionConfigInput)
      if (!finalizeCmNftCollectionConfigResponse.success) {
        throw new Error(`Failed to finalize Candy Machine configuration: ${finalizeCmNftCollectionConfigResponse.error}`)
      }
      console.log(`${LOGPREFIX}Candy Machine finalized successfully:`, finalizeCmNftCollectionConfigResponse);

      // Mise à jour de l'adresse de la Candy Machine
      setCandyMachineAddress(finalizeCmNftCollectionConfigResponse.candyMachineAddress)

      // Vérification finale des métadonnées
      console.log(`${LOGPREFIX}Final metadata check:`, {
        collectionUri: uploadedCollectionUploadedMetadataUri,
        nftMetadataUris: uploadedCollectionUploadedNftsNameUriArray
      });

      // Affichage des toasts de succès
      displaySuccessToasts(
        createNftCollectionResponse,
        // createCmNftCollectionResponse,
        finalizeCmNftCollectionConfigResponse
      )
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : `${error}`
      console.error(`${LOGPREFIX}Error:`, errorMsg);
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
  }

  // Fonction auxiliaire pour afficher les toasts de succès
  const displaySuccessToasts = (
    collectionResponse: mplhelp_T_CreateNftCollection_Result,
    // cmResponse: mplhelp_T_CreateCmNftCollection_Result,
    finalizeResponse: mplhelp_T_FinalizeCmNftCollectionConfig_Result
  ) => {
    const uriCollection = collectionResponse.success && getAddressUri(collectionResponse.collectionAddress)
    const uriCandyMachine = finalizeResponse.success && getAddressUri(finalizeResponse.candyMachineAddress)
    toast({
      duration: SUCCESS_DELAY,
      position: 'top-right',
      render: ({ onClose }) => (
        <Box bg={toastSuccessBgColor} color={toastTestColor} p={3} borderRadius='lg'>
          <div className='flex justify-between'>
            <CheckCircleIcon boxSize={5} className='ml-1 mr-2' />
            <Text fontWeight="bold">NFT Collection created successfully</Text>
            <CloseButton size='sm' onClick={onClose} />
          </div>
          <div className='m-2'>
            {uriCollection && (
              <Link href={uriCollection} isExternal className="flex text-end">
                <div className='mr-2'>Collection</div>
                <ExternalLinkIconLucid size='16px' />
              </Link>
            )}
            {uriCandyMachine && (
              <Link href={uriCandyMachine} isExternal className="flex text-end">
                <div className='mr-2'>Candy Machine</div>
                <ExternalLinkIconLucid size='16px' />
              </Link>
            )}
          </div>
        </Box>
      ),
    })
  } // displaySuccessToasts

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
      // TODO : create/display date inputs
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

      const cmNftCollectioNParams: mplhelp_T_CmNftCollection_Params = {
        itemsCount: nftCount,
        mintFee: mintFee,
        maxMintPerwallet: 1, // TODO: maxMintPerwallet
        startDateTime,
        endDateTime
      }
      const createCompleteCollectionCmConfigInputData: T_CreateCompleteCollectionCmConfigInputData = {
        collectionName: collectionName,
        collectionUri: uploadedCollectionUploadedMetadataUri,
        metadataPrefixUri: '',
        collectionDescription,
        nftNamePrefix,
        nameUriArray: uploadedCollectionUploadedNftsNameUriArray,
        cmNftCollectioNParams,
      }
      // console.debug(`${LOGPREFIX}createCompleteCollectionCmConfigInputData`, createCompleteCollectionCmConfigInputData);
      const res = await fetch('/api/complete-collection-creation-sponsored', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createCompleteCollectionCmConfigInputData)
      });
      const response: CreateCompleteCollectionCmConfigResponseData = await res.json();
      console.debug(`${LOGPREFIX}`, response);

      if (response && response.success) {

        const uriCollection = getAddressUri(response.collectionAddress)
        const uriCandyMachine = getAddressUri(response.candyMachineAddress)
        setCandyMachineAddress(response.candyMachineAddress)
        toast({
          duration: SUCCESS_DELAY,
          position: 'top-right',
          render: ({ onClose }) => (
            <Box
              bg={toastSuccessBgColor}
              color={toastTestColor}
              p={3}
              borderRadius='lg'
            >
              <div className='flex justify-between'>
                <div className='flex '>
                  <CheckCircleIcon boxSize={5} className='ml-1 mr-2' />
                  <Text fontWeight="bold" >NFT Collection created</Text>
                </div>
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

  const handleChangeNftCount = (_value: number | string) => {
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

  const handleChangeNftCollectionSymbol = (event: React.ChangeEvent<HTMLInputElement>) => {
    setcollectionSymbol(event.target.value)
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

  // ----------------------------

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateJsonNftMetadata = (_collectionMetadataJson:any, _nftCount: number):unknown[] => {
    const LOGPREFIX = `${FILEPATH}:generateJsonNftMetadata: `
    // const nameUriArray: mplhelp_T_NameUriArray = []
    const metadataJsonArray: unknown[] = []
    try {
      if (!_collectionMetadataJson) {
        console.error(`${LOGPREFIX}No collection metadata provided`)
        return metadataJsonArray;
      }
      for (let i = 0; i < _nftCount; i++) {
        const nftMetadataJson = {
          name: `${nftNamePrefix} #${i + 1}`,
          symbol: collectionSymbol,
          description: `${collectionDescription} - NFT #${i + 1}`,
          image: uploadedImageUri,
          attributes: _collectionMetadataJson.attributes,
          properties: {
            ..._collectionMetadataJson.properties,
            files: [{ uri: uploadedImageUri, type: image ? image.type : "image/png" }],
          },
          collection: {
            name: collectionName,
            family: collectionSymbol,
          },
        };
        // nameUriArray.push({ name: nftMetadataJson.name, uri: '' })
        metadataJsonArray.push(nftMetadataJson)
      } // for
    } catch (error) {
      console.error(`${LOGPREFIX}error`, error);
    }
    return metadataJsonArray;
  } // generateJsonNftMetadata

  // ----------------------------

  // Upload Json metadata & individual NFT metadata

  const handleUploadJsonFiles = async () => {
    const LOGPREFIX = `${FILEPATH}:handleUploadJsonFiles: `
    try {
      if (!isConnected || !wallet) {
        warnIsNotConnected(); return
      }
      if (!nftCount || nftCount <= 0) {
        console.warn(`${LOGPREFIX}NFT count must be greater than 0`)
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

      const creatorAddress = wallet.adapter.publicKey?.toBase58() || "VOTRE_ADRESSE_SOLANA";

      // Créer le JSON spécifique pour la collection
      const collectionMetadataJson = {
        name: collectionName,
        symbol: collectionSymbol,
        description: collectionDescription,
        image: uploadedImageUri,
        attributes: [
          { "trait_type": "Niveau de Caféine", "value": "Overdose" },
          { "trait_type": "Bugs Squashés", "value": "Plus que Solana" },
          { "trait_type": "Santé Mentale", "value": "404 Not Found" },
          { "trait_type": "Skill Solana", "value": "Über Maître" },
          { "trait_type": "Diplôme Alyra", "value": "En Vue" }
        ],
        properties: {
          files: [{ uri: uploadedImageUri, type: image ? image.type : "image/png" }],
          category: "image",
          creators: [{ address: creatorAddress, share: 100 }]
        }
      };

      console.debug(`${LOGPREFIX}collectionMetadataJson`, collectionMetadataJson);
      const umiStorage = getUmiStorage()
      setIdentityPayer_WalletAdapter(wallet.adapter, umiStorage, true)
      const collectionMetadataJsonUri = await uploadJson(umiStorage, collectionMetadataJson)
      // console.debug(`${LOGPREFIX}collectionMetadataJsonUri`, collectionMetadataJsonUri);
      if (!collectionMetadataJsonUri) {
        console.error(`${LOGPREFIX}No collectionMetadataJsonUri`)
        toast({
          title: 'Collection metadata upload failed',
          description: "Invalid uri after upload",
          status: 'error',
          duration: ERROR_DELAY,
          isClosable: true,
          position: 'top-right',
        })
        setUploadedCollectionUploadedMetadataUri('')
        return
      }

      setUploadedCollectionUploadedMetadataUri(collectionMetadataJsonUri)

      toast({
        title: 'Collection metadata uploaded',
        description: "Collection metadata generated & uploaded successfully.",
        status: 'success',
        duration: SUCCESS_DELAY,
        isClosable: true,
        position: 'top-right',
      })

      const jsonMetadataArray = generateJsonNftMetadata(collectionMetadataJson, nftCount)
      if (!jsonMetadataArray || jsonMetadataArray.length !== nftCount) {
        console.error(`${LOGPREFIX}Missing Json metadata`)
        toast({
          title: 'NFT metadata generation failed',
          description: "Invalid content",
          status: 'error',
          duration: ERROR_DELAY,
          isClosable: true,
          position: 'top-right',
        })
        setUploadedCollectionUploadedNftsNameUriArray([])
        return
      }


      const nameUriArray: mplhelp_T_NameUriArray = []
      // Upload each NFT metadata
      for (let i = 0; i < jsonMetadataArray.length; i++) {
        // const nameUri = nameUriArray[i]
        console.debug(`${LOGPREFIX}NFT #${i + 1} metadata`, jsonMetadataArray[i]);
        const nftJsonUri = await uploadJson(umiStorage, jsonMetadataArray[i])
        // nameUriArray[i].uri = nftJsonUri
        nameUriArray.push({ name: `${nftNamePrefix} #${i + 1}`, uri: nftJsonUri })
        console.debug(`${LOGPREFIX}NFT #${i + 1} name : ${nameUriArray[i].name} metadata URI: ${nameUriArray[i].uri}` );
      }
      setUploadedCollectionUploadedNftsNameUriArray(nameUriArray)
      console.debug(`${LOGPREFIX}nameUriArray`, nameUriArray);

      toast({
        title: 'NFT metadata uploaded',
        description: `${nftCount} NFT metadata files successfully generated & uploaded.`,
        status: 'success',
        duration: SUCCESS_DELAY,
        isClosable: true,
        position: 'top-right',
      })

    } catch (error) {
      console.error(`${LOGPREFIX}error`, error);
      toast({
        title: 'Metadata upload failed',
        description: "An error occurred while uploading metadata.",
        status: 'error',
        duration: ERROR_DELAY,
        isClosable: true,
        position: 'top-right',
      })
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
      // Image Upload
      const umiStorage = getUmiStorage()
      setIdentityPayer_WalletAdapter(wallet.adapter, umiStorage, true)
      const fileUri = await uploadSingleFile( umiStorage, image)
      // console.debug(`${LOGPREFIX}fileUri`, fileUri);
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
      console.debug(`${LOGPREFIX}fileUri`, fileUri);

    } catch (error) {
      console.error(`${LOGPREFIX}error`, error);
    }
  } // handleUploadImageFile

  const cardBgColor = useColorModeValue("white", "gray.700")
  const textNormalColor = useColorModeValue("gray.800", "white")
  const textWarnColor = useColorModeValue("orange.600", "orange.300")
  const textNormalSliderColor = useColorModeValue("gray.800", "gray.800")

  const columnCount = useBreakpointValue({ base: 1, md: 2 })

  const nftNamePrefixMaxLength = useMemo(() => {
    // const LOGPREFIX = `${FILEPATH}:nftNamePrefixMaxLength: `
    // console.debug(`${LOGPREFIX}nftCount=${nftCount} NFT_NAME_PREFIX_MAXLENGTH=${NFT_NAME_PREFIX_MAXLENGTH}`)
    const nftNamePostfix = ` #${nftCount.toString()}`
    // `${_nftNamePrefix}${nftNamePostfix}`.length
    const maxLen = NFT_NAME_PREFIX_MAXLENGTH - nftNamePostfix.length
    // console.debug(`${LOGPREFIX}maxLen=${maxLen}`)
    return maxLen
  }, [nftCount]);


  // ----------------------------

  const textColor = useColorModeValue("black", "white")
  const linkColor = useColorModeValue("teal.500", "teal.300")

  // ----------------------------

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
                      // color={textWarnColor}
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
                      maxLength={nftNamePrefixMaxLength}
                      bg={cardBgColor}
                      borderRadius="full"
                    />
                  </InputGroup>

                  <InputGroup>
                    <Input
                      value={collectionSymbol}
                      onChange={handleChangeNftCollectionSymbol}
                      placeholder="NFT symbol"
                      bg={cardBgColor}
                      maxLength={NFT_COLLECTION_SYMBOL_MAXLENGTH}
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
                        color={nftCount > minNftCount ? textNormalColor : textWarnColor}
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
                        color={nftCount > minNftCount ? textNormalSliderColor : textWarnColor}
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
                    <Button as="span" leftIcon={image ? <ImageLucid /> : <ImagePlus />}
                      colorScheme={isValidFileInput ? 'green' : 'yellow'}
                      variant="outline" width="full">
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
                  colorScheme={
                    isValidFileInput ?
                      (uploadedImageUri ? 'green' : 'orange')
                      :
                      'red'
                  }
                  // colorScheme="purple"
                  isDisabled={!connected || !isValidFileInput}
                  onClick={handleUploadImageFile}
                  width="full"
                >
                  Upload Image
                </Button>

                <Button
                  leftIcon={<UploadCloudIcon />}
                  // colorScheme="blue"
                  colorScheme={
                    isValidFileInput ?
                      (uploadedImageUri ?
                        ((uploadedCollectionUploadedMetadataUri && uploadedCollectionUploadedNftsNameUriArray.length === nftCount)
                          ? 'green' : (nftCount > 0 ? 'yellow' : 'orange')) : 'orange')
                      :
                      'red'
                  }
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
              // colorScheme="green"
              colorScheme={
                isValidFileInput ?
                  (uploadedImageUri ? (uploadedCollectionUploadedMetadataUri && nftCount > minNftCount ? 'green' : 'yellow') : 'orange')
                  :
                  'red'
              }
              width="full"
              borderRadius="full"
            >
              Create NFT Collection (Sponsored Fees)
            </Button>
          </VStack>

          <Box
            className='mt-3 overflow-hidden p-1'
            border={'1px solid '}
            borderRadius={'md'}
            display={(candyMachineAddress && candyMachineMintUri.length ? '' : 'none')}
          >
            <Text className='flex pr-2'>
              Mint page Url:
            </Text>
            <Link color={linkColor} isExternal href={candyMachineMintUri} className='flex'>
              <Text className='pr-2' color={textColor}>
                <ExternalLinkIcon size='16px' />
              </Text>
              {candyMachineAddress}
            </Link>
          </Box>

        </Fade>
      </motion.div>
    </Container>
  )
}