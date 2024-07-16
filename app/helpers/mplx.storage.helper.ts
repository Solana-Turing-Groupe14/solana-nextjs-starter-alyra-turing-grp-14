import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { nftStorageUploader } from "@metaplex-foundation/umi-uploader-nft-storage"

// import { PublicKey as soljsweb3PublicKey } from '@solana/web3.js'
import {
//   MPL_F_createCollectionV1,
//   MPL_F_createSignerFromKeypair,
//   MPL_F_generateSigner,
//   MPL_F_isSigner,
//   MPL_F_publicKey,
//   MPL_F_sol, MPL_Keypair,
//   MPL_P_KeypairIdentity,
//   MPL_P_walletAdapterIdentity,
//   MPL_P_walletAdapterPayer,
//   MPL_T_GuardSetArgs,
//   // MPL_T_KeypairSigner,
//   MPL_T_PublicKey,
//   // eslint-disable-next-line sort-imports
//   MPL_T_SolAmount, MPL_F_some,
  MPL_T_Umi,
// MPL_T_WalletAdapter,
//   MPL_TX_BUILDR_OPTIONS,
//   MPL_F_addConfigLines,
//   MPL_F_fetchCandyMachine,
//   MPL_F_create,
//   MPL_F_transactionBuilder,
//   MPL_F_setComputeUnitLimit,
//   MPL_F_mintV1,
//   // MPL_F_deleteCandyMachine,
} from '@helpers/mtplx';
// import { 
//  } from "types";
import { STORAGE_RPC_URL } from "./solana.storage.helper";
import { createBrowserFileFromGenericFile, createGenericFile, createGenericFileFromBrowserFile, createGenericFileFromJson, parseJsonFromGenericFile } from '@metaplex-foundation/umi';

const filePath = "app/helpers/mplx.storage.helpers.ts"

// --------------------------------------------------

const mplx_umi_storage: MPL_T_Umi = createUmi(STORAGE_RPC_URL).use(nftStorageUploader())
if (!mplx_umi_storage) {
  throw new Error('mplx_umi_storage not found')
}

export const getUmiStorage = (): MPL_T_Umi => {
  const LOGPREFIX = `${filePath}:getUmiStorage: `
  console.debug(`${LOGPREFIX}()`)
  return mplx_umi_storage
} // getUmiStorage


// --------------------------------------------------

// Storage

// Create a generic file directly.
// createGenericFile('some content', 'my-file.txt', { contentType: "text/plain" });
/*
export const testUpload = async (content: string, filename: string, contentType: string): Promise<string> => {
  const LOGPREFIX = `${filePath}:testUpload: `
  console.debug(`${LOGPREFIX}()`)
  // const res = await mplx_umi_storage.upload(content, filename, { contentType })

  // Create a generic file directly.
  createGenericFile('some content', 'my-file.txt', { contentType: "text/plain" });

  // Parse a generic file to and from a browser file.
  await createGenericFileFromBrowserFile(myBrowserFile);
  createBrowserFileFromGenericFile(myGenericFile);
  
  // Parse a generic file to and from a JSON object.
  createGenericFileFromJson(myJson);
  parseJsonFromGenericFile(myGenericFile);

  // console.debug(`${LOGPREFIX}res:`, res)
  // return res
    return ""
} // testUpload
*/
// --------------------------------------------------