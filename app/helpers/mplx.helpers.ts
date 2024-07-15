import {
  mplCandyMachine as mplCoreCandyMachine,
} from "@metaplex-foundation/mpl-core-candy-machine";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {PublicKey as soljsweb3PublicKey} from '@solana/web3.js'
import { MPL_f_createCollectionV1,
  MPL_f_createSignerFromKeypair,
  MPL_f_generateSigner,
  MPL_f_isSigner,
  MPL_f_publicKey,
  MPL_f_sol, MPL_Keypair,
  MPL_P_KeypairIdentity,
  MPL_P_walletAdapterIdentity,
  MPL_P_walletAdapterPayer,
  // MPL_T_KeypairSigner,
  MPL_T_PublicKey,
  MPL_T_SolAmount,  MPL_T_Umi, MPL_T_WalletAdapter,
  MPL_TX_BUILDR_OPTIONS,
} from '@helpers/mtplx';
import { RPC_URL } from '@helpers/solana.helper';
import { mplhelp_T_AirdropResult, mplhelp_T_CreateCollectionResult, mplhelp_T_CreateNftCollectionResult } from "types";

const filePath = "app/helpers/mplx.helpers.ts"

// --------------------------------------------------

const mplx_umi:MPL_T_Umi = createUmi(RPC_URL).use(mplCoreCandyMachine());
if (!mplx_umi) {
  throw new Error('mplx_umi not found')
}

export const getUmi = ():MPL_T_Umi => {
    return mplx_umi
} // getUmi

// --------------------------------------------------

export const getMplKeypair_fromENV = (signerName: string): MPL_Keypair|null => {
  try {
    console.debug(`mplx.helpers.ts:getMplKeypair_fromENV: signerName = '${signerName}'`)
    if (!signerName) {
      console.warn('mplx.helpers.ts:getMplKeypair_fromENV: signerName not provided')
      console.warn('mplx.helpers.ts:getMplKeypair_fromENV: using "MINT_APP_DEFAULT_KEYPAIR"')
    }
    const SIGNER_SEED_TEXT_from_env = ( !signerName ? process.env.MINT_APP_DEFAULT_KEYPAIR || '' : process.env[signerName as string] || '')
    if (!SIGNER_SEED_TEXT_from_env) {
      console.error('app/pages/api/collection-creation-test.ts: SIGNER_SEED_TEXT_from_env', 'Not Found')
      return null
    }
    const jsonSEED = JSON.parse( SIGNER_SEED_TEXT_from_env)
    const buf = Buffer.from( jsonSEED  as string, 'utf8')
    // console.debug('mplx.helpers.ts:getMplKeypair_fromENV: buf', buf)
    const SIGNER_SEED:Uint8Array = Uint8Array.from(buf)
    // console.debug('mplx.helpers.ts:getMplKeypair_fromENV: SIGNER_SEED', SIGNER_SEED)
    const keyPair:MPL_Keypair = mplx_umi.eddsa.createKeypairFromSecretKey(SIGNER_SEED);
    // const keyPairPublicKeySTR = keyPair.publicKey.toString()
    // console.debug('mplx.helpers.ts:getMplKeypair_fromENV: keyPairPublicKeySTR', keyPairPublicKeySTR)
    return keyPair;
  } catch (error) {
    console.error('mplx.helpers.ts:getMplKeypair_fromENV: error', error)
  //   const response: ResponseData = { success: false, error: '' };
    if (error instanceof Error) {
      console.error('error', error)
      // response.error = error.message
    } else {
      // response.error = 'Error'
      console.error('error', error)
    }
  } // catch
    return null
} // getMplKeypair_fromENV

// --------------------------------------------------

const AIRDROP_DEFAULT_AMOUNT = 1

