import type { NextApiRequest, NextApiResponse } from 'next'


// type ResponseData = {
//   message: string,
//   error?: string
// }

type ResponseData =
  | {
      success: true;
      message: string,
    }
  | {
      success: false;
      error: string;
    };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {



  try {

    console.debug(`app/pages/api/airdrop-test.ts: req.method=${ req.method }`)

    // Process a POST request
    if (req.method !== 'POST') {
      // Handle any other HTTP method
      // console.log('req.body', req.body)
      res.status(500).json( { success: false, error: `POST request expected (received ${req.method})`} )
    }

    // Process a POST request
    const { publicKey: _publicKey } = req.query;
    console.debug(`app/pages/api/airdrop-test.ts: publicKey = ${ _publicKey }`)

    // wait 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5_000))

    console.log('POST req.body', req.body)

    res.status(200).json({ success: true, message: 'Mint success' })

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