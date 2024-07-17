import type { NextApiRequest, NextApiResponse } from 'next'
import { AIRDROP_DEFAULT_AMOUNT } from '@consts/commons';
import {
  airdrop
} from '@helpers/mplx.helper.dynamic';
import { AirdropResponseData, mplhelp_T_AirdropResult } from 'types';

export default async function airdropHandler(req: NextApiRequest, res: NextApiResponse<AirdropResponseData>) {
  try {
    // console.debug(`app/pages/api/airdrop.ts: req.method=${ req.method }`)
    // Accept only POST request
    if (req.method !== 'POST') {
      // Handle any other HTTP method
      // console.log('req.body', req.body)
      res.status(500).json( { success: false, error: `POST request expected (received ${req.method})`} )
    }
    // Process POST request
    // console.log('POST req.body', req.body)
    const { 
      publicKey: _publicKey,
      amount: _amount
    } = req.body
    // console.debug(`app/pages/api/airdrop.ts: publicKey = ${ _publicKey }`)

    // throw new Error('airdrop failed') // test error handling

    let airdropAmount = AIRDROP_DEFAULT_AMOUNT

    try {
      airdropAmount = parseInt(_amount)
    } catch (error) {
      throw new Error('Invalid amount')
    }

    // Airdrop some SOL
    const resAirdrop:mplhelp_T_AirdropResult = await airdrop(_publicKey, airdropAmount)
    if (resAirdrop.success) {
      res.status(200).json({ success: true, address: _publicKey, amount: resAirdrop.amount })
      return
    }
    // airdrop failed 
    if (!resAirdrop.success) {
      res.status(200).json({ success: false, error: resAirdrop.error })
      return
    }
  } catch (error) {
    const response: AirdropResponseData = { success: false, error: '' };
    if (error instanceof Error) {
      console.log('error', error)
      response.error = error.message
    } else {
      response.error = 'Error'
    }
    res.status(500).json(response)
  } // catch
} // airdropHandler