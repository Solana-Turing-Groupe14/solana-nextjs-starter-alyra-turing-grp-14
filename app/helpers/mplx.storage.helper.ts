import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { nftStorageUploader } from "@metaplex-foundation/umi-uploader-nft-storage"

import { PUBLIC_STORAGE_RPC_URL } from "@helpers/solana.storage.helper";
import {
  MPL_T_Umi,
} from '@imports/mtplx.imports';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'
import { MPL_F_createGenericFileFromBrowserFile } from '@imports/mtplx.storage.imports';

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

mplx_umi_storage.use(irysUploader())

// --------------------------------------------------

export const getUmiStorage = (): MPL_T_Umi => {
  // const LOGPREFIX = `${filePath}:getUmiStorage: `
  // console.debug(`${LOGPREFIX}()`)
  return mplx_umi_storage
} // getUmiStorage

// --------------------------------------------------

export const uploadJson = async(_umiStorage:MPL_T_Umi, someJson: unknown): Promise<string> => {
  // const LOGPREFIX = `${filePath}:uploadJson: `
  // console.debug(`${LOGPREFIX}()`)
  if (!_umiStorage) {
    throw new Error('_umiStorage not provided')
  }
  if(!someJson) {
    throw new Error('no Json provided')
  }
  const jsonUri = await _umiStorage.uploader.uploadJson(someJson)
  return jsonUri
} // uploadJson

// --------------------------------------------------

export const uploadSingleFile = async(_umiStorage:MPL_T_Umi, _file:File): Promise<string> => {
  const LOGPREFIX = `${filePath}:uploadSingleFile: `
  // console.debug(`${LOGPREFIX}()`)
  if (!_umiStorage) {
    throw new Error('_umiStorage not provided')
  }
  if(!_file) {
    throw new Error('no file provided')
  }
  const genericF = await MPL_F_createGenericFileFromBrowserFile(_file)
  const fileUris = await _umiStorage.uploader.upload([genericF], {
    // signal: myAbortSignal,
    onProgress: (percent: number) => {
      console.debug(`${percent * 100}% uploaded...`);
    },
  })
  const fileUri = fileUris[0]
  // console.debug(`${LOGPREFIX}fileUri:`, fileUri)
  return fileUri
} // uploadSingleFile
