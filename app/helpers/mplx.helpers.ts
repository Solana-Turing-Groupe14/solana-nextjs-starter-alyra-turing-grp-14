// import {TEST_SIGNER_SEED} from '@consts/signers_consts'
import {
  // addConfigLines, create,
  // deleteCandyMachine,
  // fetchCandyMachine,
  // mintV1,
  mplCandyMachine as mplCoreCandyMachine,
} from "@metaplex-foundation/mpl-core-candy-machine";
import { Umi } from '@metaplex-foundation/umi';
import { Keypair } from '@metaplex-foundation/umi';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { RPC_URL } from '@helpers/solana.helper';

// export const TESTkeyPair = Keypair.fromSecretKey(new Uint8Array([
//     40,  93,  83,  37,  31,  65,  52,  11,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19
//   ]));

// export async function getSolanaBalance(publicKey: string): Promise<number> {

// const someRandomSecretKey_ = [40,  93,  83,  37,  31,  65,  52,  11,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19]

// if (!someRandomSecretKey_) {
//   throw new Error('Secret key not found')
// }

const getDataTEST_SIGNER_SEED_JSON = async (/* customParameter */): Promise<JSON> => {
  const res = await fetch('/api/get-signer', {
      method: 'post',
      headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // customParameter: customParameter
    })
  });
  const response = await res.json();
  // console.debug('mplx.helpers.ts:getDataTEST_SIGNER_SEED_JSON: response', response);
  return response;
}
/*
const getDataTEST_SIGNER_SEED_JSON = (): JSON => {
  try {
    const res = await fetch('/api/get-signer', {
        method: 'post',
        headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // customParameter: customParameter
      })
    });
    const response = res.json()
      .then((data) => {
        console.debug('mplx.helpers.ts:getDataTEST_SIGNER_SEED_JSON: data', data);
        return data;
      })
      .catch((error) => {
        console.error('mplx.helpers.ts:getDataTEST_SIGNER_SEED_JSON: error', error)
        // throw new Error('mplx.helpers.ts:getDataTEST_SIGNER_SEED_JSON: error')
      }).
      finally(() => {
        console.debug('mplx.helpers.ts:getDataTEST_SIGNER_SEED_JSON: finally')
      })
    // console.debug('mplx.helpers.ts:getDataTEST_SIGNER_SEED_JSON: response', response)
    // return response;
  } catch (error) {
    console.error('mplx.helpers.ts:getDataTEST_SIGNER_SEED_JSON: error', error)
  }
  return {} as JSON;
}
*/


const mplx_umi:Umi = createUmi(RPC_URL).use(mplCoreCandyMachine());
if (!mplx_umi) {
  throw new Error('mplx_umi not found')
}

export const getUmi = ():Umi => {
    return mplx_umi
} // getUmi


  // const someRandomSecretKey_ = [40,  93,  83,  37,  31,  65,  52,  11,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19]

/*
export const getKeyPair = (signerName: string): Keypair => {

  console.warn(`mplx.helpers.ts:getKeyPair: signerName = '${signerName}'`)
  console.warn('mplx.helpers.ts:getKeyPair: TODO')

  // console.warn('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED', TEST_SIGNER_SEED)
  const seed = getDataTEST_SIGNER_SEED_JSON().then((data) => {
    console.debug('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED: data = ', data)
      return data
      }).catch((error) => {
        console.error('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED', error)
        throw new Error('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED: error')
      }
    )
  console.warn('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED', getDataTEST_SIGNER_SEED_JSON( ))

  switch (signerName) {
    // TODO: Add more cases for different signers

    default:
      // const TESTkeyPair = mplx_umi.eddsa.createKeypairFromSecretKey(new Uint8Array(TEST_SIGNER_SEED))
      // const TESTkeyPair = mplx_umi.eddsa.createKeypairFromSecretKey( seed )
      // return TESTkeyPair

      // const TEST_SIGNER_SEED = new Uint8Array(
      //   someRandomSecretKey_
      // );
      // const TESTkeyPair = mplx_umi.eddsa.createKeypairFromSecretKey(TEST_SIGNER_SEED);
      const TESTkeyPair = mplx_umi.eddsa.createKeypairFromSecretKey( new Uint8Array(seed) );
      return TESTkeyPair;


  } // switch

} // getKeyPair
*/






