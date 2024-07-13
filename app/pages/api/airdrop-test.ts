import type { NextApiRequest, NextApiResponse } from 'next'
import { MPL_OPTIONS, MPL_SOL } from '@consts/mtplx';
import { getUmi } from '../../helpers/mplx.helpers';


// const options: TransactionBuilderSendAndConfirmOptions = {
//   send: { skipPreflight: true },
//   confirm: { commitment: 'processed' }
// };


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

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {



  try {
    // console.debug(`app/pages/api/airdrop-test.ts: req.method=${ req.method }`)
    // Accept only POST request
    if (req.method !== 'POST') {
      // Handle any other HTTP method
      // console.log('req.body', req.body)
      res.status(500).json( { success: false, error: `POST request expected (received ${req.method})`} )
    }
    // Process a POST request
    // console.log('POST req.body', req.body)
    const { publicKey: _publicKey } = req.body
    console.debug(`app/pages/api/airdrop-test.ts: publicKey = ${ _publicKey }`)
    // throw new Error('airdrop failed') // test error handling
    /*
    // 1. Airdrop some SOL
    // Skip this step if you already have SOL in the keypair
    try {
      await umi.rpc.airdrop(creatorKeyPair.publicKey, sol(10), options.confirm);
      console.log(`1. ✅ - Airdropped SOL to the ${creatorKeyPair.publicKey.toString()}`)
      } catch (error) {
        console.log('1. ❌ - Error airdropping SOL to the wallet.');
        }
    */

    // TODO: check address is valid

    const AIRDROP_AMOUNT = 1

    const umi = getUmi()
    await umi.rpc.airdrop(_publicKey, MPL_SOL(AIRDROP_AMOUNT), MPL_OPTIONS.confirm);

    // wait 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5_000))
    res.status(200).json({ success: true, message: 'Mint success', amount: AIRDROP_AMOUNT })

  } catch (error) {
    const response: ResponseData = { success: false, error: '' };

    if (error instanceof Error) {

      // console.log(error.name); // the type of error
      // console.log(error.message); // the description of the error
      // console.log(error.stack); // the stack trace of the error

      console.log('error', error)
      // response = { message: 'Error', error: error.message }
      response.error = error.message
      // return { "error": error.message } as unknown as JSON;

    } else {
      // return {"error": error.} as JSON;
      // return { "error": "Error" } as unknown as JSON;
      // response = { message: 'Error', error: 'Error' }
      response.error = 'Error'
    }

    // res.status(500).json({ message: 'Error', error: error.message })
    res.status(500).json(response)
  } // catch


} // handler