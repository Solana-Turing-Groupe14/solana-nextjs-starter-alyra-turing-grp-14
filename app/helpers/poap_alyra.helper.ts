import { BN, Idl, Program } from "@coral-xyz/anchor";
// import { AnchorWallet, WalletContextState } from "@solana/wallet-adapter-react";
// import { useWallet } from "@solana/wallet-adapter-react";

import { Connection, LAMPORTS_PER_SOL, PublicKey,
  SendTransactionError, SystemProgram, Transaction,
  TransactionInstruction } from "@solana/web3.js";
// import { sign } from 'tweetnacl';
import {
  POAP_ALYRA_PROGRAM_ID,
  IDL_POAP_ALYRA,
  POAP_ALYRA_USER_ACCOUNT_SEED_STRING, POAP_ALYRA_USER_MINTS_ACCOUNT_SEED_STRING,
  POAP_ALYRA_USER_BURNS_ACCOUNT_SEED_STRING,
  POAP_ALYRA_USER_ACCOUNT_SEED,
  POAP_ALYRA_USER_BURNS_ACCOUNT_SEED,
  POAP_ALYRA_USER_MINTS_ACCOUNT_SEED,
 } from "../imports/consts";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { getRecentBlockhash } from "@helpers/solana.helper";


const FILEPATH = 'app/helpers/poap_alyra.helper.ts'

if (!process.env.NEXT_PUBLIC_RPC_URL) {
    throw new Error("NEXT_PUBLIC_RPC_URL is required");
}
// console.log('NEXT_PUBLIC_RPC_URL', process.env.NEXT_PUBLIC_RPC_URL);

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "", "confirmed");
// Use @coral-xyz/anchor 0.29.0
// do not update to 0.30+ version (breaking changes) until solpg allows exporting new IDL format, see below:
// https://www.anchor-lang.com/release-notes/0.30.0#account-resolution
// https://solana.stackexchange.com/questions/13076/anchor-idl-different-incorrect-from-solana-playground-idl-generated
const program = new Program<Idl>(IDL_POAP_ALYRA as Idl, POAP_ALYRA_PROGRAM_ID, {
  connection,
});

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
if (RPC_URL === undefined) {
  throw new Error('RPC_URL not found')
}

/* export */ type pa_help_T_poapAlyraAccounts =
{
  userAccount: any,
  userMintsAccount: any,
  userBurnsAccount: any,
}

