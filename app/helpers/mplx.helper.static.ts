import {
  mplCandyMachine as mplCoreCandyMachine,
} from "@metaplex-foundation/mpl-core-candy-machine";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { PublicKey as soljsweb3PublicKey } from '@solana/web3.js'
import { LOW_CREATOR_BALANCE, LOW_CREATOR_BALANCE_SOL, MINIMUM_CREATOR_BALANCE, MINIMUM_CREATOR_BALANCE_SOL } from "@consts/mtplx";
import { RPC_URL } from '@helpers/solana.helper';
import {
  MPL_F_createCollectionV1,
  MPL_F_createSignerFromKeypair,
  MPL_F_generateSigner,
  MPL_F_isSigner,
  MPL_F_publicKey,
  MPL_F_sol, MPL_Keypair,
  MPL_P_KeypairIdentity,
  MPL_P_walletAdapterIdentity,
  MPL_P_walletAdapterPayer,
  MPL_T_PublicKey,
  MPL_T_SolAmount, MPL_T_Umi, MPL_T_WalletAdapter,
  MPL_TX_BUILDR_OPTIONS,
} from '@imports/mtplx.imports';
import {
  mplhelp_T_AirdropResult,
  mplhelp_T_CreateCollectionResult,
} from "types";

const filePath = "app/helpers/mplx.helpers.ts"

// ------------------------------------------------------------


const mplx_umi: MPL_T_Umi = createUmi(RPC_URL).use(mplCoreCandyMachine());
if (!mplx_umi) {
  throw new Error('mplx_umi not found')
}

export const getUmi = (): MPL_T_Umi => {
  const LOGPREFIX = `${filePath}:getUmi: `
  console.debug(`${LOGPREFIX}()`)
  return mplx_umi
} // getUmi

// ------------------------------------------------------------

export const getMplKeypair_fromEnv = (signerName: string): MPL_Keypair | null => {
  const LOGPREFIX = `${filePath}:getMplKeypair_fromEnv: `
  try {
    console.debug(`${LOGPREFIX} signerName = '${signerName}'`)
    if (!signerName) {
      console.warn(`${LOGPREFIX} signerName not provided`)
      console.warn(`${LOGPREFIX} using "MINT_APP_DEFAULT_KEYPAIR"`)
    }
    const SIGNER_SEED_TEXT_from_env = (!signerName ? process.env.MINT_APP_DEFAULT_KEYPAIR || '' : process.env[signerName as string] || '')
    if (!SIGNER_SEED_TEXT_from_env) {
      console.error(`${LOGPREFIX} SIGNER_SEED_TEXT_from_env not found`)
      return null
    }
    const jsonSEED = JSON.parse(SIGNER_SEED_TEXT_from_env)
    const buf = Buffer.from(jsonSEED as string, 'utf8')
    // console.debug('${LOGPREFIX} buf', buf)
    const SIGNER_SEED: Uint8Array = Uint8Array.from(buf)
    // console.debug('${LOGPREFIX} SIGNER_SEED', SIGNER_SEED)
    const keyPair: MPL_Keypair = mplx_umi.eddsa.createKeypairFromSecretKey(SIGNER_SEED);
    // const keyPairPublicKeySTR = keyPair.publicKey.toString()
    // console.debug('${LOGPREFIX} keyPairPublicKeySTR', keyPairPublicKeySTR)
    return keyPair;
  } catch (error) {
    console.error(`${LOGPREFIX} error`, error)
    //   const response: ResponseData = { success: false, error: '' };
    if (error instanceof Error) {
      console.error(`error ${error}`)
      // response.error = error.message
    } else {
      // response.error = 'Error'
      console.error(`error ${error}`)
    }
  } // catch
  return null
} // getMplKeypair_fromEnv

// ------------------------------------------------------------

// https://developers.metaplex.com/umi/public-keys-and-signers
// Umi interface stores two instances of Signer:
// - identity using the app and payer paying for transaction
// - payer paying for transaction

// Umi provides plugins to quickly assign new signers to these attributes.
// The signerIdentity and signerPayer plugins are available for this purpose.


