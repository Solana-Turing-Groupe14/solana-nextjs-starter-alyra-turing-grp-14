import type { NextApiRequest, NextApiResponse } from 'next'
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
      collectionUri,
      nftNamePrefix,
      itemsCount,
      metadataPrefixUri,
      startDateTime,
      endDateTime,
    } = req.body

    // TODO : check parameters
    // TODO : check parameters
    // TODO : check parameters
    // TODO : check parameters
    // TODO : check parameters
    // TODO : check parameters
    // TODO : check parameters
    // TODO : check parameters
    // TODO : check parameters

    const input: mplhelp_T_CreateCompleteNftCollectionCmConfig_Input = {
      collectionName,
      collectionUri,
      nftNamePrefix,
      itemsCount,
      metadataPrefixUri,
      startDateTime,
      endDateTime,
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
