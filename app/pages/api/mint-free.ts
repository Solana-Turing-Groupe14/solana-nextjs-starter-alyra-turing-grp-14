import type { NextApiRequest, NextApiResponse } from 'next'
import { mintNftFromCm_fromApp } from '@helpers/mplx.helper.dynamic';
import { mintFromCmFromAppResponseData, mplhelp_T_MintNftCm_fromApp_Input } from 'types';

const LOGPREFIX = `app/pages/api/mint-free.ts:`

export default async function mintHandler(req: NextApiRequest, res: NextApiResponse<mintFromCmFromAppResponseData>) {
  try {
    // console.debug(`app/pages/api/mint-test.ts: req.method=${ req.method }`)
    // Accept only POST request
    if (req.method !== 'POST') {
      // Reject any other HTTP method
      // console.log('req.body', req.body)
      res.status(500).json( { success: false, error: `POST request expected (received ${req.method})`} )
    }
    // Process POST request
    // Handle any other HTTP method
    // console.debug('req.body', req.body)
    const { 
      candyMachineAddress: _candyMachineAddress,
      minterAddress: _minterAddress,
    } = req.body
    // console.debug(`${LOGPREFIX} _candyMachineAddress = `, _candyMachineAddress)

    if (!_candyMachineAddress) {
      res.status(200).json({ success: false, error: 'candyMachineAddress is required' })
      return
    }
    if (!_minterAddress) {
      res.status(200).json({ success: false, error: 'minterAddress is required' })
      return
    }
    const input:mplhelp_T_MintNftCm_fromApp_Input = {
      candyMachineAddress: _candyMachineAddress,
      minterAddress: _minterAddress,
    }
    const mintResult = await mintNftFromCm_fromApp(input)
    if (mintResult.success) {
      const jsonResponse:mintFromCmFromAppResponseData = {
        success: true,
        mintAddress: mintResult.mintAddress
      }
      console.debug(`${LOGPREFIX} jsonResponse = `, jsonResponse)
      res.status(200).json(jsonResponse)
      return
    } else {
      res.status(200).json({ success: false, error: mintResult.error })
      return
    }
  } catch (error) {
    const errorMsg = (error instanceof Error) ? error.message : 'Error'
    console.error(`${LOGPREFIX}`, error)
    const response: mintFromCmFromAppResponseData = { success: false, error: errorMsg };
    res.status(500).json(response)
  } // catch

} // mintHandler