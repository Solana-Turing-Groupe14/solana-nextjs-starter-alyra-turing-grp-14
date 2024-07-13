import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData =
  | {
      success: true;
      message: string,
    }
  | {
      success: false;
      error: string;
    };

export default function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {



  console.debug(`app/pages/api/mint-test.ts: req.method=${ req.method }`)

  const { name: _name, type: _type } = req.query;

  console.debug(`app/pages/api/mint-test.ts: name = ${ _name }`)
  console.debug(`app/pages/api/mint-test.ts: type = ${ _type }`)


  if (req.method === 'POST') {
    // Process a POST request
    console.log('POST req.body', req.body)
  } else {
    // Handle any other HTTP method
    // console.log('req.body', req.body)
    res.status(500).json( { success: false, error: `POST request expected (received ${req.method})`} )
  }

  try {

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