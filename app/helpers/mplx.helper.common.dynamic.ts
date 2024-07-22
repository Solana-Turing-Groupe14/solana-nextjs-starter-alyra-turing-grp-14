import {
  MPL_F_createSignerFromKeypair,
  MPL_F_isSigner,
  MPL_Keypair, MPL_P_KeypairIdentity, 
  MPL_P_KeypairPayer,
  MPL_P_walletAdapterIdentity,
  MPL_P_walletAdapterPayer,
  MPL_T_PublicKey,
  MPL_T_SolAmount,
  MPL_T_Umi,
  MPL_T_WalletAdapter,
} from '@imports/mtplx.imports'

// import { I_ExpectedCandyMachineState, mplhelp_T_AirdropResult, mplhelp_T_CreateCmNftCollection_fromApp_Input, mplhelp_T_CreateCmNftCollection_fromWallet_Input, mplhelp_T_CreateCmNftCollection_Input, mplhelp_T_CreateCmNftCollection_Result, mplhelp_T_CreateCMNftCollectionResult,
//   mplhelp_T_CreateCollectionResult, 
//   mplhelp_T_CreateCompleteNftCollectionCmConfig_Input, 
//   mplhelp_T_CreateCompleteNftCollectionCmConfig_Result, 
//   mplhelp_T_CreateNftCollection_fromApp_Input,
//   mplhelp_T_CreateNftCollection_fromWallet_Input, mplhelp_T_CreateNftCollection_Input, mplhelp_T_CreateNftCollection_Result,
//   mplhelp_T_FinalizeCmNftCollectionConfig,
//   mplhelp_T_FinalizeCmNftCollectionConfig_fromApp_Input,
//   mplhelp_T_FinalizeCmNftCollectionConfig_fromWallet_Input,
//   mplhelp_T_FinalizeCmNftCollectionConfig_Result,
//   mplhelp_T_MintNftCm,
//   mplhelp_T_MintNftCm_fromApp_Input,
//   mplhelp_T_MintNftCm_fromWallet_Input,
//   mplhelp_T_MintNftCMResult
// } from "types";

const filePath = "app/helpers/mplx.helper.common.dynamic.ts"

// ------------------------------------------------------------

export const getMplKeypair_fromEnv = (
  signerName: string,
  _umi: MPL_T_Umi
  ): MPL_Keypair | null => {
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
    const SIGNER_SEED: Uint8Array = Uint8Array.from(buf)
    const keyPair: MPL_Keypair = _umi.eddsa.createKeypairFromSecretKey(SIGNER_SEED);
    return keyPair;
  } catch (error) {
    const errorMsg = (error instanceof Error) ? error.message : `${error}`
    console.error(`${LOGPREFIX} error`, errorMsg)
  } // catch
  return null
} // getMplKeypair_fromEnv

// ------------------------------------------------------------

// https://developers.metaplex.com/umi/public-keys-and-signers
// Umi interface stores two instances of Signer:
// - identity using the app
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
    const errorMsg = (error instanceof Error) ? error.message : `${error}`
    console.error(`${LOGPREFIX}error`, errorMsg)
    return false
  }
} // setIdentityPayer_WalletAdapter

// --------------------------

export async function setPayer_APP(
  _umi: MPL_T_Umi,
  _checkSigner = false
): Promise<boolean>
{
  const LOGPREFIX = `${filePath}:setPayer_APP: `
  try {
    const APP_1_KEYPAIR_SIGNER = 'MINT_APP_01_KEYPAIR'
    const creator_keyPair: MPL_Keypair | null = getMplKeypair_fromEnv(APP_1_KEYPAIR_SIGNER, _umi)
    if (!creator_keyPair) {
      return false
    }
    const appSigner = MPL_F_createSignerFromKeypair(_umi, creator_keyPair)
    // Set payer ONLY
    // _umi.use(MPL_P_KeypairIdentity(appSigner));
    _umi.use(MPL_P_KeypairPayer(appSigner));

    if (_checkSigner && !MPL_F_isSigner(_umi.identity)) {
      console.error(`${LOGPREFIX}❌ wallet ${_umi.identity} is not a valid signer`)
      return false
    }
    return true
  } catch (error) {
    const errorMsg = (error instanceof Error) ? error.message : `${error}`
    console.error(`${LOGPREFIX}error`, errorMsg)
    return false
  }
} // setPayer_APP

// --------------------------

export async function setIdentityPayer_APP(
  _umi: MPL_T_Umi,
  _checkSigner = false
): Promise<boolean>
{
  const LOGPREFIX = `${filePath}:setIdentityPayer_APP: `
  try {
    const APP_1_KEYPAIR_SIGNER = 'MINT_APP_01_KEYPAIR'
    const creator_keyPair: MPL_Keypair | null = getMplKeypair_fromEnv(APP_1_KEYPAIR_SIGNER, _umi)
    if (!creator_keyPair) {
      return false
    }
    const appSigner = MPL_F_createSignerFromKeypair(_umi, creator_keyPair)
    // Set identity & payer with the same signer: appSigner
    _umi.use(MPL_P_KeypairIdentity(appSigner));

    if (_checkSigner && !MPL_F_isSigner(_umi.identity)) {
      console.error(`${LOGPREFIX}❌ wallet ${_umi.identity} is not a valid signer`)
      return false
    }
    return true
  } catch (error) {
    const errorMsg = (error instanceof Error) ? error.message : `${error}`
    console.error(`${LOGPREFIX}error`, errorMsg)
    return false
  }
} // setIdentityPayer_APP

// ------------------------------------------------------------

export async function checkBalance(
  minAmount: MPL_T_SolAmount,
  _publicKey: MPL_T_PublicKey|undefined,
  _umi: MPL_T_Umi) :
  // Promise<mplhelp_T_CheckBalanceResult>
Promise<boolean>
{
  const LOGPREFIX = `${filePath}:checkBalance: `
  try {
    const publicKey = _publicKey || _umi.payer.publicKey
    if (!publicKey) {
      console.error(`${LOGPREFIX} publicKey not provided`)
      return false
    }
    const balance:MPL_T_SolAmount = await _umi.rpc.getBalance(publicKey);
    console.debug(`${LOGPREFIX} balance `, balance);
    if (balance.basisPoints < minAmount.basisPoints) {
      console.warn(`${LOGPREFIX}❌ Insufficient balance : ${Number(balance.basisPoints) / (10 ** balance.decimals)} SOL`);
      return false
    }
    return true
  } catch (error) {
    const errorMsg = (error instanceof Error) ? error.message : `${error}`
    console.error(`${LOGPREFIX}error`, errorMsg)
    return false
  }
} // checkBalance

// ------------------------------------------------------------
