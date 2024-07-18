import type { NextApiRequest, NextApiResponse } from 'next'
import { MINT_FEE_MAX_AMOUNT, MINT_FEE_MIN_AMOUNT } from '@consts/commons';
import { NFT_NAME_PREFIX_MAX_LENGTH } from '@consts/mtplx';
import { createCompleteNftCollectionCm_fromApp } from '@helpers/mplx.helper.dynamic';
import {
  CreateCompleteCollectionCmConfigResponseData,
   mplhelp_T_CreateCompleteNftCollectionCmConfig_Input,
   mplhelp_T_CreateCompleteNftCollectionCmConfig_Result
} from 'types';

export default async function collectionCreationHandler(req: NextApiRequest, res: NextApiResponse<CreateCompleteCollectionCmConfigResponseData>) {
  const LOGPREFIX = `app/pages/api/complete-collection-creation-sponsored.ts:collectionCreationHandler:`
  try {
    // console.debug(`${LOGPREFIX} req.method=${ req.method }`)
    // Accept only POST request
    if (req.method !== 'POST') {
      // Handle any other HTTP method
      // console.log('req.body', req.body)
      res.status(500).json( { success: false, error: `POST request expected (received ${req.method})`} )
    }
    // Process POST request
    console.log('POST req.body', req.body)
    const {
      collectionName,
      // collectionDescription,
      collectionUri,
      nftNamePrefix,
      itemsCount,
      metadataPrefixUri,
      startDateTime,
      endDateTime,
      mintFee,
    } = req.body

    // console.debug(`${LOGPREFIX} collectionName = `, collectionName)
    // console.debug(`${LOGPREFIX} collectionDescription = `, collectionDescription) // unused for now
    // console.debug(`${LOGPREFIX} collectionUri = `, collectionUri)
    // console.debug(`${LOGPREFIX} nftNamePrefix = `, nftNamePrefix)
    // console.debug(`${LOGPREFIX} itemsCount = `, itemsCount)
    // console.debug(`${LOGPREFIX} metadataPrefixUri = `, metadataPrefixUri)
    // console.debug(`${LOGPREFIX} startDateTime = `, startDateTime)
    // console.debug(`${LOGPREFIX} endDateTime = `, endDateTime)


    // Parameters checks
    if (!collectionName?.trim()) {
      res.status(500).json({ success: false, error: 'collectionName is required' })
      return
    }
    if (!collectionUri.trim()) {
      res.status(500).json({ success: false, error: 'collectionUri is required' })
      return
    }
    if (!nftNamePrefix.trim()) {
      res.status(500).json({ success: false, error: 'nftNamePrefix is required' })
      return
    }
    if (nftNamePrefix?.length > NFT_NAME_PREFIX_MAX_LENGTH) {
      res.status(500).json({ success: false, error: `nftNamePrefix must be at most ${NFT_NAME_PREFIX_MAX_LENGTH} characters long` })
      return
    }
    if (!metadataPrefixUri.trim()) {
      res.status(500).json({ success: false, error: 'metadataPrefixUri is required' })
      return
    }
    if (!itemsCount) {
      res.status(500).json({ success: false, error: 'itemsCount is required' })
      return
    }
    try {
      const itemsCountInt = parseInt(itemsCount)
      if (itemsCountInt <= 0) {
        res.status(500).json({ success: false, error: 'itemsCount msut be greater than 0' })
        return
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'itemsCount msut be a number' })
    }
    if (!mintFee) {
      res.status(500).json({ success: false, error: 'mintFee is required' })
      return
    }
    if (mintFee < MINT_FEE_MIN_AMOUNT) {
      res.status(500).json({ success: false, error: `mintFee must be greater than ${MINT_FEE_MIN_AMOUNT}` })
      return
    }
    if (mintFee > MINT_FEE_MAX_AMOUNT) {
      res.status(500).json({ success: false, error: `mintFee must be less than ${MINT_FEE_MAX_AMOUNT}` })
      return
    }
    // collection description is unused for now
    // console.debug(`${LOGPREFIX} collectionDescription = `, collectionDescription)
    // Start and end date are optional

    const input: mplhelp_T_CreateCompleteNftCollectionCmConfig_Input = {
      collectionName,
      collectionUri,
      nftNamePrefix,
      itemsCount,
      metadataPrefixUri,
      startDateTime,
      endDateTime,
      mintFee,
    }
    console.debug(`${LOGPREFIX} input = `, input)

    const resCreateCompleteNftCollectionCm:mplhelp_T_CreateCompleteNftCollectionCmConfig_Result =
      await createCompleteNftCollectionCm_fromApp(input)
    console.debug(`${LOGPREFIX} resCreateCompleteNftCollectionCm`, resCreateCompleteNftCollectionCm)

    if (resCreateCompleteNftCollectionCm.success) {
      console.debug(`${LOGPREFIX} createCollectionResult`, resCreateCompleteNftCollectionCm)
      const jsonResponse:CreateCompleteCollectionCmConfigResponseData = {
        success: true,
        collectionAddress: resCreateCompleteNftCollectionCm.collectionAddress,
        candyMachineAddress: resCreateCompleteNftCollectionCm.candyMachineAddress
      }
      console.debug(`${LOGPREFIX} res = `, jsonResponse)
      res.status(200).json(jsonResponse)
      return
    } else {
      console.error(`${LOGPREFIX} createCollectionResult.error`, resCreateCompleteNftCollectionCm.error)
      res.status(200).json({ success: false, error: resCreateCompleteNftCollectionCm.error })
      return
    }

  } catch (error) {
    console.error(`${LOGPREFIX} GLOBAL ERROR = `, error)
    const response: CreateCompleteCollectionCmConfigResponseData = { success: false, error: '' };
    if (error instanceof Error) {
      console.log('error', error)
      response.error = error.message
    } else {
      response.error = 'Error'
    }
    res.status(500).json(response)
  } // catch
} // collectionCreationHandler
