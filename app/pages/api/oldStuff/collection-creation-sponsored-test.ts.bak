import type { NextApiRequest, NextApiResponse } from 'next'
import { createSponsoredCollection } from '@helpers/mplx.helper.static';
import { CollectionCreationResponseData, mplhelp_T_CreateCollectionResult } from 'types';

export default async function collectionCreationHandler(req: NextApiRequest, res: NextApiResponse<CollectionCreationResponseData>) {
  const LOGPREFIX = `app/pages/api/collection-creation-test.ts:collectionCreationHandler:`
  try {
    // console.debug(`${LOGPREFIX} req.method=${ req.method }`)
    // Accept only POST request
    if (req.method !== 'POST') {
      // Handle any other HTTP method
      // console.log('req.body', req.body)
      res.status(500).json( { success: false, error: `POST request expected (received ${req.method})`} )
    }
    // Process POST request
    // console.log('POST req.body', req.body)
    // const { someParam: _someParam } = req.body
    // console.debug(`${LOGPREFIX} someParam = ${ _someParam }`)
    // throw new Error('Collection Creation failed') // test error handling
    try {
      const createCollectionResult:mplhelp_T_CreateCollectionResult =
        await createSponsoredCollection()
      if (createCollectionResult.success) {
        console.debug(`${LOGPREFIX} createCollectionResult`, createCollectionResult)
        res.status(200).json({ success: true, address: createCollectionResult.address })
        return
      } else {
        console.error(`${LOGPREFIX} createCollectionResult.error`, createCollectionResult.error)
        res.status(200).json({ success: false, error: createCollectionResult.error })
        return
      }
    } catch (error) {
      console.error('❌ - Error creating collection. Error:', error);
      const responseError: CollectionCreationResponseData = { success: false, error: '' };
      if (error instanceof Error) {
        console.error(`${LOGPREFIX} `, error)
        responseError.error = error.message
      } else {
        responseError.error = 'Error'
      }
      res.status(200).json( responseError )
      // res.status(500).json(response)
    } // catch



  } catch (error) {
    console.error(`${LOGPREFIX} GLOBAL ERROR = `, error)
    const response: CollectionCreationResponseData = { success: false, error: '' };
    if (error instanceof Error) {
      console.log('error', error)
      response.error = error.message
    } else {
      response.error = 'Error'
    }
    res.status(500).json(response)
  } // catch
} // collectionCreationHandler
