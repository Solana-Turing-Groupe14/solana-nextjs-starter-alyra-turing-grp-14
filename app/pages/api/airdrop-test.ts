import {PublicKey as soljsweb3PublicKey} from '@solana/web3.js'
import type { NextApiRequest, NextApiResponse } from 'next'
import { MPL_OPTIONS, MPL_SOL } from '@consts/mtplx';
import { getUmi } from '../../helpers/mplx.helpers';

type ResponseData =
  | {
      success: true;
      message: string,
      amount: number
    }
  | {
      success: false;
      error: string;
    };

export default async function airdropHandler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    // console.debug(`app/pages/api/airdrop-test.ts: req.method=${ req.method }`)
    // Accept only POST request
    if (req.method !== 'POST') {
      // Handle any other HTTP method
      // console.log('req.body', req.body)
      res.status(500).json( { success: false, error: `POST request expected (received ${req.method})`} )
    }
    // Process POST request
    // console.log('POST req.body', req.body)
    const { publicKey: _publicKey } = req.body
    // console.debug(`app/pages/api/airdrop-test.ts: publicKey = ${ _publicKey }`)

    // throw new Error('airdrop failed') // test error handling

    // check address validity
    const isValid = soljsweb3PublicKey.isOnCurve(new soljsweb3PublicKey(_publicKey))
    if (!isValid) {
      // throw new Error('Invalid public key')
      res.status(200).json({ success: false, error: 'Invalid public key' })
    }

    // Airdrop some SOL
    const AIRDROP_AMOUNT = 1
    const umi = getUmi()
    try {
      await umi.rpc.airdrop(_publicKey, MPL_SOL(AIRDROP_AMOUNT), MPL_OPTIONS.confirm);
      console.log(`✅ - Airdropped ${AIRDROP_AMOUNT} SOL to the ${_publicKey}`)
      } catch (error) {
        console.log(`❌ - Error airdropping SOL to ${_publicKey}`);
        // throw new Error('Error airdropping SOL')

        const response: ResponseData = { success: false, error: '' };
        if (error instanceof Error) {
          console.log('error', error)
          response.error = `Error airdropping SOL to ${_publicKey} : ${error.message}`
        } else {
          // response.error = 'Error'
          response.error = `Error airdropping SOL to ${_publicKey}`
        }
        // res.status(200).json({ success: false, error: `Error airdropping SOL to ${_publicKey}` })
        res.status(200).json(response)
    }
    // wait 5 seconds
    // await new Promise((resolve) => setTimeout(resolve, 5_000))
    res.status(200).json({ success: true, message: 'Mint success', amount: AIRDROP_AMOUNT })
  } catch (error) {
    const response: ResponseData = { success: false, error: '' };
    if (error instanceof Error) {
      console.log('error', error)
      response.error = error.message
    } else {
      response.error = 'Error'
    }
    res.status(500).json(response)
  } // catch
} // airdropHandler