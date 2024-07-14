import type { NextApiRequest, NextApiResponse } from 'next'
import { globalMint } from '@helpers/nft_collection_test';

type ResponseData =
  | {
      success: true;
      message: string,
    }
  | {
      success: false;
      error: string;
    };

export default async function mintHandler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    // console.debug(`app/pages/api/mint-test.ts: req.method=${ req.method }`)
    // Accept only POST request
    if (req.method !== 'POST') {
      // Handle any other HTTP method
      // console.log('req.body', req.body)
      res.status(500).json( { success: false, error: `POST request expected (received ${req.method})`} )
    }
    // Process POST request
    globalMint()

    // wait 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5_000))
    res.status(200).json({ success: true, message: 'Mint success' })

  } catch (error) {
    const response: ResponseData = { success: false, error: '' };

    if (error instanceof Error) {
      console.error('app/pages/api/mint-test.ts: ', error)
      response.error = error.message

    } else {
      response.error = 'Error'
    }
    res.status(500).json(response)
  } // catch

} // mintHandler