// const getDataTEST_SIGNER_SEED = async (/* signerName: string */): Promise<Uint8Array> => {
const getDataTEST_SIGNER_SEED = async(/* signerName: string */): Promise<Uint8Array> => {
  // return new Uint8Array(0);

  //   const TEST_SIGNER_SEED = new Uint8Array(
  //   someRandomSecretKey_
  // );
/* 
  const f = (): Uint8Array => {
    const arr = getDataTEST_SIGNER_SEED_JSON().then((data) => {
      console.debug('mplx.helpers.ts:getDataTEST_SIGNER_SEED: data = ', data)
      console.debug('mplx.helpers.ts:getDataTEST_SIGNER_SEED: data = ', data)
      console.debug('mplx.helpers.ts:getDataTEST_SIGNER_SEED: data = ', data)
      console.debug('mplx.helpers.ts:getDataTEST_SIGNER_SEED: data = ', data)
      console.debug('mplx.helpers.ts:getDataTEST_SIGNER_SEED: data = ', data)
      return new Uint8Array(data as unknown as ArrayBufferLike);
      // return TEST_SIGNER_SEED;
    }).catch((error) => {
      console.error('mplx.helpers.ts:getDataTEST_SIGNER_SEED', error)
      // throw new Error('mplx.helpers.ts:getDataTEST_SIGNER_SEED: error')
      return new Uint8Array([]);
    }).finally(() => {
      console.debug('mplx.helpers.ts:getDataTEST_SIGNER_SEED: finally')
      // return TEST_SIGNER_SEED;
      return new Uint8Array([]);
    })

    return new Uint8Array([]);


  } */
    try {
      const data = await getDataTEST_SIGNER_SEED_JSON();
      return new Uint8Array(data as unknown as ArrayBufferLike);

    } catch (error) {
      console.error('mplx.helpers.ts:getDataTEST_SIGNER_SEED', error)
    }

    return new Uint8Array([]);

  // const TEST_SIGNER_SEED = new Uint8Array(
  //   someRandomSecretKey_
  // );
  // return TEST_SIGNER_SEED;

  // return f();

}



export const getKeyPair = async(signerName: string): Promise<Keypair> => {

  console.warn(`mplx.helpers.ts:getKeyPair: signerName = '${signerName}'`)
  console.warn('mplx.helpers.ts:getKeyPair: TODO')

  // console.warn('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED', TEST_SIGNER_SEED)
  /*
  const TEST_SIGNER_SEED: Uint8Array = getDataTEST_SIGNER_SEED_JSON().then((data) => {
    console.debug('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED: data = ', data)

    console.debug('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED: data.stringify() = ', typeof data)

      // return data
  // debugger
      // JSON.parse( data, { encoding: "utf-8" });
      // const str = JSON.stringify(data)
      // console.debug('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED: str = ', str)
      // const bytes = new TextEncoder().encode(str); // default 'utf-8' or 'utf8'
      // console.debug('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED: bytes = ', bytes)

      // const utf8Decoder = new TextDecoder(); // default 'utf-8' or 'utf8'
      // utf8Decoder.decode(data.stringify());

      // const str = JSON.stringify(data)
      // console.debug('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED: str = ', str)

      // console.debug('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED: str = ', data.stringify()])



      // const xx = JSON.parse(Buffer.from(JSON.stringify(data)).toString('utf-8'))
      // console.debug('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED: xx = ', xx)

      // const xxx = new Uint8Array(xx as ArrayBufferLike)
      // console.debug('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED: xxx = ', xxx)

      const xxxx = new Uint8Array(data as unknown as ArrayBufferLike)
      console.debug('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED: xxxx = ', xxxx)
      // return xxxx

      return new Uint8Array(0);


      // 
      }).catch((error) => {
        console.error('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED', error)
        // throw new Error('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED: error')
        return new Uint8Array(0);
      }
    ).finally(() => {
      console.debug('mplx.helpers.ts:getKeyPair: TEST_SIGNER_SEED: finally')
      return new Uint8Array(0);
    })
*/

  const TEST_SIGNER_SEED_ = await getDataTEST_SIGNER_SEED();
  // console.warn('mplx.helpers.ts:getKeyPair: TEST_SIGNER SEED', TEST_SIGNER_SEED_)

  switch (signerName) {
    // TODO: Add more cases for different signers

    default:
      // const TESTkeyPair = mplx_umi.eddsa.createKeypairFromSecretKey(new Uint8Array(TEST_SIGNER_SEED))
      // const TESTkeyPair = mplx_umi.eddsa.createKeypairFromSecretKey( seed )
      // return TESTkeyPair

      // const TEST_SIGNER_SEED = new Uint8Array(
      //   someRandomSecretKey_
      // );
      const TESTkeyPair = mplx_umi.eddsa.createKeypairFromSecretKey(TEST_SIGNER_SEED_);

      // const TESTkeyPair = mplx_umi.eddsa.createKeypairFromSecretKey( new Uint8Array(seed) );
      return TESTkeyPair;


  } // switch

} // getKeyPair