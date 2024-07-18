import {
  mplCandyMachine as mplCoreCandyMachine,
} from "@metaplex-foundation/mpl-core-candy-machine";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { PublicKey as soljsweb3PublicKey } from '@solana/web3.js'
import { AIRDROP_DEFAULT_AMOUNT } from "@consts/commons";
import { MINIMUM_CREATOR_BALANCE, MINIMUM_CREATOR_BALANCE_SOL, NFT_NAME_PREFIX_MAX_LENGTH } from "@consts/mtplx";
import { RPC_URL } from '@helpers/solana.helper';
import {
  MPL_F_addConfigLines,
  MPL_F_create,
  MPL_F_createCollectionV1,
  MPL_F_createSignerFromKeypair,
  MPL_F_fetchCandyMachine, MPL_F_generateSigner,
  MPL_F_isSigner,
  MPL_F_none,
  MPL_F_publicKey,
  MPL_F_sol,
  MPL_F_some, MPL_Keypair, MPL_P_KeypairIdentity, 
  MPL_P_walletAdapterIdentity,
  MPL_P_walletAdapterPayer,
  MPL_T_GuardSetArgs,
  MPL_T_PublicKey,
  MPL_T_SolAmount,
  MPL_T_Umi,
  MPL_T_WalletAdapter,
  MPL_TX_BUILDR_OPTIONS,
  // MPL_F_deleteCandyMachine,
} from '@imports/mtplx.imports';
import { mplhelp_T_AirdropResult, mplhelp_T_CreateCmNftCollection_fromApp_Input, mplhelp_T_CreateCmNftCollection_fromWallet_Input, mplhelp_T_CreateCmNftCollection_Input, mplhelp_T_CreateCmNftCollection_Result, mplhelp_T_CreateCMNftCollectionResult,
  mplhelp_T_CreateCollectionResult, 
  mplhelp_T_CreateCompleteNftCollectionCmConfig_Input, 
  mplhelp_T_CreateCompleteNftCollectionCmConfig_Result, 
  mplhelp_T_CreateNftCollection_fromApp_Input,
  mplhelp_T_CreateNftCollection_fromWallet_Input, mplhelp_T_CreateNftCollection_Input, mplhelp_T_CreateNftCollection_Result,
  mplhelp_T_FinalizeCmNftCollectionConfig,
  mplhelp_T_FinalizeCmNftCollectionConfig_fromApp_Input,
  mplhelp_T_FinalizeCmNftCollectionConfig_fromWallet_Input,
  mplhelp_T_FinalizeCmNftCollectionConfig_Result,
  mplhelp_T_MintNftCMResult
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

export const getMplKeypair_fromENV = (signerName: string): MPL_Keypair | null => {
  const LOGPREFIX = `${filePath}:getMplKeypair_fromENV: `
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
} // getMplKeypair_fromENV

// ------------------------------------------------------------

interface ExpectedCandyMachineState {
  itemsLoaded: number;
  itemsRedeemed: number;
  authority: MPL_T_PublicKey;
  collection: MPL_T_PublicKey;
}

async function checkCandyMachine(
  umi: MPL_T_Umi,
  candyMachine: MPL_T_PublicKey,
  expectedCandyMachineState: ExpectedCandyMachineState,
  // step?: number
) {
  const LOGPREFIX = `${filePath}:checkCandyMachine: `
  try {
    const loadedCandyMachine = await MPL_F_fetchCandyMachine(umi, candyMachine, MPL_TX_BUILDR_OPTIONS.confirm);
    const { itemsLoaded, itemsRedeemed, authority, collection } = expectedCandyMachineState;
    if (Number(loadedCandyMachine.itemsRedeemed) !== itemsRedeemed) {
      throw new Error(`${LOGPREFIX} Incorrect number of items available in the Candy Machine.`);
    }
    if (loadedCandyMachine.itemsLoaded !== itemsLoaded) {
      throw new Error(`${LOGPREFIX} Incorrect number of items loaded in the Candy Machine.`);
    }
    if (loadedCandyMachine.authority.toString() !== authority.toString()) {
      throw new Error(`${LOGPREFIX} Incorrect authority in the Candy Machine.`);
    }
    if (loadedCandyMachine.collectionMint.toString() !== collection.toString()) {
      throw new Error(`${LOGPREFIX} Incorrect collection in the Candy Machine.`);
    }
    // step && console.log(`${step}. ✅ - Candy Machine has the correct configuration.`);
    console.log(`${LOGPREFIX} ✅  Candy Machine has the correct configuration.`);
  } catch (error) {
    if (error instanceof Error) {
      // step && console.log(`${step}. ❌ - Candy Machine incorrect configuration: ${error.message}`);
      console.log(`${LOGPREFIX} ❌ Candy Machine incorrect configuration: ${error.message}`);
    } else {
      // step && console.log(`${step}. ❌ - Error fetching the Candy Machine.`);
      console.log(`${LOGPREFIX} ❌ Error fetching the Candy Machine.`);
    }
  }
} // checkCandyMachine

// ------------------------------------------------------------

export const airdrop = async (
  _publicKeyString: string,
  _amount: number = AIRDROP_DEFAULT_AMOUNT
): Promise<mplhelp_T_AirdropResult> => {
  const LOGPREFIX = `${filePath}:airdrop: `
  try {
    console.debug(`${LOGPREFIX} publicKey = '${_publicKeyString}'`)
    if (!_publicKeyString) {
      console.error(`${LOGPREFIX}  _publicKeyString not provided`)
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
    const mpl_publicKey: MPL_T_PublicKey = MPL_F_publicKey(_publicKeyString)

    try {
      const umi = getUmi()
      await umi.rpc.airdrop(mpl_publicKey, MPL_F_sol(_amount), MPL_TX_BUILDR_OPTIONS.confirm);
      console.log(`${LOGPREFIX} ✅ Airdropped ${_amount} SOL to the ${mpl_publicKey}`)
      const airdropResult: mplhelp_T_AirdropResult = { success: true, amount: _amount }
      return airdropResult
    } catch (error) {
      console.log(`${LOGPREFIX} ❌ Error airdropping SOL to ${mpl_publicKey}`);
      // throw new Error('Error airdropping SOL')

      const airdropResult: mplhelp_T_AirdropResult = { success: false, error: '' };
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
    const airdropResult: mplhelp_T_AirdropResult = { success: false, error: '' };
    if (error instanceof Error) {
      console.error(`${LOGPREFIX} error ${error}`)
      airdropResult.error = error.message
    } else {
      console.error(`${LOGPREFIX} error ${error}`)
      airdropResult.error = `${error}`
    }
    return airdropResult
  } // catch

} // airdrop


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

/**
 * 
 * @param _walletAdapter 
 * @returns 
 */
export async function setIdentityPayer_WalletAdapter(
  _walletAdapter: MPL_T_WalletAdapter,
  _umi: MPL_T_Umi,
  _checkSigner = false
): Promise<boolean>
{
  const LOGPREFIX = `${filePath}:setIdentityPayer_WalletAdapter: `
  try {
    if (!_walletAdapter) {
      console.error(`${LOGPREFIX} _walletAdapter not provided`)
      return false
    }
    // Check if walletAdapter is a valid signer
    // Set identity (Minter) & payer with the same signer: _walletAdapter
    _umi.use(MPL_P_walletAdapterIdentity(_walletAdapter)); // Set identity
    _umi.use(MPL_P_walletAdapterPayer(_walletAdapter)); // Set payer

    if (_checkSigner && !MPL_F_isSigner(_umi.identity)) {
      console.error(`${LOGPREFIX}❌ wallet ${_walletAdapter.publicKey} is not a valid signer`)
      return false
    }

    return true
  } catch (error) {
    console.error(`${LOGPREFIX}`, error)
    return false
  }
} // setIdentityPayer_WalletAdapter

// --------------------------

export async function setIdentityPayer_APP(
  _umi: MPL_T_Umi,
  _checkSigner = false
): Promise<boolean>
{
  const LOGPREFIX = `${filePath}:setIdentityPayer_APP: `
  try {
    const APP_1_KEYPAIR_SIGNER = 'MINT_APP_01_KEYPAIR'
    const creator_keyPair: MPL_Keypair | null = getMplKeypair_fromENV(APP_1_KEYPAIR_SIGNER)
    if (!creator_keyPair) {
      return false
    }
    const APP_Signer = MPL_F_createSignerFromKeypair(_umi, creator_keyPair)
    // Set identity & payer with the same signer: APP_Signer
    _umi.use(MPL_P_KeypairIdentity(APP_Signer));

    if (_checkSigner && !MPL_F_isSigner(_umi.identity)) {
      console.error(`${LOGPREFIX}❌ wallet ${_umi.identity} is not a valid signer`)
      return false
    }

    return true
  } catch (error) {
    console.error(`${LOGPREFIX}`, error)
    return false
  }
} // setIdentityPayer_APP

// ------------------------------------------------------------

export async function checkBalance(minAmount: MPL_T_SolAmount, _publicKey: MPL_T_PublicKey|undefined) :
  // Promise<mplhelp_T_CheckBalanceResult>
Promise<boolean>
{
  const LOGPREFIX = `${filePath}:checkBalance: `
  try {
    const umi = mplx_umi
    const publicKey = _publicKey || umi.payer.publicKey
    if (!publicKey) {
      console.error(`${LOGPREFIX} publicKey not provided`)
      // return { success: false, error: {missingPublicKey: true} }
      return false
    }
    const balance:MPL_T_SolAmount = await umi.rpc.getBalance(publicKey);
    console.debug(`${LOGPREFIX} balance `, balance);
    if (balance.basisPoints < minAmount.basisPoints) {
      console.warn(`${LOGPREFIX}❌ Insufficient balance : ${Number(balance.basisPoints) / (10 ** balance.decimals)} SOL`);
      return false
      // return { success: false, error: {missingPublicKey: false, minBalance: true} 
    }
    return true
  } catch (error) {
    console.error(`${LOGPREFIX}`, error)
    return false
  }
} // checkBalance

// ------------------------------------------------------------


/**
 * Create an entire NFT Collection
 * Called from APP (SPONSORED)
 * @param param0
 * @returns 
 */
export async function createCompleteNftCollectionCm_fromApp(
  {
    collectionName,
    collectionUri,
    nftNamePrefix,
    itemsCount,
    metadataPrefixUri,
    startDateTime,
    endDateTime,

  } : mplhelp_T_CreateCompleteNftCollectionCmConfig_Input
  ): Promise<mplhelp_T_CreateCompleteNftCollectionCmConfig_Result>
  {
    const LOGPREFIX = `${filePath}:createCompletNftCollectionCm_fromApp: `
    try {
      const umi = mplx_umi
      // Payer / Minter = APP
      setIdentityPayer_APP(umi)

      const createNftCollectionResult: mplhelp_T_CreateNftCollection_Result = await createNftCollection({
        collectionName,
        collectionUri,
        umi
      })
      if (createNftCollectionResult.success === true) {
        const createCmNftCollectionResult:mplhelp_T_CreateCmNftCollection_Result = await createCmNftCollection({
          collectionSigner: createNftCollectionResult.collectionSigner,
          nftNamePrefix,
          itemsCount,
          metadataPrefixUri,
          startDateTime,
          endDateTime,
          umi
        })
        if (createCmNftCollectionResult.success === true) {
          const finalizeCmNftCollectionConfigResult: mplhelp_T_FinalizeCmNftCollectionConfig_Result = await finalizeCmNftCollectionConfig({
            itemsCount,
            collectionSigner: createNftCollectionResult.collectionSigner,
            candyMachineSigner: createCmNftCollectionResult.candyMachineSigner,
            umi
          })
          return finalizeCmNftCollectionConfigResult
        }
      }

      const completeNftCollectionCmConfigResult: mplhelp_T_CreateCompleteNftCollectionCmConfig_Result = {
        success: false,
        error: 'Global Error'
      }
      return completeNftCollectionCmConfigResult

    } catch (error) {
      console.error(`${LOGPREFIX}`, error)
      const completeNftCollectionCmConfigResult: mplhelp_T_CreateCompleteNftCollectionCmConfig_Result = {
        success: false,
        error: 'Global Error'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      completeNftCollectionCmConfigResult.error += ` ${errorString}`
      console.error(`${LOGPREFIX} error: ${errorString}`)
      return completeNftCollectionCmConfigResult
    }

  } // createCompletNftCollectionCm_fromApp

// ------------------------------------------------------------


/**
 * Create (ONLY) an NFT Collection
 * Called from APP (SPONSORED)
 * @param param0
 * @returns 
 */
export async function createNftCollection_fromApp(
  {
    collectionName,
    collectionUri,
  } : mplhelp_T_CreateNftCollection_fromApp_Input
  ): Promise<mplhelp_T_CreateNftCollection_Result>
  {
    const LOGPREFIX = `${filePath}:createNftCollection_fromApp: `
    try {
      const umi = mplx_umi
      // Payer / Minter = APP
      setIdentityPayer_APP(umi)
      return await createNftCollection({
        collectionName,
        collectionUri,
        umi
      })
    } catch (error) {
      console.error(`${LOGPREFIX}`, error)
      const finalizeCmNftCollectionConfigResult: mplhelp_T_FinalizeCmNftCollectionConfig_Result = {
        success: false,
        error: 'Global Error'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      finalizeCmNftCollectionConfigResult.error += ` ${errorString}`
      console.error(`${LOGPREFIX} error: ${errorString}`)
      return finalizeCmNftCollectionConfigResult
    }

  } // createNftCollection_fromApp


/**
 * Create (ONLY) an NFT Collection
 * Called from Wallet
 * @param param0
 * @returns 
 */
export async function createNftCollection_fromWallet(
  {
    walletAdapter,
    collectionName,
    collectionUri,
  } : mplhelp_T_CreateNftCollection_fromWallet_Input
  ): Promise<mplhelp_T_CreateNftCollection_Result>
  {
    const LOGPREFIX = `${filePath}:createNftCollection_fromWallet: `
    try {
      const umi = mplx_umi
      // Payer / Minter = Wallet
      setIdentityPayer_WalletAdapter(walletAdapter, umi, true)
      return await createNftCollection({
        collectionName,
        collectionUri,
        umi
      })
    } catch (error) {
      console.error(`${LOGPREFIX}`, error)
      const finalizeCmNftCollectionConfigResult: mplhelp_T_FinalizeCmNftCollectionConfig_Result = {
        success: false,
        error: 'Global Error'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      finalizeCmNftCollectionConfigResult.error += ` ${errorString}`
      console.error(`${LOGPREFIX} error: ${errorString}`)
      return finalizeCmNftCollectionConfigResult
    }

  } // createNftCollection_fromWallet


/**
 * Create (ONLY) an NFT Collection
 * @param param0
 * @returns 
 */
export async function createNftCollection(
  {
    // walletAdapter: _walletAdapter,
    collectionName: _collectionName,
    collectionUri: _collectionUri,
    umi: _umi,
  } : mplhelp_T_CreateNftCollection_Input
  ): Promise<mplhelp_T_CreateNftCollection_Result>
  {
    const LOGPREFIX = `${filePath}:createNftCollection: `
    try {
      const umi = mplx_umi
      // --------------------------------
      // Check all input parameters
      // --------------------------------
      // // Check if walletAdapter is a valid signer
      // if (!MPL_F_isSigner(umi.identity)) {
      //   console.error(`${LOGPREFIX}❌ wallet ${_walletAdapter.publicKey} is not a valid signer`)
      //   const collectionResultError: mplhelp_T_CreateCollectionResult = {
      //     success: false,
      //     error: `Error creating collection: wallet is not a signer`
      //   }
      //   return collectionResultError
      // }
      // Collection Name
      if (!_collectionName|| _collectionName.trim().length < 1) {
        console.error(`${LOGPREFIX}❌ collectionName not provided`)
        const collectionResultError: mplhelp_T_CreateNftCollection_Result = {
          success: false,
          error: `Error creating collection: collectionName not provided`
        }
        return collectionResultError
      }
      // Collection URI
      if (!_collectionUri || _collectionUri.trim().length < 1) {
        console.error(`${LOGPREFIX}❌ collectionUri not provided`)
        const collectionResultError: mplhelp_T_CreateNftCollection_Result = {
          success: false,
          error: `Error creating collection: collectionUri not provided`
        }
        return collectionResultError
      }

      // // Payer / Minter = Wallet
      // setIdentityPayer_WalletAdapter(_walletAdapter, umi)

      // Basic Check balance(s)
      if (!await checkBalance(MINIMUM_CREATOR_BALANCE_SOL, _umi.payer.publicKey)) {
        console.debug(`${LOGPREFIX} PAYER.publicKey : ${_umi.payer.publicKey}`)
        console.error(`${LOGPREFIX}❌ Insufficient balance : ${MINIMUM_CREATOR_BALANCE} SOL`)
        const collectionResultError: mplhelp_T_MintNftCMResult = {
          success: false,
          error: `Error minting NFT: Insufficient balance : ${MINIMUM_CREATOR_BALANCE} SOL`
        }
        return collectionResultError
      }

      // --------------------------------
      // Create a collection
      // --------------------------------
      const collection_Signer = MPL_F_generateSigner(_umi) // NEW random signer
      try {
        await MPL_F_createCollectionV1(umi, {
          collection: collection_Signer,
          name: _collectionName,
          uri: _collectionUri,
        }).sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
        console.log(`${LOGPREFIX} ✅ Created collection: ${collection_Signer.publicKey.toString()}`)
      } catch (error) {
        console.error(`${LOGPREFIX}❌ Error creating collection.`)
        const collectionResultError: mplhelp_T_CreateNftCollection_Result = {
          success: false,
          error: 'Error creating collection.'
        }
        const errorString = (error instanceof Error) ? error.message : `${error}`
        collectionResultError.error += ` ${errorString}`
        console.error(`${LOGPREFIX} error: ${errorString}`)
        return collectionResultError
      }

      // --------------

      const collectionResult: mplhelp_T_CreateNftCollection_Result = {
        success: true,
        collectionAddress: collection_Signer.publicKey,
        collectionSigner: collection_Signer,
      }
      console.debug(`${LOGPREFIX} collectionResult`, collectionResult)
      return collectionResult
    } catch (error) {
      console.error(`${LOGPREFIX}`, error)
      const collectionResultError: mplhelp_T_CreateNftCollection_Result = {
        success: false,
        error: 'Global Error'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      collectionResultError.error += ` ${errorString}`
      console.error(`${LOGPREFIX} error: ${errorString}`)
      return collectionResultError
    } // catch
} // createNftCollection


// ------------------------------------------------------------

/**
 * Create (ONLY) a Candy Machine from/using an existing NFT Collection
 * Called from APP (SPONSORED)
 * @param param0 
 * @returns 
 */
export async function createCmNftCollection_fromApp(
  {
    collectionSigner,
    nftNamePrefix,
    itemsCount,
    metadataPrefixUri,
    startDateTime,
    endDateTime,

  } : mplhelp_T_CreateCmNftCollection_fromApp_Input
  ): Promise<mplhelp_T_CreateCmNftCollection_Result>
  {
    const LOGPREFIX = `${filePath}:createCmNftCollection_fromApp: `
    try {
      const umi = mplx_umi
      // Payer / Minter = APP
      setIdentityPayer_APP(umi)
      return await createCmNftCollection({
        collectionSigner,
        nftNamePrefix,
        itemsCount,
        metadataPrefixUri,
        startDateTime,
        endDateTime,
        umi
      })
  
    } catch (error) {
      console.error(`${LOGPREFIX}`, error)
      const finalizeCmNftCollectionConfigResult: mplhelp_T_FinalizeCmNftCollectionConfig_Result = {
        success: false,
        error: 'Global Error'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      finalizeCmNftCollectionConfigResult.error += ` ${errorString}`
      console.error(`${LOGPREFIX} error: ${errorString}`)
      return finalizeCmNftCollectionConfigResult
    }
  } // finalizeCmNftCollectionConfig_fromWallet



/**
 * Create (ONLY) a Candy Machine from/using an existing NFT Collection
 * Called from Wallet
 * @param param0 
 * @returns 
 */
export async function createCmNftCollection_fromWallet(
  {
    walletAdapter, collectionSigner,
    nftNamePrefix,
    itemsCount,
    metadataPrefixUri,
    startDateTime,
    endDateTime,

  } : mplhelp_T_CreateCmNftCollection_fromWallet_Input
  ): Promise<mplhelp_T_CreateCmNftCollection_Result>
  {
    const LOGPREFIX = `${filePath}:createCmNftCollection_fromWallet: `
    try {
      const umi = mplx_umi
      // Payer / Minter = Wallet
      setIdentityPayer_WalletAdapter(walletAdapter, umi)
      return await createCmNftCollection({
        collectionSigner,
        nftNamePrefix,
        itemsCount,
        metadataPrefixUri,
        startDateTime,
        endDateTime,
        umi
      })
    } catch (error) {
      console.error(`${LOGPREFIX}`, error)
      const finalizeCmNftCollectionConfigResult: mplhelp_T_FinalizeCmNftCollectionConfig_Result = {
        success: false,
        error: 'Global Error'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      finalizeCmNftCollectionConfigResult.error += ` ${errorString}`
      console.error(`${LOGPREFIX} error: ${errorString}`)
      return finalizeCmNftCollectionConfigResult
    }
  } // finalizeCmNftCollectionConfig_fromWallet

// ------------------------------------------------------------

/**
 * Create (ONLY) a Candy Machine from/using an existing NFT Collection
 * @param param0 
 * @returns 
 */
export async function createCmNftCollection(
  {
    // collectionAddress: _collectionAddress,
    collectionSigner: _collectionSigner,
    nftNamePrefix: _nftNamePrefix,
    itemsCount: _itemsCount,
    metadataPrefixUri: _metadataPrefixUri,
    startDateTime: _startDateTime,
    endDateTime: _endDateTime,
    umi: _umi,
  } : mplhelp_T_CreateCmNftCollection_Input
  ): Promise<mplhelp_T_CreateCmNftCollection_Result>
  {
    const LOGPREFIX = `${filePath}:createCmNftCollection: `
    try {
      // const umi = mplx_umi
      // --------------------------------
      // Check all input parameters
      // --------------------------------

      // const collection_Signer = MPL_F_publicKey(_collectionAddress)
      // TODO : check Collection Address is an NFT Collection
      // TODO : check Collection Address is an NFT Collection

      // Check if collectionSigner is a valid signer
      if (!MPL_F_isSigner(_collectionSigner)) {
        console.error(`${LOGPREFIX}❌ wallet ${_collectionSigner.publicKey} is not a valid signer`)
        const collectionResultError: mplhelp_T_CreateCollectionResult = {
          success: false,
          error: `Error creating CM Collection: collectionSigner is not a signer`
        }
        return collectionResultError
      }

      // NFT Name Prefix
      if (!_nftNamePrefix || _nftNamePrefix.trim().length < 1) {
        console.error(`${LOGPREFIX}❌ nftNamePrefix not provided`)
        const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
          success: false,
          error: `Error creating CM Collection: nftNamePrefix not provided`
        }
        return collectionResultError
      }
      // `${nftNamePrefix} #$ID+1$`
      const nftNamePostfix = ` #${_itemsCount.toString()}`
      if (`${_nftNamePrefix}${nftNamePostfix}`.length > NFT_NAME_PREFIX_MAX_LENGTH) {
        const nftNameMaxLength = NFT_NAME_PREFIX_MAX_LENGTH - nftNamePostfix.length;
        console.error(`${LOGPREFIX}❌ nftNamePrefix too long`)
        const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
          success: false,
          error: `Error creating CM Collection: nftNamePrefix too long (max ${nftNameMaxLength} characters)`
        }
        return collectionResultError
      }
      // Items Count
      if (_itemsCount < 1) {
        console.error(`${LOGPREFIX}❌ itemsCount < 1`)
        const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
          success: false,
          error: `Error creating CM Collection: itemsCount < 1`
        }
        return collectionResultError
      }
      // Metadata Prefix URI
      if (!_metadataPrefixUri || _metadataPrefixUri.trim().length < 1) {
        console.error(`${LOGPREFIX}❌ metadataPrefixUri not provided`)
        const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
          success: false,
          error: `Error creating CM Collection: metadataPrefixUri not provided`
        }
        return collectionResultError
      }

      // // Payer / Minter = Wallet
      // // Set identity
      // umi.use(MPL_P_walletAdapterIdentity(_walletAdapter));
      // // Set payer
      // umi.use(MPL_P_walletAdapterPayer(_walletAdapter));

      // Payer / Minter = Wallet
      // setIdentityPayer_WalletAdapter(_walletAdapter, umi)

      // Basic Check balance(s)
      if (!await checkBalance(MINIMUM_CREATOR_BALANCE_SOL, _umi.payer.publicKey)) {
        console.debug(`${LOGPREFIX} PAYER.publicKey : ${_umi.payer.publicKey}`)
        console.error(`${LOGPREFIX}❌ Insufficient balance : ${MINIMUM_CREATOR_BALANCE} SOL`)
        const collectionResultError: mplhelp_T_CreateCmNftCollection_Result = {
          success: false,
          error: `Error minting NFT: Insufficient balance : ${MINIMUM_CREATOR_BALANCE} SOL`
        }
        return collectionResultError
      }

    // TODO : check signers

    const treasury_Signer = MPL_F_generateSigner(_umi);
    const candyMachineSigner = MPL_F_generateSigner(_umi);

    const metadataPrefixUri = _metadataPrefixUri
    const metadataPrefixUriLength = metadataPrefixUri.length

    // --------------------------------
    // Create a Candy Machine
    // --------------------------------
    try {
      // GUARDS
      // let guards_rules = {
      const guards_rules: MPL_T_GuardSetArgs = {
        botTax: MPL_F_some({ lamports: MPL_F_sol(0.001), lastInstruction: true }),
        solPayment: MPL_F_some({ lamports: MPL_F_sol(1.5), destination: treasury_Signer.publicKey }),
        // All other guards are disabled...
      }

      // TODO :  reactivate these guards

      // The Candy Machine will only be able to mint NFTs after this date
      // if (_startDateTime) {
      //   guards_rules.startDate = MPL_F_some({ date: _startDateTime });
      // }
      // // The Candy Machine will stop minting NFTs after this date
      // if (_endDateTime) {
      //   guards_rules.endDate = MPL_F_some({ date: _endDateTime });
      // }

      console.debug(`${LOGPREFIX} guards_rules:`)
      console.dir(guards_rules);

      console.table({
        treasury: treasury_Signer.publicKey.toString(),
        candyMachine: candyMachineSigner.publicKey.toString(),
        collection: _collectionSigner.publicKey.toString(),
        itemsAvailable: _itemsCount,
        // prefixName: nftNamePrefix,
        prefixName: _nftNamePrefix,
        // nameLength: nftNameMaxLength,
        nameLength: 0, // Everything is a prefix
        prefixUri: metadataPrefixUri,
        uriLength: metadataPrefixUriLength,
      });

      // https://developers.metaplex.com/core-candy-machine/settings#config-line-settings
      // Name Prefix: A name prefix shared by all inserted items.
      //  This prefix can have a maximum of 32 characters.
      // Name Length: The maximum length for the name of each inserted item
      //  EXCLUDING THE NAME PREFIX.
      // URI Prefix: A URI prefix shared by all inserted items.
      //  This prefix can have a maximum of 200 characters.
      // URI Length: The maximum length for the URI of each inserted item excluding the URI prefix.
      // Is Sequential: Indicates whether to mint NFTs sequentially — true — or in random order — false.
      //  We recommend setting this to false to prevent buyers from predicting which NFT will be minted next. Note that our SDKs will default to using Config Line Settings with Is Sequential set to false when creating new Candy Machines.

      const CoreCM_configLineSettings = MPL_F_some({
        hiddenSettings: MPL_F_none(),
        // prefixName: nftNamePrefix,
        // prefixName: `${nftNamePrefix} #$ID+1$`,
        prefixName: `${_nftNamePrefix} #$ID+1$`,
        // nameLength: nftNameMaxLength,
        nameLength: 0, // Everything is a prefix
        prefixUri: metadataPrefixUri,
        uriLength: metadataPrefixUriLength,
        isSequential: false,
      });

      console.debug(`${LOGPREFIX} CoreCM_configLineSettings:`)
      console.dir(CoreCM_configLineSettings);

      const coreCM_CreateIx = await MPL_F_create(_umi, {
        candyMachine: candyMachineSigner,
        collection: _collectionSigner.publicKey, // create assets into this collection
        collectionUpdateAuthority: _umi.identity,
        itemsAvailable: _itemsCount,
        authority: _umi.identity.publicKey,
        isMutable: false,
        // https://developers.metaplex.com/core-candy-machine/create#config-line-settings
        // configLineSettings: MPL_F_some({
        //   prefixName: nftNamePrefix,
        //   nameLength: nftNameMaxLength,
        //   prefixUri: metadataPrefixUri,
        //   uriLength: metadataPrefixUriLength,
        //   isSequential: false,
        // }),
        configLineSettings: CoreCM_configLineSettings,
        // guards
        guards: guards_rules,
      })
      const candyMachineTxResult = await coreCM_CreateIx.sendAndConfirm(_umi, MPL_TX_BUILDR_OPTIONS);
      console.debug(`${LOGPREFIX} createIx result`, candyMachineTxResult)
      console.dir(candyMachineTxResult)

      if (candyMachineTxResult.result.value.err !== null) {
        console.error(`${LOGPREFIX}❌ Error creating Candy Machine.`)
        const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
          success: false,
          error: 'Error creating Candy Machine.'
        }
        return collectionResultError
      }

      console.log(`${LOGPREFIX} ✅ Created Candy Machine: ${candyMachineSigner.publicKey.toString()}`)
    } catch (error) {
      console.error(`${LOGPREFIX} ❌ Error creating Candy Machine.`, error)
      const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
        success: false,
        error: 'Error creating Candy Machine.'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      collectionResultError.error += ` ${errorString}`
      return collectionResultError
    } // catch


    const cmCollectionResult: mplhelp_T_CreateCmNftCollection_Result = {
      success: true,
      // collectionAddress: _collectionAddress,
      candyMachineAddress: candyMachineSigner.publicKey,
      candyMachineSigner: candyMachineSigner,
    }
    console.debug(`${LOGPREFIX} cmCollectionResult`, cmCollectionResult)
    return cmCollectionResult
  } catch (error) {
    console.error(`${LOGPREFIX}`, error)
    const cmCollectionResultError: mplhelp_T_CreateCmNftCollection_Result = {
      success: false,
      error: 'Global Error'
    }
    const errorString = (error instanceof Error) ? error.message : `${error}`
    cmCollectionResultError.error += ` ${errorString}`
    console.error(`${LOGPREFIX} error: ${errorString}`)
    return cmCollectionResultError
  } // catch
} // createCmNftCollection



/**
 * Finalises/completes/updates a Candy Machine NFT collection
 * Updates/config (ONLY) a Candy Machine
 * called from APP (SPONSORED)
 * @param param0 
 * @returns 
 */
export async function finalizeCmNftCollectionConfig_Sponsored(
  {
    itemsCount,
    collectionSigner,
    candyMachineSigner,
  } : mplhelp_T_FinalizeCmNftCollectionConfig_fromApp_Input
  ): Promise<mplhelp_T_FinalizeCmNftCollectionConfig_Result>
  {
    const LOGPREFIX = `${filePath}:finalizeCmNftCollectionConfig_fromWallet: `
    const umi = mplx_umi
    try {
      setIdentityPayer_APP(umi)
      return await finalizeCmNftCollectionConfig({
        itemsCount, collectionSigner, candyMachineSigner, umi
      })
    } catch (error) {
      console.error(`${LOGPREFIX}`, error)
      const finalizeCmNftCollectionConfigResult: mplhelp_T_FinalizeCmNftCollectionConfig_Result = {
        success: false,
        error: 'Global Error'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      finalizeCmNftCollectionConfigResult.error += ` ${errorString}`
      console.error(`${LOGPREFIX} error: ${errorString}`)
      return finalizeCmNftCollectionConfigResult
    }
  } // finalizeCmNftCollectionConfig_Sponsored


/**
 * Finalises/completes/updates a Candy Machine NFT collection
 * Updates/config (ONLY) a Candy Machine
 * called from WALLET
 * @param param0 
 * @returns 
 */
export async function finalizeCmNftCollectionConfig_fromWallet(
  {
    walletAdapter,
    itemsCount,
    collectionSigner,
    candyMachineSigner,
  } : mplhelp_T_FinalizeCmNftCollectionConfig_fromWallet_Input
  ): Promise<mplhelp_T_FinalizeCmNftCollectionConfig_Result>
  {
    const LOGPREFIX = `${filePath}:finalizeCmNftCollectionConfig_fromWallet: `
    try {
      const umi = mplx_umi
      // Payer / Minter = Wallet
      setIdentityPayer_WalletAdapter(walletAdapter, umi)
      return await finalizeCmNftCollectionConfig({
        itemsCount, collectionSigner, candyMachineSigner, umi
      })
    } catch (error) {
      console.error(`${LOGPREFIX}`, error)
      const finalizeCmNftCollectionConfigResult: mplhelp_T_FinalizeCmNftCollectionConfig_Result = {
        success: false,
        error: 'Global Error'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      finalizeCmNftCollectionConfigResult.error += ` ${errorString}`
      console.error(`${LOGPREFIX} error: ${errorString}`)
      return finalizeCmNftCollectionConfigResult
    }
  } // finalizeCmNftCollectionConfig_fromWallet


/**
 * Finalises/completes/updates a Candy Machine NFT collection
 * Updates/config (ONLY) a Candy Machine
 * @param param0 
 * @returns 
 */
export async function finalizeCmNftCollectionConfig(
  {
    itemsCount: _itemsCount,
    collectionSigner: _collectionSigner,
    candyMachineSigner: _candyMachineSigner,
    umi: _umi,
  } : mplhelp_T_FinalizeCmNftCollectionConfig
  ): Promise<mplhelp_T_FinalizeCmNftCollectionConfig_Result>
  {
    const LOGPREFIX = `${filePath}:finalizeCmNftCollectionConfig: `
    try {

    // Payer / Minter = Wallet
    // setIdentityPayer_WalletAdapter(_walletAdapter, umi)

    // --------------------------------
    // Add items to the Candy Machine
    // --------------------------------

    // Basic Check balance(s)
    if (!await checkBalance(MINIMUM_CREATOR_BALANCE_SOL, _umi.payer.publicKey)) {
      console.debug(`${LOGPREFIX} PAYER.publicKey : ${_umi.payer.publicKey}`)
      console.error(`${LOGPREFIX}❌ Insufficient balance : ${MINIMUM_CREATOR_BALANCE} SOL`)
      const collectionResultError: mplhelp_T_CreateCmNftCollection_Result = {
        success: false,
        error: `Error minting NFT: Insufficient balance : ${MINIMUM_CREATOR_BALANCE} SOL`
      }
      return collectionResultError
    }

    try {
      const configLines = [];
      for (let i = 1; i <= _itemsCount; i++) {
        configLines.push(
          {
            name: `${i}`,
            uri: `${i}.json`,
          })
      }
      await MPL_F_addConfigLines(_umi, {
        candyMachine: _candyMachineSigner.publicKey,
        index: 0,
        // configLines: [
        //     { name: '1', uri: '1.json' },
        //     { name: '2', uri: '2.json' },
        //     { name: '3', uri: '3.json' },
        // ],
        configLines: configLines,
      }).sendAndConfirm(_umi, MPL_TX_BUILDR_OPTIONS);
      console.log(`${LOGPREFIX} ✅ Items added to the Candy Machine: ${_candyMachineSigner.publicKey.toString()}`)
    } catch (error) {
      console.error(`${LOGPREFIX} ❌ Error adding items to the Candy Machine`, error)
      const collectionResult: mplhelp_T_FinalizeCmNftCollectionConfig_Result = {
        success: false,
        error: 'Error adding items to the Candy Machine.'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      collectionResult.error += ` ${errorString}`
      console.error(`${LOGPREFIX} error: ${errorString}`)
      return collectionResult
    } // catch

    // 5. Verify the Candy Machine configuration
    try {
      await checkCandyMachine(_umi, _candyMachineSigner.publicKey, {
        itemsLoaded: _itemsCount,
        authority: _umi.identity.publicKey,
        collection: _collectionSigner.publicKey,
        itemsRedeemed: 0,
      });
      // , 5);
    } catch (error) {
      console.error(`${LOGPREFIX} ❌ Error verifying the Candy Machine configuration`, error)
      const collectionResultError: mplhelp_T_FinalizeCmNftCollectionConfig_Result = {
        success: false,
        error: 'Error verifying the Candy Machine configuration.'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      collectionResultError.error += ` ${errorString}`
      console.error(`${LOGPREFIX} error: ${errorString}`)
      return collectionResultError
    } // catch


    const finalizeCmNftCollectionConfigResult: mplhelp_T_FinalizeCmNftCollectionConfig_Result = {
        success: true,
        collectionAddress: _collectionSigner.publicKey,
        candyMachineAddress: _candyMachineSigner.publicKey,
      }
      console.debug(`${LOGPREFIX} finalizeCmNftCollectionConfigResult`, finalizeCmNftCollectionConfigResult)
      return finalizeCmNftCollectionConfigResult
    } catch (error) {
      console.error(`${LOGPREFIX}`, error)
      const finalizeCmNftCollectionConfigResult: mplhelp_T_FinalizeCmNftCollectionConfig_Result = {
        success: false,
        error: 'Global Error'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      finalizeCmNftCollectionConfigResult.error += ` ${errorString}`
      console.error(`${LOGPREFIX} error: ${errorString}`)
      return finalizeCmNftCollectionConfigResult
    } // catch
  } // finalizeCmNftCollectionConfig
  
  
// ------------------------------------------------------------
/*
export async function createFullNftCollection(
  {
    walletAdapter: _walletAdapter,
    collectionName: _collectionName,
    collectionUri: _collectionUri,
    nftNamePrefix: _nftNamePrefix,
    itemsCount: _itemsCount,
    metadataPrefixUri: _metadataPrefixUri,
    startDateTime: _startDateTime,
    endDateTime: _endDateTime,
  }: mplhelp_T_CreateFullNftCollectionInput
  ): Promise<mplhelp_T_CreateCMNftCollectionResult>
  {
  const LOGPREFIX = `${filePath}:createFullNftCollection: `
  try {
    const umi = mplx_umi

    // --------------------------------
    // Check all input parameters
    // --------------------------------

    // Check if walletAdapter is a valid signer
    if (!MPL_F_isSigner(umi.identity)) {
      console.error(`${LOGPREFIX}❌ wallet ${_walletAdapter.publicKey} is not a valid signer`)
      const collectionResultError: mplhelp_T_CreateCollectionResult = {
        success: false,
        error: `Error creating collection: wallet is not a signer`
      }
      return collectionResultError
    }
    // Collection Name
    if (!_collectionName|| _collectionName.trim().length < 1) {
      console.error(`${LOGPREFIX}❌ collectionName not provided`)
      const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
        success: false,
        error: `Error creating collection: collectionName not provided`
      }
      return collectionResultError
    }
    // Collection URI
    if (!_collectionUri || _collectionUri.trim().length < 1) {
      console.error(`${LOGPREFIX}❌ collectionUri not provided`)
      const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
        success: false,
        error: `Error creating collection: collectionUri not provided`
      }
      return collectionResultError
    }
    // NFT Name Prefix
    if (!_nftNamePrefix || _nftNamePrefix.trim().length < 1) {
      console.error(`${LOGPREFIX}❌ nftNamePrefix not provided`)
      const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
        success: false,
        error: `Error creating collection: nftNamePrefix not provided`
      }
      return collectionResultError
    }
    // `${nftNamePrefix} #$ID+1$`
    const nftNamePostfix = ` #${_itemsCount.toString()}`
    if (`${_nftNamePrefix}${nftNamePostfix}`.length > NFT_NAME_PREFIX_MAX_LENGTH) {
      const nftNameMaxLength = NFT_NAME_PREFIX_MAX_LENGTH - nftNamePostfix.length;
      console.error(`${LOGPREFIX}❌ nftNamePrefix too long`)
      const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
        success: false,
        error: `Error creating collection: nftNamePrefix too long (max ${nftNameMaxLength} characters)`
      }
      return collectionResultError
    }
    // Items Count
    if (_itemsCount < 1) {
      console.error(`${LOGPREFIX}❌ itemsCount < 1`)
      const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
        success: false,
        error: `Error creating collection: itemsCount < 1`
      }
      return collectionResultError
    }
    // Metadata Prefix URI
    if (!_metadataPrefixUri || _metadataPrefixUri.trim().length < 1) {
      console.error(`${LOGPREFIX}❌ metadataPrefixUri not provided`)
      const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
        success: false,
        error: `Error creating collection: metadataPrefixUri not provided`
      }
      return collectionResultError
    }

    // Payer / Minter = Wallet
    // Set identity
    // umi.use(MPL_P_walletAdapterIdentity(_walletAdapter));
    // // Set payer
    // umi.use(MPL_P_walletAdapterPayer(_walletAdapter));

    // Payer / Minter = Wallet
    setIdentityPayer_WalletAdapter(_walletAdapter, umi)

    // Basic Check balance(s)

    console.debug(`${LOGPREFIX} _walletAdapter.publicKey : ${_walletAdapter.publicKey}`)

    if (!await checkBalance(MINIMUM_CREATOR_BALANCE_SOL, _walletAdapter.publicKey)) {
      console.error(`${LOGPREFIX}❌ Insufficient balance : ${MINIMUM_CREATOR_BALANCE} SOL`)
      const collectionResultError: mplhelp_T_MintNftCMResult = {
        success: false,
        error: `Error minting NFT: Insufficient balance : ${MINIMUM_CREATOR_BALANCE} SOL`
      }
      return collectionResultError
    }

    // TODO
    // ------------------------------------------------------------------------

    const collection_Signer = MPL_F_generateSigner(umi) // NEW random signer

    // const collectionName = 'My Collection'
    // const collectionUri = 'https://example.com/my-collection.json'
    // const collectionName = _collectionName
    // const collectionUri = _collectionUri

    // --------------------------------
    // Create a collection
    // --------------------------------
    try {
      await MPL_F_createCollectionV1(umi, {
        collection: collection_Signer,
        name: _collectionName,
        uri: _collectionUri,
      }).sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
      console.log(`${LOGPREFIX} ✅ Created collection: ${collection_Signer.publicKey.toString()}`)
    } catch (error) {
      console.error(`${LOGPREFIX}❌ Error creating collection.`)
      const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
        success: false,
        error: 'Error verifying the Candy Machine configuration.'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      collectionResultError.error += ` ${errorString}`
      console.error(`${LOGPREFIX} error: ${errorString}`)
      return collectionResultError
    }

    // try {

    // } catch (error) {
    //   console.error(`${LOGPREFIX}`, error)
    //   const collectionResult:mplhelp_T_CreateCMNftCollectionResult = {
    //     success: false,
    //     error: ''
    //   }
    //   if (error instanceof Error) {
    //     console.log('error', error)
    //     collectionResult.error = error.message
    //   } else {
    //     collectionResult.error = 'Error'
    //   }
    //   return collectionResult
    // } // catch


    // const startDateTime = _startDateTime;
    // const endDateTime = null;
    // const endDateTime = _endDateTime;


    // TODO : check signers
    // TODO : check signers
    // TODO : check signers

    const treasury_Signer = MPL_F_generateSigner(umi);
    const candyMachine = MPL_F_generateSigner(umi);

    // const itemsAvailable = 3; // TODO: change this
    // const itemsAvailable = _itemsCount;
    // const nftNamePrefix = 'Quick NFT'; // TODO: change this
    // const nftNamePrefix = _nftNamePrefix;
    // const nftNamePrefix = 'Quick NFT ABCDE'; // Max. 16 ? <-----------------
    // const nftNamePrefix = 'Quick NFT ABCDEFGHIJK'; // Max. 16 ? <-----------------

    // const nftNameMaxLength = nftNamePrefix.length+1; // TODO: change this
    // const nftNameMaxLength = nftNamePrefix.length + _itemsCount.toString().length;
    // const nftNameMaxLength = _nftNamePrefix.length + _itemsCount.toString().length;

    // const metadataPrefixUri = 'https://example.com/metadata/' // TODO: change this ; upload metadata to IPFS
    const metadataPrefixUri = _metadataPrefixUri
    const metadataPrefixUriLength = metadataPrefixUri.length
    // const metadataPrefixUriLength = _metadataPrefixUri.length

    // --------------------------------
    // Create a Candy Machine
    // --------------------------------
    try {
      // GUARDS
      // let guards_rules = {
      const guards_rules: MPL_T_GuardSetArgs = {
        botTax: MPL_F_some({ lamports: MPL_F_sol(0.001), lastInstruction: true }),
        solPayment: MPL_F_some({ lamports: MPL_F_sol(1.5), destination: treasury_Signer.publicKey }),
        // All other guards are disabled...
      }
      // The Candy Machine will only be able to mint NFTs after this date
      // if (_startDateTime) {
      //   guards_rules.startDate = MPL_F_some({ date: _startDateTime });
      // }
      // // The Candy Machine will stop minting NFTs after this date
      // if (_endDateTime) {
      //   guards_rules.endDate = MPL_F_some({ date: _endDateTime });
      // }

      console.debug(`${LOGPREFIX} guards_rules:`)
      console.dir(guards_rules);

      console.table({
        treasury: treasury_Signer.publicKey.toString(),
        candyMachine: candyMachine.publicKey.toString(),
        collection: collection_Signer.publicKey.toString(),
        itemsAvailable: _itemsCount,
        // prefixName: nftNamePrefix,
        prefixName: _nftNamePrefix,
        // nameLength: nftNameMaxLength,
        nameLength: 0, // Everything is a prefix
        prefixUri: metadataPrefixUri,
        uriLength: metadataPrefixUriLength,
      });

      // https://developers.metaplex.com/core-candy-machine/settings#config-line-settings
      // Name Prefix: A name prefix shared by all inserted items.
      //  This prefix can have a maximum of 32 characters.
      // Name Length: The maximum length for the name of each inserted item
      //  EXCLUDING THE NAME PREFIX.
      // URI Prefix: A URI prefix shared by all inserted items.
      //  This prefix can have a maximum of 200 characters.
      // URI Length: The maximum length for the URI of each inserted item excluding the URI prefix.
      // Is Sequential: Indicates whether to mint NFTs sequentially — true — or in random order — false.
      //  We recommend setting this to false to prevent buyers from predicting which NFT will be minted next. Note that our SDKs will default to using Config Line Settings with Is Sequential set to false when creating new Candy Machines.

      const CoreCM_configLineSettings = MPL_F_some({
        hiddenSettings: MPL_F_none(),
        // prefixName: nftNamePrefix,
        // prefixName: `${nftNamePrefix} #$ID+1$`,
        prefixName: `${_nftNamePrefix} #$ID+1$`,
        // nameLength: nftNameMaxLength,
        nameLength: 0, // Everything is a prefix
        prefixUri: metadataPrefixUri,
        uriLength: metadataPrefixUriLength,
        isSequential: false,
      });

      console.debug(`${LOGPREFIX} CoreCM_configLineSettings:`)
      console.dir(CoreCM_configLineSettings);

      const coreCM_CreateIx = await MPL_F_create(umi, {
        candyMachine,
        collection: collection_Signer.publicKey, // create assets into this collection
        collectionUpdateAuthority: umi.identity,
        itemsAvailable: _itemsCount,
        authority: umi.identity.publicKey,
        isMutable: false,
        // https://developers.metaplex.com/core-candy-machine/create#config-line-settings
        // configLineSettings: MPL_F_some({
        //   prefixName: nftNamePrefix,
        //   nameLength: nftNameMaxLength,
        //   prefixUri: metadataPrefixUri,
        //   uriLength: metadataPrefixUriLength,
        //   isSequential: false,
        // }),
        configLineSettings: CoreCM_configLineSettings,
        // guards
        guards: guards_rules,
      })
      const candyMachineTxResult = await coreCM_CreateIx.sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
      console.debug(`${LOGPREFIX} createIx result`, candyMachineTxResult)
      console.dir(candyMachineTxResult)

      if (candyMachineTxResult.result.value.err !== null) {
        console.error(`${LOGPREFIX}❌ Error creating Candy Machine.`)
        const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
          success: false,
          error: 'Error creating Candy Machine.'
        }
        return collectionResultError
      }

      console.log(`${LOGPREFIX} ✅ Created Candy Machine: ${candyMachine.publicKey.toString()}`)
    } catch (error) {
      console.error(`${LOGPREFIX} ❌ Error creating Candy Machine.`, error)
      const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
        success: false,
        error: 'Error creating Candy Machine.'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      collectionResultError.error += ` ${errorString}`
      return collectionResultError
    } // catch

    // --------------------------------
    // Add items to the Candy Machine
    // --------------------------------

    try {
      const configLines = [];
      for (let i = 1; i <= _itemsCount; i++) {
        configLines.push(
          {
            name: `${i}`,
            uri: `${i}.json`,
          })
      }
      await MPL_F_addConfigLines(umi, {
        candyMachine: candyMachine.publicKey,
        index: 0,
        configLines: configLines,
        // configLines: [
        //     { name: '1', uri: '1.json' },
        //     { name: '2', uri: '2.json' },
        //     { name: '3', uri: '3.json' },
        // ],
      }).sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
      console.log(`${LOGPREFIX} ✅ Items added to the Candy Machine: ${candyMachine.publicKey.toString()}`)
    } catch (error) {
      console.error(`${LOGPREFIX} ❌ Error adding items to the Candy Machine`, error)
      const collectionResult: mplhelp_T_CreateCMNftCollectionResult = {
        success: false,
        error: 'Error adding items to the Candy Machine.'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      collectionResult.error += ` ${errorString}`
      console.error(`${LOGPREFIX} error: ${errorString}`)
      return collectionResult
    } // catch

    // 5. Verify the Candy Machine configuration
    try {
      await checkCandyMachine(umi, candyMachine.publicKey, {
        itemsLoaded: _itemsCount,
        authority: umi.identity.publicKey,
        collection: collection_Signer.publicKey,
        itemsRedeemed: 0,
      });
      // , 5);
    } catch (error) {
      console.error(`${LOGPREFIX} ❌ Error verifying the Candy Machine configuration`, error)
      const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
        success: false,
        error: 'Error verifying the Candy Machine configuration.'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      collectionResultError.error += ` ${errorString}`
      console.error(`${LOGPREFIX} error: ${errorString}`)
      return collectionResultError
    } // catch



    // try {

    // } catch (error) {
    //   console.error(`${LOGPREFIX}`, error)
    //   const collectionResult:mplhelp_T_CreateCMNftCollectionResult = {
    //     success: false,
    //     error: ''
    //   }
    //   if (error instanceof Error) {
    //     console.log('error', error)
    //     collectionResult.error = error.message
    //   } else {
    //     collectionResult.error = 'Error'
    //   }
    //   return collectionResult
    // } // catch


    // TODO : REMOVE ====>
    // TODO : REMOVE ====>
    // TODO : REMOVE ====>
    // TODO : REMOVE ====>

    // --------------------------------
    // Mint NFTs
    // --------------------------------
    
    // try {
    //     const numMints = 3;
    //     let minted = 0;
    //     for (let i = 0; i < numMints; i++) {
    //         await MPL_F_transactionBuilder()
    //             .add(MPL_F_setComputeUnitLimit(umi, { units: 800_000 }))
    //             .add(
    //               MPL_F_mintV1(umi, {
    //                     candyMachine: candyMachine.publicKey,
    //                     asset: MPL_F_generateSigner(umi),
    //                     collection: collection_Signer.publicKey,
    //                     mintArgs: {
    //                         solPayment: MPL_F_some({ destination: treasury_Signer.publicKey }),
    //                     },
    //                 })
    //             )
    //             .sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
    //         minted++;
    //     }
    //     console.log(`✅ - Minted ${minted} NFTs.`);
    // } catch (error) {
    //     console.log('❌ - Error minting NFTs.');
    // }

    // 6. Mint ONE NFT

    // try {

    // } catch (error) {
    //   console.error(`${LOGPREFIX}`, error)
    //   const collectionResult:mplhelp_T_CreateCMNftCollectionResult = {
    //     success: false,
    //     error: ''
    //   }
    //   if (error instanceof Error) {
    //     console.log('error', error)
    //     collectionResult.error = error.message
    //   } else {
    //     collectionResult.error = 'Error'
    //   }
    //   return collectionResult
    // } // catch


    try {
      const mintTxResult = await MPL_F_transactionBuilder()
        .add(MPL_F_setComputeUnitLimit(umi, { units: 800_000 }))
        .add(
          MPL_F_mintV1(umi, {
            candyMachine: candyMachine.publicKey,
            asset: MPL_F_generateSigner(umi),
            collection: collection_Signer.publicKey,
            mintArgs: {
              solPayment: MPL_F_some({ destination: treasury_Signer.publicKey }),
            },
          })
        )
        .sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);

      // console.dir(mintTxResult) //

      // MINT: Error is NOT returned in the result
      // TODO: check tx cost BEFORE sending
      // TODO: check tx cost BEFORE sending
      // TODO: check tx cost BEFORE sending

      // if (mintTxResult.result.value.err !== null) {

      //   console.error(`${LOGPREFIX}❌ Error Minting ONE NFT`)
      //   const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
      //     success: false,
      //     error: 'Error creating Candy Machine.'
      //   }
      //   return collectionResultError
      // }

      console.log(`${LOGPREFIX} ✅ Minted ONE NFT`)
    } catch (error) {
      console.error(`${LOGPREFIX} ❌ Error minting ONE NFT`, error)
      const collectionResult: mplhelp_T_CreateCMNftCollectionResult = {
        success: false,
        error: 'Error minting NFT.'
      }
      const errorString = (error instanceof Error) ? error.message : `${error}`
      collectionResult.error += ` ${errorString}`
      console.error(`${LOGPREFIX} error: ${errorString}`)
      return collectionResult
    } // catch

    // TODO : <===== REMOVE 
    // TODO : <===== REMOVE 
    // TODO : <===== REMOVE 
    // TODO : <===== REMOVE 

    // 7. Verify the Candy Machine configuration
    // await checkCandyMachine(umi, candyMachine.publicKey, {
    //     itemsLoaded: itemsAvailable,
    //     authority: umi.identity.publicKey,
    //     collection: collection_Signer.publicKey,
    //     itemsRedeemed: itemsAvailable, // all items have been minted
    //   // }, 7);
    // });

    // 8. Delete the Candy Machine
    // try {
    //     await MPL_F_deleteCandyMachine(umi, {
    //         candyMachine: candyMachine.publicKey,
    //     }).sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
    //     console.log(`8. ✅ - Deleted the Candy Machine: ${candyMachine.publicKey.toString()}`);
    // } catch (error) {
    //     console.log('8. ❌ - Error deleting the Candy Machine.');
    // }

    // ------------------------------------------------------------------------


    const collectionResult: mplhelp_T_CreateCMNftCollectionResult = {
      success: true,
      collectionAddress: collection_Signer.publicKey,
      candyMachineAddress: candyMachine.publicKey,
    }

    console.debug(`${LOGPREFIX} collectionResult`, collectionResult)
    return collectionResult

  } catch (error) {
    console.error(`${LOGPREFIX}`, error)
    const collectionResultError: mplhelp_T_CreateCMNftCollectionResult = {
      success: false,
      error: 'Global Error'
    }
    const errorString = (error instanceof Error) ? error.message : `${error}`
    collectionResultError.error += ` ${errorString}`
    console.error(`${LOGPREFIX} error: ${errorString}`)

    return collectionResultError
  } // catch

} // createFullNftCollection


// ------------------------------------------------------------

export async function mintNftFromCM(
  // _walletAdapter: MPL_T_WalletAdapter,
  // _candyMachineAddress: string,
  // _collectionAddress: string,
  // umi:MPL_T_Umi,
  {walletAdapter: _walletAdapter,
    candyMachineAddress: _candyMachineAddress,
    collectionAddress: _collectionAddress}: mplhelp_T_MintNftCMInput
): Promise<mplhelp_T_MintNftCMResult> {
  const LOGPREFIX = `${filePath}:mintNftFromCM: `
  try {

    const umi = mplx_umi

    if (!await checkBalance(MINIMUM_CREATOR_BALANCE_SOL, _walletAdapter.publicKey)) {
      console.error(`${LOGPREFIX}❌ Insufficient balance : ${MINIMUM_CREATOR_BALANCE} SOL`)
      const collectionResultError: mplhelp_T_MintNftCMResult = {
        success: false,
        error: `Error minting NFT: Insufficient balance : ${MINIMUM_CREATOR_BALANCE} SOL`
      }
      return collectionResultError
    }

    // // Set identity
    // umi.use(MPL_P_walletAdapterIdentity(_walletAdapter));
    // // Set payer
    // umi.use(MPL_P_walletAdapterPayer(_walletAdapter));

    // Payer / Minter = Wallet
    setIdentityPayer_WalletAdapter(_walletAdapter, umi)

    // console.debug(`${LOGPREFIX} candyMachineAddress=${_candyMachineAddress} collectionAddress=${_collectionAddress}`)
    // console.debug(`${LOGPREFIX}`)
    console.table({
        logger: LOGPREFIX,
        candyMachineAddress: _candyMachineAddress,
        collectionAddress: _collectionAddress,
      })

    if (!_candyMachineAddress) {
      console.error(`${LOGPREFIX} _candyMachineAddress`)
      const collectionResultError: mplhelp_T_MintNftCMResult = {
        success: false,
        error: 'No Candy Machine Address provided'
      }
      return collectionResultError
    }
    if (!_collectionAddress) {
      console.error(`${LOGPREFIX} _collectionAddress`)
      const collectionResultError: mplhelp_T_MintNftCMResult = {
        success: false,
        error: 'No Collection Address provided'
      }
      return collectionResultError
    }

    const candyMachinePublicKey: MPL_T_PublicKey = MPL_F_publicKey(_candyMachineAddress)
    const collectionPublicKey: MPL_T_PublicKey = MPL_F_publicKey(_collectionAddress)

    try {
        await MPL_F_transactionBuilder()
          .add(MPL_F_setComputeUnitLimit(umi, { units: 800_000 }))
          .add(
            MPL_F_mintV1(umi, {
              candyMachine: candyMachinePublicKey, // candyMachine.publicKey
              asset: MPL_F_generateSigner(umi),
              collection: collectionPublicKey, // collection_Signer.publicKey
              // mintArgs: {
              //   solPayment: MPL_F_some({ destination: treasury_Signer.publicKey }),
              // },
            })
          )
          .sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);

          console.log(`✅ - NFT Minted.`);
    } catch (error) {
      // console.log('6. ❌ - Error minting NFTs.');
      console.error(`${LOGPREFIX} ❌ - Error minting NFT`, error)
      const collectionResult: mplhelp_T_CreateCMNftCollectionResult = {
        success: false,
        error: 'Error minting NFT.'
      }
      if (error instanceof Error) {
        console.log('error', error)
        collectionResult.error += ` ${error.message}`
      } else {
        collectionResult.error = ` ${error}`
      }
      return collectionResult
    } // catch


    const collectionResult: mplhelp_T_MintNftCMResult = {
      success: true,
      mintAddress: "TODO",
    }

    console.debug(`${LOGPREFIX} collectionResult`, collectionResult)
    return collectionResult

  } catch (error) {
    console.error(`${LOGPREFIX}`, error)
    const collectionResult: mplhelp_T_MintNftCMResult = {
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

} // mintNftFromCM
*/