export const airdrop = async (
  _publicKeyString: string,
  _amount:number=AIRDROP_DEFAULT_AMOUNT
): Promise<mplhelp_T_AirdropResult> => {
  try {
    console.debug(`mplx.helpers.ts:airdrop: publicKey = '${_publicKeyString}'`)
    if (!_publicKeyString) {
      console.error('mplx.helpers.ts:getMplKeypair_fromENV: _publicKeyString not provided')
      // throw new Error('Public key not provided')
      return { success: false, error: 'Public key not provided' }
    }
    // check address validity
    const isValid = soljsweb3PublicKey.isOnCurve(new soljsweb3PublicKey(_publicKeyString))
    if (!isValid) {
      // throw new Error('Invalid public key')
      return { success: false, error: 'Invalid public key' }
    }
    // const pubK:MPL_T_PublicKey = new soljsweb3PublicKey(_publicKeyString)
    const mpl_publicKey:MPL_T_PublicKey = MPL_f_publicKey(_publicKeyString)

    try {
      const umi = getUmi()
      await umi.rpc.airdrop(mpl_publicKey, MPL_f_sol(_amount), MPL_TX_BUILDR_OPTIONS.confirm);
      console.log(`✅ - Airdropped ${_amount} SOL to the ${mpl_publicKey}`)
      const airdropResult:mplhelp_T_AirdropResult = { success: true, amount: _amount }
      return airdropResult
      } catch (error) {
        console.log(`❌ - Error airdropping SOL to ${mpl_publicKey}`);
        // throw new Error('Error airdropping SOL')

        const airdropResult:mplhelp_T_AirdropResult = { success: false, error: '' };
        if (error instanceof Error) {
          console.log('error', error)
          airdropResult.error = `Error airdropping SOL to ${mpl_publicKey} : ${error.message}`
        } else {
          // response.error = 'Error'
          airdropResult.error = `Error airdropping SOL to ${mpl_publicKey}`
        }
        // res.status(200).json({ success: false, error: `Error airdropping SOL to ${_publicKey}` })
        // res.status(200).json(response)
        return airdropResult
    }
  
  } catch (error) {
    const airdropResult:mplhelp_T_AirdropResult = { success: false, error: '' };
    if (error instanceof Error) {
      console.error('mplx.helpers.ts:airdrop: error', error)
      airdropResult.error = error.message
    } else {
      console.error('mplx.helpers.ts:airdrop: error', error)
      airdropResult.error = `${error}`
    }
    return airdropResult
  } // catch

} // getMplKeypair_fromENV


// --------------------------------------------------

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

    // --------------------------------------------------

export async function createSponsoredCollection(
): Promise<mplhelp_T_CreateCollectionResult> {
  const LOGPREFIX = `${filePath}:createSponsoredCollection: `
  try {

    const umi = mplx_umi

    const APP_1_KEYPAIR_SIGNER = 'MINT_APP_01_KEYPAIR'
    const creator_keyPair:MPL_Keypair|null = getMplKeypair_fromENV(APP_1_KEYPAIR_SIGNER)
    if (!creator_keyPair) {
      console.error(`${LOGPREFIX} creator_keyPair (${APP_1_KEYPAIR_SIGNER}) Not Found`)
      const collectionResultError:mplhelp_T_CreateCollectionResult = {
        success: false,
        error: ''
      }
      return collectionResultError
    }

    const creator_Signer = MPL_f_createSignerFromKeypair( umi, creator_keyPair )

    // Check if creator_Signer is a signer
    // if (!MPL_f_isSigner(creator_Signer)) {
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
    console.error(`${LOGPREFIX}`, error)

    // const response: ResponseData = { success: false, error: '' };
    const collectionResultError:mplhelp_T_CreateCollectionResult = {
      success: false,
      error: ''
    }
    if (error instanceof Error) {
      console.log('error', error)
      collectionResultError.error = error.message
    } else {
      collectionResultError.error = 'Error'
    }
    return collectionResultError
  } // catch
} // createCollection