// umi.use(signerIdentity(mySigner));
// // Is equivalent to:
// umi.identity = mySigner;
// umi.payer = mySigner;

// umi.use(signerIdentity(mySigner, false));
// // Is equivalent to:
// umi.identity = mySigner;

// umi.use(signerPayer(mySigner));
// // Is equivalent to:
// umi.payer = mySigner;

// Set identity & payer with the same signer: creator_Signer

// umi.use(MPL_P_KeypairIdentity(creator_Signer));

// umi = umi.use(walletAdapterIdentity(wallet));

// ------------------------------------------------------------

export async function createSponsoredCollection(
): Promise<mplhelp_T_CreateCollectionResult> {
  const LOGPREFIX = `${filePath}:createSponsoredCollection: `
  try {
    const umi = mplx_umi
    const APP_1_KEYPAIR_SIGNER = 'MINT_APP_01_KEYPAIR'
    const creator_keyPair: MPL_Keypair | null = getMplKeypair_fromEnv(APP_1_KEYPAIR_SIGNER)
    if (!creator_keyPair) {
      console.error(`${LOGPREFIX} creator_keyPair (${APP_1_KEYPAIR_SIGNER}) Not Found`)
      const collectionResultError: mplhelp_T_CreateCollectionResult = {
        success: false,
        error: ''
      }
      return collectionResultError
    }
    const creator_Signer = MPL_F_createSignerFromKeypair(umi, creator_keyPair)
    // Check if creator_Signer is a signer
    // if (!MPL_F_isSigner(creator_Signer)) {
    //   console.error(`${LOGPREFIX}❌ ${creator_Signer} is not a signer`)
    //   const collectionResultError:mplhelp_T_CreateCollectionResult = {
    //     success: false,
    //     error: `Error creating collection: not a signer`
    //   }
    //   return collectionResultError
    // }

    // Set identity & payer with the same signer: creator_Signer
    umi.use(MPL_P_KeypairIdentity(creator_Signer));

    const res = await createCollection(/* creator_Signer, */ umi)
    console.debug(`${LOGPREFIX} createCollection result`, res)
    return res

  } catch (error) {
    console.error(`${LOGPREFIX} `, error)

    // const response: ResponseData = { success: false, error: '' };
    const collectionResultError: mplhelp_T_CreateCollectionResult = {
      success: false,
      error: ''
    }
    if (error instanceof Error) {
      console.error(`${LOGPREFIX} `, error)
      collectionResultError.error = error.message
    } else {
      collectionResultError.error = 'Error'
    }
    return collectionResultError
  } // catch
} // createCollection

// ------------------------------------------------------------

export async function createMyCollection(
  walletAdapter: MPL_T_WalletAdapter,
  // umi:MPL_T_Umi,
): Promise<mplhelp_T_CreateCollectionResult> {
  const LOGPREFIX = `${filePath}:createMyCollection: `
  try {
    const umi = mplx_umi
    // Set identity
    umi.use(MPL_P_walletAdapterIdentity(walletAdapter));
    // Set payer
    umi.use(MPL_P_walletAdapterPayer(walletAdapter));

    // Check if walletAdapter is a valid signer
    if (!MPL_F_isSigner(umi.identity)) {
      console.error(`${LOGPREFIX}❌ wallet ${walletAdapter.publicKey} is not a valid signer`)
      const collectionResultError: mplhelp_T_CreateCollectionResult = {
        success: false,
        error: `Error creating collection: wallet is not a signer`
      }
      return collectionResultError
    }

    // Create a NEW collection

    const res = await createCollection(/* creator_Signer, */ umi)
    console.debug(`${LOGPREFIX} createCollection result`, res)
    return res

    // const createCollectionResultSuccess:mplhelp_T_CreateCollectionResult = {
    //   success: true,
    //   address: "xxxxxxxxxxxxx" }
    // return createCollectionResultSuccess


  } catch (error) {
    console.error(`${LOGPREFIX}`, error)

    const collectionResult: mplhelp_T_CreateCollectionResult = {
      success: false,
      error: ''
    }

    if (error instanceof Error) {
      console.log('error', error)
      collectionResult.error = error.message
    } else {
      collectionResult.error = 'Error'
    }
    return collectionResult
  } // catch
} // createMyCollection




