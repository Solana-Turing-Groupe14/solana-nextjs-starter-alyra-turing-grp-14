import { createCollectionV1 } from '@metaplex-foundation/mpl-core';
import { createSignerFromKeypair, Keypair as mplKeypair, keypairIdentity as mplKeypairIdentity, KeypairSigner as mplKeypairSigner } from '@metaplex-foundation/umi';
// import {  generateSigner } from '@metaplex-foundation/umi';
// import {PublicKey as soljsweb3PublicKey} from '@solana/web3.js'
import type { NextApiRequest, NextApiResponse } from 'next'
import { MPL_OPTIONS } from '@consts/mtplx';
import { getUmi } from '../../helpers/mplx.helpers';
// import { SIGNATURE_LENGTH_IN_BYTES } from "@consts/commons";

type ResponseData =
  | {
      success: true;
      message: string,
      // collectionAddress: string
    }
  | {
      success: false;
      error: string;
    };

export default async function collectionCreationHandler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    // console.debug(`app/pages/api/collection-creation-test.ts: req.method=${ req.method }`)
    // Accept only POST request
    if (req.method !== 'POST') {
      // Handle any other HTTP method
      // console.log('req.body', req.body)
      res.status(500).json( { success: false, error: `POST request expected (received ${req.method})`} )
    }
    // Process POST request
    // console.log('POST req.body', req.body)
    const { someParam: _someParam } = req.body
    console.debug(`app/pages/api/collection-creation-test.ts: someParam = ${ _someParam }`)

    // throw new Error('Collection Creation failed') // test error handling

    const umi = getUmi()

    // .env
    // TEST_SIGNER_SEED
    // DEFAULT_SIGNER_SEED
    const name = 'TEST_SIGNER_SEED'

    // let SIGNER_SEED_TEXT_from_env
    // if (!name) {
    //   SIGNER_SEED_TEXT_from_env = process.env.DEFAULT_SIGNER_SEED || ''
    // } else {
    //   SIGNER_SEED_TEXT_from_env = process.env[name as string] || ''
    // }

    const SIGNER_SEED_TEXT_from_env = ( !name ? process.env.DEFAULT_SIGNER_SEED || '' : process.env[name as string] || '')

    if (!SIGNER_SEED_TEXT_from_env) {
      res.status(404).send({ success: false, error: 'Error creating collection: NO SIGNER' })
      console.error('app/pages/api/collection-creation-test.ts: SIGNER_SEED_TEXT_from_env', 'Not Found')
    }
    const jsonSEED = JSON.parse( SIGNER_SEED_TEXT_from_env)
    const buf = Buffer.from( jsonSEED  as string , 'utf8')
    // console.debug('app/pages/api/collection-creation-test.ts: buf', buf)
    const SIGNER_SEED:Uint8Array = Uint8Array.from(buf)
    console.debug('app/pages/api/collection-creation-test.ts: SIGNER_SEED', SIGNER_SEED)

    const collectionSigner_keyPair:mplKeypair = umi.eddsa.createKeypairFromSecretKey(SIGNER_SEED);


    // Collection
    // - Creator
    const creatorKeyPair = createSignerFromKeypair( umi, collectionSigner_keyPair )
    // - Minter
    // const collectionMint_keypairSigner = generateSigner(umi);
    const collectionMint_keypairSigner:mplKeypairSigner = createSignerFromKeypair( umi, collectionSigner_keyPair )

    const PublicKeySTR = collectionMint_keypairSigner.publicKey.toString()
    console.debug('app/pages/api/collection-creation-test.ts: PublicKeySTR', PublicKeySTR)

    // res.status(200).json({ success: true, message: 'Collection Creation success' })
    // return

    umi.use(mplKeypairIdentity(creatorKeyPair));

    // Create a NEW collection
    try {
      await createCollectionV1(umi, {
        // collection: collectionMint_Signer,
        collection: collectionMint_keypairSigner,
          name: 'My Collection',
          uri: 'https://example.com/my-collection.json',
      }).sendAndConfirm(umi, MPL_OPTIONS);
      // console.log(`✅ - Created collection: ${collectionMint_Signer.publicKey.toString()}`)
      console.log(`✅ - Created collection: ${collectionMint_keypairSigner.publicKey.toString()}`)
      res.status(200).json({ success: true, message: 'Collection Creation success' })

    } catch (error) {
      console.error('❌ - Error creating collection.');

      const response: ResponseData = { success: false, error: '' };

      if (error instanceof Error) {
        console.error('app/pages/api/collection-creation-test.ts: ', error)
        response.error = error.message
  
      } else {
        response.error = 'Error'
      }
      res.status(200).json( response )
      // res.status(500).json(response)
    } // catch


    // wait 5 seconds
    // await new Promise((resolve) => setTimeout(resolve, 5_000))
  
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
} // collectionCreationHandler