// --------------------------------------------------

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
    if (!MPL_f_isSigner(umi.identity)) {
      console.error(`${LOGPREFIX}❌ wallet ${walletAdapter.publicKey} is not a valid signer`)
      const collectionResultError:mplhelp_T_CreateCollectionResult = {
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

    const collectionResult:mplhelp_T_CreateCollectionResult = {
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
  umi:MPL_T_Umi,
): Promise<mplhelp_T_CreateCollectionResult> {
  const LOGPREFIX = `${filePath}:createCollection: `
  try {
    // // Check if creator_Signer is a signer
    // if (!MPL_f_isSigner(creator_Signer)) {
    //   console.error(`${LOGPREFIX}❌ ${creator_Signer} is not a signer`)
    //   const collectionResultError:mplhelp_T_CreateCollectionResult = {
    //     success: false,
    //     error: `Error creating collection: not a signer`
    //   }
    //   return collectionResultError
    // }

    // const collectionSigner = generateSigner(umi)
    const collection_Signer = MPL_f_generateSigner(umi) // NEW random signer

    console.log(`Account information:`)
    console.table({
      umi_payer: umi.payer,
      umi_identity: umi.identity,
    });

    // Check balance(s)
    const MINIMUM_CREATOR_BALANCE = 1 // 1 SOL
    const LOW_CREATOR_BALANCE = 10 // 10 SOL
    const MINIMUM_CREATOR_BALANCE_SOL = MPL_f_sol(MINIMUM_CREATOR_BALANCE)
    const LOW_CREATOR_BALANCE_SOL = MPL_f_sol(LOW_CREATOR_BALANCE)
    // const payerBalance:MPL_T_SolAmount = await umi.rpc.getBalance(creator_Signer.publicKey);
    const payerBalance:MPL_T_SolAmount = await umi.rpc.getBalance(umi.payer.publicKey);

    // console.debug(`${LOGPREFIX}Creator balance `, balance);

    if (payerBalance.basisPoints < LOW_CREATOR_BALANCE_SOL.basisPoints) {
      console.warn(`${LOGPREFIX}⚠️  Low (less than ${LOW_CREATOR_BALANCE} SOL) balance  : ${Number(payerBalance.basisPoints)/(10**payerBalance.decimals)} SOL`);
    }
    if (payerBalance.basisPoints < MINIMUM_CREATOR_BALANCE_SOL.basisPoints) {
      console.error(`${LOGPREFIX}❌ Insufficient (less than ${MINIMUM_CREATOR_BALANCE} SOL) balance : ${Number(payerBalance.basisPoints)/(10**payerBalance.decimals)} SOL`);
      const collectionResultError:mplhelp_T_CreateCollectionResult = {
        success: false,
        error: `Error creating collection: Insufficient (less than ${MINIMUM_CREATOR_BALANCE} SOL) balance : ${Number(payerBalance.basisPoints)/(10**payerBalance.decimals)} SOL`
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
      await MPL_f_createCollectionV1(umi, {
        collection: collection_Signer, // address of the new collection
          name: 'My Collection',
          uri: 'https://example.com/my-collection.json',
          // plugins: []
          // updateAuthority: creator_Signer.publicKey,

      }).sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
      console.log(`✅ - Created collection: ${collection_Signer.publicKey.toString()}`)

      const createCollectionResultSuccess:mplhelp_T_CreateCollectionResult = {
        success: true,
        address: collection_Signer.publicKey.toString() }
      return createCollectionResultSuccess

    } catch (error) {
      console.error('❌ - Error creating collection.');

      const collectionResultError:mplhelp_T_CreateCollectionResult = {
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
    const collectionResult:mplhelp_T_CreateCollectionResult = {
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

// --------------------------------------------------


export async function createMyFullNftCollection(
  walletAdapter: MPL_T_WalletAdapter,
  // umi:MPL_T_Umi,
): Promise<mplhelp_T_CreateNftCollectionResult> {
  const LOGPREFIX = `${filePath}:createFullNftCollection: `
  try {

    const umi = mplx_umi
    // Set identity
    umi.use(MPL_P_walletAdapterIdentity(walletAdapter));
    // Set payer
    umi.use(MPL_P_walletAdapterPayer(walletAdapter));

    // Check if walletAdapter is a valid signer
    if (!MPL_f_isSigner(umi.identity)) {
      console.error(`${LOGPREFIX}❌ wallet ${walletAdapter.publicKey} is not a valid signer`)
      const collectionResultError:mplhelp_T_CreateCollectionResult = {
        success: false,
        error: `Error creating collection: wallet is not a signer`
      }
      return collectionResultError
    }

    // TODO
    // TODO
    // TODO
    // TODO
    // TODO
    // TODO

    const collectionResult:mplhelp_T_CreateNftCollectionResult = {
      success: true,
      collectionAddress: '',
      candyMachineAddress: '',
    }
    console.debug(`${LOGPREFIX} collectionResult`, collectionResult)
    return collectionResult

  } catch (error) {
    console.error(`${LOGPREFIX}`, error)

    // const response: ResponseData = { success: false, error: '' };
    const collectionResult:mplhelp_T_CreateNftCollectionResult = {
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
} // createNftCollection
