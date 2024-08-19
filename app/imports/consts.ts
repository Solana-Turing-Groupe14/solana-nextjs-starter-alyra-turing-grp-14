import { PublicKey } from "@solana/web3.js";

import IDL_JSON from "./idl/idl.json"
import IDL_POAP_ALYRA_JSON from "./idl/poap_alyra.json"

export const IDL = IDL_JSON; 
export const IDL_POAP_ALYRA = IDL_POAP_ALYRA_JSON; 

const programID = process.env.NEXT_PUBLIC_USER_DATA_PROGRAM_ID||''
if (!programID) {
    console.error('NEXT_PUBLIC_USER_DATA_PROGRAM_ID is not set')
    throw new Error('NEXT_PUBLIC_USER_DATA_PROGRAM_ID is not set')
}

const poapAlyraProgramId = IDL_POAP_ALYRA_JSON.metadata.address ?
    IDL_POAP_ALYRA_JSON.metadata.address :
    process.env.NEXT_PUBLIC_POAP_ALYRA_PROGRAM_ID||''

if (!poapAlyraProgramId) {
    console.error('IDL_POAP_ALYRA_JSON.metadata.address || NEXT_PUBLIC_POAP_ALYRA_PROGRAM_ID is not set')
    throw new Error('IDL_POAP_ALYRA_JSON.metadata.address || NEXT_PUBLIC_USER_DATA_PROGRAM_ID is not set')
}
// console.debug('NEXT_PUBLIC_USER_DATA_PROGRAM_ID', programID)

export const USER_DATA_PROGRAM_ID = new PublicKey(programID);
export const POAP_ALYRA_PROGRAM_ID = new PublicKey(programID);

// const USER_ACCOUNT_SEED_STRING = "account";
const USER_ACCOUNT_SEED_STRING = "useraccount";

export const POAP_ALYRA_USER_ACCOUNT_SEED_STRING = "AlyraPoapUserData";
export const POAP_ALYRA_USER_MINTS_ACCOUNT_SEED_STRING = "AlyraPoapUserMints";
export const POAP_ALYRA_USER_BURNS_ACCOUNT_SEED_STRING = "AlyraPoapUserBurns";

export const USER_ACCOUNT_SEED = Buffer.from(USER_ACCOUNT_SEED_STRING);

export const POAP_ALYRA_USER_ACCOUNT_SEED = Buffer.from(POAP_ALYRA_USER_ACCOUNT_SEED_STRING);
export const POAP_ALYRA_USER_MINTS_ACCOUNT_SEED = Buffer.from(POAP_ALYRA_USER_MINTS_ACCOUNT_SEED_STRING);
export const POAP_ALYRA_USER_BURNS_ACCOUNT_SEED = Buffer.from(POAP_ALYRA_USER_BURNS_ACCOUNT_SEED_STRING);
