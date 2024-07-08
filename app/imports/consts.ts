import { PublicKey } from "@solana/web3.js";

import IDL_JSON from "./idl/idl.json"

export const IDL = IDL_JSON; 

const programID = process.env.NEXT_PUBLIC_USER_DATA_PROGRAM_ID||''
if (!programID) {
    console.error('NEXT_PUBLIC_USER_DATA_PROGRAM_ID is not set')
    throw new Error('NEXT_PUBLIC_USER_DATA_PROGRAM_ID is not set')
}

console.debug('NEXT_PUBLIC_USER_DATA_PROGRAM_ID', programID)

export const USER_DATA_PROGRAM_ID = new PublicKey(programID);

// const USER_ACCOUNT_SEED_STRING = "account";
const USER_ACCOUNT_SEED_STRING = "useraccount";

export const USER_ACCOUNT_SEED = Buffer.from(USER_ACCOUNT_SEED_STRING);