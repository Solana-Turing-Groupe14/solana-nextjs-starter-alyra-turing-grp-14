import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { nftStorageUploader } from "@metaplex-foundation/umi-uploader-nft-storage"

import { PUBLIC_STORAGE_RPC_URL } from "@helpers/solana.storage.helper";
import {
  MPL_T_Umi,
} from '@imports/mtplx.imports';
//  import {
//   createBrowserFileFromGenericFile, createGenericFile,
//   createGenericFileFromBrowserFile, createGenericFileFromJson,
//   parseJsonFromGenericFile
// } from '@metaplex-foundation/umi';

const filePath = "app/helpers/mplx.storage.helpers.ts"

// --------------------------------------------------

const token = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY||""
if (!token) {
  throw new Error('NFT_STORAGE_API_KEY not found')
}

const mplx_umi_storage: MPL_T_Umi =
  createUmi(PUBLIC_STORAGE_RPC_URL).use(nftStorageUploader({
    token: process.env.NEXT_PUBLIC_NFT_STORAGE_KEY||"", }))
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