import axios from 'axios';
import { MPL_T_Umi } from '@imports/mtplx.imports';

const LOGPREFIX = "mplx.storage.helpers: ";
const PINATA_JSON_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';


// Vérification de la clé JWT Pinata
const JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "";
if (!JWT) {
  console.error(`${LOGPREFIX}PINATA_JWT not found`);
  throw new Error('PINATA_JWT not found');
}

const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export const getUmiStorage = (): MPL_T_Umi => {
  console.log(`${LOGPREFIX}getUmiStorage called`);
  return {} as MPL_T_Umi;
};

const uploadToPinata = async (file: File | Blob, fileName: string): Promise<string> => {
  const form = new FormData();
  form.append("file", file, fileName);

  const options = {
    method: 'POST',
    url: PINATA_API_URL,
    headers: {
      'Authorization': 'Bearer ' + JWT,
      'Content-Type': 'multipart/form-data'
    },
    data: form,
  };

  try {
    const response = await axios(options);
    console.log(`${LOGPREFIX}Data sent to IPFS. Hash:`, response.data.IpfsHash);
    return response.data.IpfsHash;
  } catch (error) {
    console.error(`${LOGPREFIX}Error uploading to IPFS via Pinata:`, error);
    throw error;
  }
};

export const uploadJson = async (someJson: unknown): Promise<string> => {
  console.log(`${LOGPREFIX}uploadJson called with:`, someJson);
  if (!someJson) {
    console.error(`${LOGPREFIX}uploadJson: no Json provided`);
    throw new Error('no Json provided');
  }
  try {
    const data = {
      pinataOptions: {
        cidVersion: 1
      },
      pinataMetadata: {
        name: "metadata.json"
      },
      pinataContent: someJson
    };

    const response = await axios.post(PINATA_JSON_API_URL, data, {
      headers: {
        'Authorization': `Bearer ${JWT}`,
        'Content-Type': 'application/json'
      }
    });

    const ipfsHash = response.data.IpfsHash;
    console.log(`${LOGPREFIX}uploadJson: Successfully uploaded JSON, IPFS Hash:`, ipfsHash);
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  } catch (error) {
    console.error(`${LOGPREFIX}uploadJson: Error uploading JSON:`, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error(`${LOGPREFIX}uploadJson: Server responded with:`, error.response.data);
    }
    throw error;
  }
};

export const uploadSingleFile = async (file: File, name?: string): Promise<string> => {
  console.log(`${LOGPREFIX}uploadSingleFile called with file:`, file.name);
  if (!file) {
    console.error(`${LOGPREFIX}uploadSingleFile: no file provided`);
    throw new Error('no file provided');
  }
  try {
    const ipfsHash = await uploadToPinata(file, name || file.name);
    console.log(`${LOGPREFIX}uploadSingleFile: Successfully uploaded file, IPFS Hash:`, ipfsHash);
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
  } catch (error) {
    console.error(`${LOGPREFIX}uploadSingleFile: Error uploading file:`, error);
    throw error;
  }
};