export const saveMints = async (wallet: WalletContextState, mints: string[]): Promise<string | null> => {
    try {
      console.debug(`saveMints mints:${mints}`);

      if (!wallet || !wallet.publicKey) {
        console.warn("Wallet not connected")
        return null;
      }

      const poapAlyraUserAccounts = await getPoapAlyraUserAccounts(wallet.publicKey)
      if (!poapAlyraUserAccounts || !poapAlyraUserAccounts.userAccount) {
        console.debug(`account not found`)
        initializePoapAlyraAccounts( wallet, mints )
      } else {
        mintAlyraPoap( wallet, mints )
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  };

// export const initializeAccount = async (anchorWallet: AnchorWallet, data: number, age: number): Promise<string | null> => {
  export const initializePoapAlyraAccounts = async (wallet: WalletContextState,  mints: string[]): Promise<string | null> => {
    try {
      console.debug(`initializePoapAlyraAccounts  mints:${ mints}`);
      
      if (!wallet || !wallet.publicKey) {
        console.warn("Wallet not connected")
        return null;
      }
      const accountTransaction = await getInitializePoapAlyraAccountsTransactionWWithoutAnchor(wallet.publicKey, mints);
      console.debug(`initializePoapAlyraAccounts: accountTransaction=${JSON.stringify(accountTransaction)}`);
      const recentBlockhash = await getRecentBlockhash();

      if (!wallet.signTransaction) {
        console.warn("Wallet unable to sign transactions")
        return null;
      }

      if (accountTransaction && recentBlockhash) {
          accountTransaction.feePayer = wallet.publicKey;
          accountTransaction.recentBlockhash = recentBlockhash;
          console.debug('initializePoapAlyraAccounts: anchorWallet.signTransaction');

          try {
            const signedTransaction = await wallet.signTransaction(accountTransaction);
            console.debug('initializePoapAlyraAccounts: signedTransaction', signedTransaction);
            return await connection.sendRawTransaction(signedTransaction.serialize());
          } catch (error) {
            console.error('initializePoapAlyraAccounts: error', error);
            if (error instanceof SendTransactionError) {
              const errorLogs = await error.getLogs(connection);
              // debugger;
              console.error(`initializePoapAlyraAccounts: Error: ${errorLogs}`);
            } else {
              console.error(`initializePoapAlyraAccounts: Error: ${error}`);
            }

          }
          // const signedTransaction = await anchorWallet.signTransaction(accountTransaction);
          // return await connection.sendRawTransaction(signedTransaction.serialize());
      }
/* 
      // const accountTransaction = await getInitializeAccountTransactionWWithoutAnchor(anchorWallet.publicKey, new BN(data), new BN(age));
      const accountTransaction = await getInitializeAccountTransaction(anchorWallet.publicKey, new BN(data), new BN(age), new BN(taille));
      // console.debug(`initializeAccount: accountTransaction=${JSON.stringify(accountTransaction)}`);

      const recentBlockhash = await getRecentBlockhash();
      if (accountTransaction && recentBlockhash) {
          accountTransaction.feePayer = anchorWallet.publicKey;
          accountTransaction.recentBlockhash = recentBlockhash;
          // console.debug('initializeAccount: anchorWallet.signTransaction');

          try {
            const signedTransaction = await anchorWallet.signTransaction(accountTransaction);
            // console.debug('initializeAccount: signedTransaction', signedTransaction);
            return await connection.sendRawTransaction(signedTransaction.serialize());
          } catch (error) {
            console.error('initializeAccount: error', error);
            if (error instanceof SendTransactionError) {
              const errorLogs = await error.getLogs(connection);
              // debugger;
              console.error(`initializeAccount: Error: ${errorLogs}`);
            } else {
              console.error(`initializeAccount: Error: ${error}`);
            }

          }
          // const signedTransaction = await anchorWallet.signTransaction(accountTransaction);
          // return await connection.sendRawTransaction(signedTransaction.serialize());
      }
 */      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
};

export const getPoapAlyraUserAccounts = async (userPublicKey: PublicKey): Promise<pa_help_T_poapAlyraAccounts|null> => {
  try {
    console.debug('getPoapAlyraUserAccounts', userPublicKey.toBase58());
    const userAccount = getPoapAlyraAccount(POAP_ALYRA_USER_ACCOUNT_SEED_STRING, userPublicKey)
    const userMintsAccount = getPoapAlyraAccount(POAP_ALYRA_USER_MINTS_ACCOUNT_SEED_STRING, userPublicKey)
    const userBurnsAccount = getPoapAlyraAccount(POAP_ALYRA_USER_BURNS_ACCOUNT_SEED_STRING, userPublicKey)
    return {
      userAccount, userMintsAccount, userBurnsAccount
    }
  } catch (error) {
    console.error(error);
  }
  return null;
};

const getPoapAlyraAccountSeed = (ACCOUNT_SEED_STRING: string): Buffer|null => {
  try {
    switch (ACCOUNT_SEED_STRING) {
      case POAP_ALYRA_USER_ACCOUNT_SEED_STRING:
        return POAP_ALYRA_USER_ACCOUNT_SEED;
      case POAP_ALYRA_USER_MINTS_ACCOUNT_SEED_STRING:
        return POAP_ALYRA_USER_MINTS_ACCOUNT_SEED;
      case POAP_ALYRA_USER_BURNS_ACCOUNT_SEED_STRING:
        return POAP_ALYRA_USER_BURNS_ACCOUNT_SEED;
    }
  } catch (error) {
    console.error(`getPoapAlyraAccountSeed: ${error}`);
  }
  return null;
}

export const getPoapAlyraAccount = async (ACCOUNT_SEED_STRING: string, userPublicKey: PublicKey): Promise<any> => {
  try {
      console.debug(`getPoapAlyraUserAccount ACCOUNT_SEED${ACCOUNT_SEED_STRING} userPublicKey${userPublicKey.toBase58()}` );
      const ACCOUNT_SEED = getPoapAlyraAccountSeed(ACCOUNT_SEED_STRING)
      if (!ACCOUNT_SEED) {
        console.error(`ACCOUNT_SEED not found`)
        return null
      }
      const [accountPda] = PublicKey.findProgramAddressSync(
        [
          ACCOUNT_SEED,
          userPublicKey.toBuffer()
        ],
        new PublicKey(POAP_ALYRA_PROGRAM_ID.toString())
      );
      // const fetchAccountPromise = await program.account.newAccount.fetch(accountPda);
      switch (ACCOUNT_SEED_STRING) {
        case POAP_ALYRA_USER_ACCOUNT_SEED_STRING:
          const fetchUserAccountPromise = await program.account.userData.fetch(accountPda);
          console.debug('getPoapAlyraAccount: fetchUserAccountPromise', JSON.stringify( (fetchUserAccountPromise) ) );
          return fetchUserAccountPromise
        case POAP_ALYRA_USER_MINTS_ACCOUNT_SEED_STRING:
          const fetchUserMintsAccountPromise = await program.account.userMints.fetch(accountPda);
          console.debug('getPoapAlyraAccount: fetchUserMintsAccountPromise', JSON.stringify( (fetchUserMintsAccountPromise) ) );
          return fetchUserMintsAccountPromise
       case POAP_ALYRA_USER_BURNS_ACCOUNT_SEED_STRING:
        const fetchUserBurnsAccountPromise = await program.account.userBurns.fetch(accountPda);
        console.debug('getPoapAlyraAccount: fetchUserBurnsAccountPromise', JSON.stringify( (fetchUserBurnsAccountPromise) ) );
        return fetchUserBurnsAccountPromise
      default:
          break;
      }
    } catch (error) {
      console.error(`getPoapAlyraAccount: ${error}`);
    }
    return null;
};

export const getInitializePoapAlyraAccountsTransactionWWithoutAnchor = async (publicKey: PublicKey, mints: string[]): Promise<Transaction | null> => {
    try {
      console.debug(`getInitializePoapAlyraAccountsTransactionWWithoutAnchor publicKey:${publicKey} mints:${mints}`);
      const [userAccountPda] = PublicKey.findProgramAddressSync(
        [
          POAP_ALYRA_USER_ACCOUNT_SEED, 
          publicKey.toBuffer()
        ], 
        POAP_ALYRA_PROGRAM_ID
      );
      const [userMintsAccountPda, userMintsAccountBump] = PublicKey.findProgramAddressSync(
        [
          POAP_ALYRA_USER_ACCOUNT_SEED, 
          publicKey.toBuffer()
        ], 
        POAP_ALYRA_PROGRAM_ID
      );
      const [userBurnsAccountPda, userBurnsAccountBump] = PublicKey.findProgramAddressSync(
        [
          POAP_ALYRA_USER_ACCOUNT_SEED, 
          publicKey.toBuffer()
        ], 
        POAP_ALYRA_PROGRAM_ID
      );
  
      // u8 u8 [32]
      // 1 1 [32]
      const instructionLength = 1+1+32 +1;
      const instructionData = Buffer.alloc(instructionLength); // Adjust size as needed
      instructionData.writeUInt8(0, 0); // This is the "initialize" instruction index
      instructionData.writeUInt8( userMintsAccountBump, 1 ); // 
      instructionData.writeUInt8( userBurnsAccountBump, 2 ); // 
      let instructionDataPos = 3;
      for (let index = 0; index < mints.length; index++) {
        // const adrStr = mints[index];
        // const bn = new BN(adrStr)
        // bn.toArrayLike(Buffer, 'le', 32).copy(instructionData, instructionDataPos); // Write data
        new BN(mints[index]).toArrayLike(Buffer, 'le', 32).copy(instructionData, instructionDataPos);
        instructionDataPos += 32;
      }

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: userAccountPda, isSigner: false, isWritable: true },
          { pubkey: userMintsAccountPda, isSigner: false, isWritable: true },
          { pubkey: userBurnsAccountPda, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: POAP_ALYRA_PROGRAM_ID,
        data: instructionData,
      });
  
      try {
        const transaction = new Transaction().add(instruction);
        return transaction;
      } catch (error) {
        if (error instanceof SendTransactionError) {
          console.error(error.getLogs(connection));
        }
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  export const mintAlyraPoap = async (wallet: WalletContextState, mints: string[]): Promise<string | null> => {
    try {
      console.debug(`initializePoapAlyraAccounts mints:${mints}`);
  } catch (error) {
    console.error(error);
  }
  return null;
};
  