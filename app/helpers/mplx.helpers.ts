import {
  mplCandyMachine as mplCoreCandyMachine,
} from "@metaplex-foundation/mpl-core-candy-machine";
import { generateSigner, Umi } from '@metaplex-foundation/umi';
import { Keypair } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { RPC_URL } from '@helpers/solana.helper';

const getDataTEST_SIGNER_SEED_JSON = async (signerName: string): Promise<JSON> => {
  try {
    console.debug('mplx.helpers.ts:getDataTEST_SIGNER_SEED_JSON: signerName', signerName)
    if (!signerName) {
      console.error('mplx.helpers.ts:getDataTEST_SIGNER_SEED_JSON: signerName not provided')
    }
      const res = await fetch('/api/get-signer', {
        method: 'post',
        headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // customParameter: customParameter
        // name: 'TEST_SIGNER'
        name: signerName
      })
    });
    const response = await res.json();
    // console.debug('mplx.helpers.ts:getDataTEST_SIGNER_SEED_JSON: response', response);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.name); // the type of error
      console.log(error.message); // the description of the error
      console.log(error.stack); // the stack trace of the error
      return { "error": error.message } as unknown as JSON;
    } else {
      // return {"error": error.} as JSON;
      return { "error": "Error" } as unknown as JSON;
    }
  }
}

const mplx_umi:Umi = createUmi(RPC_URL).use(mplCoreCandyMachine());
if (!mplx_umi) {
  throw new Error('mplx_umi not found')
}

export const getUmi = ():Umi => {
    return mplx_umi
} // getUmi



const getDataTEST_SIGNER_SEED = async(signerName: string): Promise<Uint8Array> => {
    try {
      console.debug('mplx.helpers.ts:getDataTEST_SIGNER_SEED: signerName', signerName)
      const data = await getDataTEST_SIGNER_SEED_JSON(signerName);
      return new Uint8Array(data as unknown as ArrayBufferLike);

    } catch (error) {
      console.error('mplx.helpers.ts:getDataTEST_SIGNER_SEED', error)
    }
    return new Uint8Array([]);
} // getDataTEST_SIGNER_SEED



export const getKeyPair = async(signerName: string): Promise<Keypair> => {
  console.debug(`mplx.helpers.ts:getKeyPair: signerName = '${signerName}'`)
  // console.debug('mplx.helpers.ts:getKeyPair: TODO')
  const TEST_SIGNER_SEED_ = await getDataTEST_SIGNER_SEED(signerName);
  if (!TEST_SIGNER_SEED_ || TEST_SIGNER_SEED_.length != 64) {
    console.error('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED_ not found')
    // throw new Error('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED_ not found')
    const someRandomSigner = generateSigner(mplx_umi);
    return someRandomSigner;
  } else {
    const TESTkeyPair = mplx_umi.eddsa.createKeypairFromSecretKey(TEST_SIGNER_SEED_);
    // const TESTkeyPair = mplx_umi.eddsa.createKeypairFromSecretKey( new Uint8Array(seed) );
    return TESTkeyPair;
  }
} // getKeyPair