export async function createCollection(
  // creator_Signer: MPL_T_KeypairSigner,
  umi: MPL_T_Umi,
): Promise<mplhelp_T_CreateCollectionResult> {
  const LOGPREFIX = `${filePath}:createCollection: `
  try {
    // // Check if creator_Signer is a signer
    // if (!MPL_F_isSigner(creator_Signer)) {
    //   console.error(`${LOGPREFIX}❌ ${creator_Signer} is not a signer`)
    //   const collectionResultError:mplhelp_T_CreateCollectionResult = {
    //     success: false,
    //     error: `Error creating collection: not a signer`
    //   }
    //   return collectionResultError
    // }

    // const collectionSigner = generateSigner(umi)
    const collection_Signer = MPL_F_generateSigner(umi) // NEW random signer

    console.log(`Account information:`)
    console.table({
      umi_payer: umi.payer,
      umi_identity: umi.identity,
    });

    // Check balance(s)
    // const payerBalance:MPL_T_SolAmount = await umi.rpc.getBalance(creator_Signer.publicKey);
    const payerBalance: MPL_T_SolAmount = await umi.rpc.getBalance(umi.payer.publicKey);

    // console.debug(`${LOGPREFIX}Creator balance `, balance);

    if (payerBalance.basisPoints < LOW_CREATOR_BALANCE_SOL.basisPoints) {
      console.warn(`${LOGPREFIX}⚠️  Low (less than ${LOW_CREATOR_BALANCE} SOL) balance  : ${Number(payerBalance.basisPoints) / (10 ** payerBalance.decimals)} SOL`);
    }

    if (payerBalance.basisPoints < MINIMUM_CREATOR_BALANCE_SOL.basisPoints) {
      console.error(`${LOGPREFIX}❌ Insufficient (less than ${MINIMUM_CREATOR_BALANCE} SOL) balance : ${Number(payerBalance.basisPoints) / (10 ** payerBalance.decimals)} SOL`);
      const collectionResultError: mplhelp_T_CreateCollectionResult = {
        success: false,
        error: `Error creating collection: Insufficient (less than ${MINIMUM_CREATOR_BALANCE} SOL) balance : ${Number(payerBalance.basisPoints) / (10 ** payerBalance.decimals)} SOL`
      }
      return collectionResultError
    }

    console.log(`Account information:`)
    console.table({
      // creator_Signer: creator_Signer.publicKey.toString(),
      creator: umi.identity.publicKey.toString(),
      payer: umi.payer.publicKey.toString(),
      collection: collection_Signer.publicKey.toString(),
    });

    // Create a NEW collection
    try {
      await MPL_F_createCollectionV1(umi, {
        collection: collection_Signer, // address of the new collection
        name: 'My Collection',
        uri: 'https://example.com/my-collection.json',
        // plugins: []
        // updateAuthority: creator_Signer.publicKey,

      }).sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
      console.log(`✅ - Created collection: ${collection_Signer.publicKey.toString()}`)

      const createCollectionResultSuccess: mplhelp_T_CreateCollectionResult = {
        success: true,
        address: collection_Signer.publicKey.toString()
      }
      return createCollectionResultSuccess

    } catch (error) {
      console.error('❌ - Error creating collection.');

      const collectionResultError: mplhelp_T_CreateCollectionResult = {
        success: false,
        error: ''
      }

      if (error instanceof Error) {
        console.error(`${LOGPREFIX}`, error)
        collectionResultError.error = error.message
      } else {
        collectionResultError.error = 'Error'
      }
      return collectionResultError
    } // catch


  } catch (error) {
    console.error(`${LOGPREFIX}`, error)

    // const response: ResponseData = { success: false, error: '' };
    const collectionResult: mplhelp_T_CreateCollectionResult = {
      success: false,
      error: ''
    }
    if (error instanceof Error) {
      console.log('error', error)
      collectionResult.error = error.message
    } else {
      collectionResult.error = 'Error'
    }
    return collectionResult
  } // catch
} // createCollection

// ------------------------------------------------------------
