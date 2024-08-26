import { Idl, Program } from "@coral-xyz/anchor";

import { Connection, PublicKey,
  SendTransactionError, SystemProgram, Transaction,
  // TransactionInstruction
} from "@solana/web3.js";

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
import {
  pa_help_T_poapAlyraAccounts
} from 'types';

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
const programPoapAlyra = new Program<Idl>(IDL_POAP_ALYRA as Idl, POAP_ALYRA_PROGRAM_ID, {
  connection,
});

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
if (RPC_URL === undefined) {
  throw new Error('RPC_URL not found')
}

export const addMints = async (wallet: WalletContextState, mints: string[]): Promise<string | null> => {
  const LOGPREFIX = `${FILEPATH}:saveMints: `
    try {
      console.debug(`${LOGPREFIX} mints:${mints}`);

      if (!wallet || !wallet.publicKey) {
        console.warn("Wallet not connected")
        return null;
      }

      const poapAlyraUserAccounts = await getPoapAlyraUserAccounts(wallet.publicKey)
      if (!poapAlyraUserAccounts || !poapAlyraUserAccounts.userAccount) {
        console.debug(`${LOGPREFIX}no existing account not found`)
        initializePoapAlyraAccounts( wallet, mints )
      } else {
        mintAlyraPoap( wallet, mints )
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  };

const initializePoapAlyraAccounts = async (wallet: WalletContextState,  mints: string[]): Promise<string | null> => {
  const LOGPREFIX = `${FILEPATH}:initializePoapAlyraAccounts: `
  try {
    console.debug(`${LOGPREFIX}mints:${ mints}`);

    if (!wallet || !wallet.publicKey) {
      console.warn("Wallet not connected")
      return null;
    }
    // const accountTransaction = await getInitializePoapAlyraAccountsTransactionWithoutAnchor(wallet.publicKey, mints);
    const accountTransaction = await getInitializePoapAlyraAccountsTransactionWithAnchor(wallet.publicKey, mints);

    console.debug(`${LOGPREFIX}accountTransaction=${JSON.stringify(accountTransaction)}`);
    const recentBlockhash = await getRecentBlockhash();

    if (!wallet.signTransaction) {
      console.warn("Wallet unable to sign transactions")
      return null;
    }

    if (accountTransaction && recentBlockhash) {
        accountTransaction.feePayer = wallet.publicKey;
        accountTransaction.recentBlockhash = recentBlockhash;
        console.debug(`${LOGPREFIX}anchorWallet.signTransaction`);

      try {
        const signedTransaction = await wallet.signTransaction(accountTransaction);
        console.debug(`${LOGPREFIX}signedTransaction`, signedTransaction);
        return await connection.sendRawTransaction(signedTransaction.serialize());
      } catch (error) {
        console.error(`${LOGPREFIX}error`, error);
        if (error instanceof SendTransactionError) {
          const errorLogs = await error.getLogs(connection);
          console.error(`${LOGPREFIX}Error: ${errorLogs}`);
        } else {
          console.error(`${LOGPREFIX}Error: ${error}`);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
  return null;
};

const mintAlyraPoap = async (wallet: WalletContextState, mints: string[]): Promise<string | null> => {
  const LOGPREFIX = `${FILEPATH}:mintAlyraPoap: `
  try {
    console.debug(`${LOGPREFIX}mints:${ mints}`);

    if (!wallet || !wallet.publicKey) {
      console.warn("Wallet not connected")
      return null;
    }
    
    const mintPoapTransaction = await getMintPoapAlyraTransactionWithAnchor(wallet.publicKey, mints);
    console.debug(`${LOGPREFIX}mintPoapTransaction=${JSON.stringify(mintPoapTransaction)}`);
    const recentBlockhash = await getRecentBlockhash();

    if (!wallet.signTransaction) {
      console.warn("Wallet unable to sign transactions")
      return null;
    }

    if (mintPoapTransaction && recentBlockhash) {
        mintPoapTransaction.feePayer = wallet.publicKey;
        mintPoapTransaction.recentBlockhash = recentBlockhash;
        console.debug(`${LOGPREFIX}anchorWallet.signTransaction`);

      try {
        const signedTransaction = await wallet.signTransaction(mintPoapTransaction);
        console.debug(`${LOGPREFIX}signedTransaction`, signedTransaction);
        return await connection.sendRawTransaction(signedTransaction.serialize());
      } catch (error) {
        console.error(`${LOGPREFIX}error`, error);
        if (error instanceof SendTransactionError) {
          const errorLogs = await error.getLogs(connection);
          console.error(`${LOGPREFIX}Error: ${errorLogs}`);
        } else {
          console.error(`${LOGPREFIX}Error: ${error}`);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
  return null;
};


export const getPoapAlyraUserAccounts = async (userPublicKey: PublicKey): Promise<pa_help_T_poapAlyraAccounts|null> => {
  const LOGPREFIX = `${FILEPATH}:getPoapAlyraUserAccounts: `
  try {
    console.debug(`${LOGPREFIX}userPublicKey`, userPublicKey.toBase58());
    const userAccount = await getPoapAlyraAccount(POAP_ALYRA_USER_ACCOUNT_SEED_STRING, userPublicKey)
    const userMintsAccount = await getPoapAlyraAccount(POAP_ALYRA_USER_MINTS_ACCOUNT_SEED_STRING, userPublicKey)
    const userBurnsAccount = await getPoapAlyraAccount(POAP_ALYRA_USER_BURNS_ACCOUNT_SEED_STRING, userPublicKey)

    const accounts = {
      userAccount, userMintsAccount, userBurnsAccount
    }
    showPoapAlyraUserAccounts(accounts)
    return accounts

  } catch (error) {
    console.error(error);
  }
  return null;
};

const showPoapAlyraUserAccounts = (poapAlyraUserAccounts:any) => {
  const LOGPREFIX = `${FILEPATH}:showPoapAlyraUserAccounts: `
  try {
    console.debug(`${LOGPREFIX}------------------------`);

    if (!poapAlyraUserAccounts) {
      console.debug(`${LOGPREFIX}no accounts found`);
    } else {

      // console.dir(poapAlyraUserAccounts)
      if (!poapAlyraUserAccounts.userAccount) {
        console.debug(`${LOGPREFIX}userAccount not found`);
      } else {
        console.debug(`${LOGPREFIX}userAccount.owner`, poapAlyraUserAccounts.userAccount.owner.toBase58());
      }

      if (!poapAlyraUserAccounts.userMintsAccount) {
        console.debug(`${LOGPREFIX}userMintsAccount not found`);
      } else {
        console.debug(`${LOGPREFIX}userMintsAccount.bump`, poapAlyraUserAccounts.userMintsAccount.bump);
        console.debug(`${LOGPREFIX}userMintsAccount.lastMinted`, poapAlyraUserAccounts.userMintsAccount.lastMinted?.toBase58());
        console.debug(`${LOGPREFIX}userMintsAccount.maxCurrentSize`, poapAlyraUserAccounts.userMintsAccount.maxCurrentSize);
        console.debug(`${LOGPREFIX}userMintsAccount.totalCountMinted`, poapAlyraUserAccounts.userMintsAccount.totalCountMinted);

        if (! poapAlyraUserAccounts.userMintsAccount.listMinted || poapAlyraUserAccounts.userMintsAccount.listMinted.length === 0) {
          console.debug(`${LOGPREFIX}no mints found`);
        } else {
          console.debug(`${LOGPREFIX} mints:`);

          poapAlyraUserAccounts.userMintsAccount?.listMinted.forEach(
            (element: any) => {
              console.debug(`${LOGPREFIX} - ${element.toBase58()}`);
            });
        }
      } // end if poapAlyraUserAccounts.userMintsAccount

      if (!poapAlyraUserAccounts.userBurnsAccount) {
        console.debug(`${LOGPREFIX}userBurnsAccount not found`);
      } else {
        console.debug(`${LOGPREFIX}userBurnsAccount.bump`, poapAlyraUserAccounts.userBurnsAccount.bump);
        console.debug(`${LOGPREFIX}userBurnsAccount.lastBurned`, poapAlyraUserAccounts.userBurnsAccount.lastBurned?.toBase58());
        console.debug(`${LOGPREFIX}userBurnsAccount.maxCurrentSize`, poapAlyraUserAccounts.userBurnsAccount.maxCurrentSize);
        console.debug(`${LOGPREFIX}userBurnsAccount.totalCountBurned`, poapAlyraUserAccounts.userBurnsAccount.totalCountBurned);

        if (! poapAlyraUserAccounts.userBurnsAccount.listBurned || poapAlyraUserAccounts.userBurnsAccount.listBurned.length === 0) {
          console.debug(`${LOGPREFIX}no burns found`);
        } else {
          console.debug(`${LOGPREFIX} burns:`);
          poapAlyraUserAccounts.userBurnsAccount.listBurned.forEach(
            (element: any) => {
              console.debug(`${LOGPREFIX}- ${element.toBase58()}`);
            });
        }

      } // end if poapAlyraUserAccounts.userBurnsAccount

    } // end if poapAlyraUserAccounts


    console.debug(`${LOGPREFIX}------------------------`);

  } catch (error) {
    console.error(`${LOGPREFIX}${error}`);
  }
}

export const deleteMints = async (wallet: WalletContextState, mints: string[]): Promise<string | null> => {
  const LOGPREFIX = `${FILEPATH}:saveMints: `
    try {
      console.debug(`${LOGPREFIX} mints:${mints}`);

      if (!wallet || !wallet.publicKey) {
        console.warn("Wallet not connected")
        return null;
      }

      const poapAlyraUserAccounts = await getPoapAlyraUserAccounts(wallet.publicKey)
      if (!poapAlyraUserAccounts || !poapAlyraUserAccounts.userAccount || !poapAlyraUserAccounts.userMintsAccount || !poapAlyraUserAccounts.userBurnsAccount) {
        console.error(`${LOGPREFIX}no existing account not found`)
        return null
      }
      deleteMintAlyraPoap( wallet, mints )

    } catch (error) {
      console.error(error);
    }
    return null;
  };


  const deleteMintAlyraPoap = async (wallet: WalletContextState, mintsToDelete: string[]): Promise<string | null> => {
    const LOGPREFIX = `${FILEPATH}:deleteMintAlyraPoap: `
    try {
      console.debug(`${LOGPREFIX}mintsToDelete:${ mintsToDelete}`);
  
      if (!wallet || !wallet.publicKey) {
        console.warn("Wallet not connected")
        return null;
      }
      
      const deleteMintPoapTransaction = await getDeleteMintsPoapAlyraTransactionWithAnchor(wallet.publicKey, mintsToDelete);
      console.debug(`${LOGPREFIX}deleteMintPoapTransaction=${JSON.stringify(deleteMintPoapTransaction)}`);
      const recentBlockhash = await getRecentBlockhash();
  
      if (!wallet.signTransaction) {
        console.warn("Wallet unable to sign transactions")
        return null;
      }
  
      if (deleteMintPoapTransaction && recentBlockhash) {
          deleteMintPoapTransaction.feePayer = wallet.publicKey;
          deleteMintPoapTransaction.recentBlockhash = recentBlockhash;
          console.debug(`${LOGPREFIX}anchorWallet.signTransaction`);
  
        try {
          const signedTransaction = await wallet.signTransaction(deleteMintPoapTransaction);
          console.debug(`${LOGPREFIX}signedTransaction`, signedTransaction);
          return await connection.sendRawTransaction(signedTransaction.serialize());
        } catch (error) {
          console.error(`${LOGPREFIX}error`, error);
          if (error instanceof SendTransactionError) {
            const errorLogs = await error.getLogs(connection);
            console.error(`${LOGPREFIX}Error: ${errorLogs}`);
          } else {
            console.error(`${LOGPREFIX}Error: ${error}`);
          }
        }
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
  const LOGPREFIX = `${FILEPATH}:getPoapAlyraAccount: `
  try {
    console.debug(`${LOGPREFIX} ACCOUNT_SEED ${ACCOUNT_SEED_STRING} userPublicKey ${userPublicKey.toBase58()}` );
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
      console.debug(`${LOGPREFIX} accountPda ${accountPda.toBase58()}` );
      // const fetchAccountPromise = await program.account.newAccount.fetch(accountPda);
      switch (ACCOUNT_SEED_STRING) {
        case POAP_ALYRA_USER_ACCOUNT_SEED_STRING:
          const fetchUserAccountPromise = await programPoapAlyra.account.userData.fetch(accountPda);
          console.debug(`${LOGPREFIX}fetchUserAccountPromise` , JSON.stringify( (fetchUserAccountPromise) ) );
          return fetchUserAccountPromise
        case POAP_ALYRA_USER_MINTS_ACCOUNT_SEED_STRING:
          const fetchUserMintsAccountPromise = await programPoapAlyra.account.userMints.fetch(accountPda);
          console.debug(`${LOGPREFIX}fetchUserMintsAccountPromise` , JSON.stringify( (fetchUserMintsAccountPromise) ) );
          return fetchUserMintsAccountPromise
       case POAP_ALYRA_USER_BURNS_ACCOUNT_SEED_STRING:
        const fetchUserBurnsAccountPromise = await programPoapAlyra.account.userBurns.fetch(accountPda);
        console.debug(`${LOGPREFIX}fetchUserBurnsAccountPromise` , JSON.stringify( (fetchUserBurnsAccountPromise) ) );
        return fetchUserBurnsAccountPromise
      default:
          break;
      }
    } catch (error) {
      console.warn(`getPoapAlyraAccount: ${error}`);
    }
    return null;
};

export const getInitializePoapAlyraAccountsTransactionWithAnchor = async (publicKey: PublicKey, mints: string[]): Promise<Transaction | null> => {
  const LOGPREFIX = `${FILEPATH}:getInitializePoapAlyraAccountsTransactionWithAnchor: `
  try {
    console.debug(`${LOGPREFIX} publicKey:${publicKey} mints:${mints}`);
    const [userAccountPda] = PublicKey.findProgramAddressSync(
      [
        POAP_ALYRA_USER_ACCOUNT_SEED, 
        publicKey.toBuffer()
      ], 
      POAP_ALYRA_PROGRAM_ID
    );
    const [userMintsAccountPda, userMintsAccountBump] = PublicKey.findProgramAddressSync(
      [
        POAP_ALYRA_USER_MINTS_ACCOUNT_SEED, 
        publicKey.toBuffer()
      ], 
      POAP_ALYRA_PROGRAM_ID
    );
    const [userBurnsAccountPda, userBurnsAccountBump] = PublicKey.findProgramAddressSync(
      [
        POAP_ALYRA_USER_BURNS_ACCOUNT_SEED, 
        publicKey.toBuffer()
      ], 
      POAP_ALYRA_PROGRAM_ID
    );
    console.debug(`${LOGPREFIX}userMintsAccountBump:${userMintsAccountBump} userBurnsAccountBump:${userBurnsAccountBump}`);
    console.debug(`${LOGPREFIX}userAccountPda:${userAccountPda} userMintsAccountPda:${userMintsAccountPda} userBurnsAccountPda:${userBurnsAccountPda}`);
    const pubKeyArray = stringArrayToPublicKeyArray(mints);
    return await programPoapAlyra.methods.initialize(userMintsAccountBump, userBurnsAccountBump, pubKeyArray )
      .accounts({
        userData: userAccountPda,
        userMints: userMintsAccountPda,
        userBurns: userBurnsAccountPda,
        signer: publicKey,
        systemProgram: SystemProgram.programId
      })
      .transaction()
    } catch (error) {
      console.error(`${LOGPREFIX}error: ${error}`);
      return null;
    }
};

export const getMintPoapAlyraTransactionWithAnchor = async (publicKey: PublicKey, mints: string[]): Promise<Transaction | null> => {
  const LOGPREFIX = `${FILEPATH}:getMintPoapAlyraTransactionWithAnchor: `
  try {
    console.debug(`${LOGPREFIX} publicKey:${publicKey} mints:${mints}`);
    const [userAccountPda] = PublicKey.findProgramAddressSync(
      [
        POAP_ALYRA_USER_ACCOUNT_SEED, 
        publicKey.toBuffer()
      ], 
      POAP_ALYRA_PROGRAM_ID
    );
    const [userMintsAccountPda] = PublicKey.findProgramAddressSync(
      [
        POAP_ALYRA_USER_MINTS_ACCOUNT_SEED, 
        publicKey.toBuffer()
      ], 
      POAP_ALYRA_PROGRAM_ID
    );

    console.debug(`${LOGPREFIX}userAccountPda:${userAccountPda} userMintsAccountPda:${userMintsAccountPda}`);
    const pubKeyArray = stringArrayToPublicKeyArray(mints);

    return await programPoapAlyra.methods.addMints( pubKeyArray )
      .accounts({
        userData: userAccountPda,
        userMints: userMintsAccountPda,
        owner: publicKey,
        systemProgram: SystemProgram.programId
      })
      .transaction()
    } catch (error) {
      console.error(`${LOGPREFIX}error: ${error}`);
      return null;
    }
};


export const getDeleteMintsPoapAlyraTransactionWithAnchor = async (publicKey: PublicKey, mintsToDelete: string[]): Promise<Transaction | null> => {
  const LOGPREFIX = `${FILEPATH}:getDeleteMintsToDeletePoapAlyraTransactionWithAnchor: `
  try {
    console.debug(`${LOGPREFIX} publicKey:${publicKey} mintsToDelete:${mintsToDelete}`);
    const [userAccountPda] = PublicKey.findProgramAddressSync(
      [
        POAP_ALYRA_USER_ACCOUNT_SEED, 
        publicKey.toBuffer()
      ], 
      POAP_ALYRA_PROGRAM_ID
    );
    const [userMintsAccountPda] = PublicKey.findProgramAddressSync(
      [
        POAP_ALYRA_USER_MINTS_ACCOUNT_SEED, 
        publicKey.toBuffer()
      ], 
      POAP_ALYRA_PROGRAM_ID
    );
    const [userBurnsAccountPda] = PublicKey.findProgramAddressSync(
      [
        POAP_ALYRA_USER_BURNS_ACCOUNT_SEED, 
        publicKey.toBuffer()
      ], 
      POAP_ALYRA_PROGRAM_ID
    );

    console.debug(`${LOGPREFIX}userAccountPda:${userAccountPda} userMintsAccountPda:${userMintsAccountPda}`);
    const pubKeyArray = stringArrayToPublicKeyArray(mintsToDelete);

    return await programPoapAlyra.methods.burnMints( pubKeyArray )
      .accounts({
        userData: userAccountPda,
        userMints: userMintsAccountPda,
        userBurns: userBurnsAccountPda,
        owner: publicKey,
        systemProgram: SystemProgram.programId
      })
      .transaction()
    } catch (error) {
      console.error(`${LOGPREFIX}error: ${error}`);
      return null;
    }
};
/*
// export const getInitializePoapAlyraAccountsTransactionWithoutAnchor = async (publicKey: PublicKey, mints: string[]): Promise<Transaction | null> => {
//   const LOGPREFIX = `${FILEPATH}:getInitializePoapAlyraAccountsTransactionWithoutAnchor: `
//     try {
//       console.debug(`${LOGPREFIX} publicKey:${publicKey} mints:${mints}`);
//       const [userAccountPda] = PublicKey.findProgramAddressSync(
//         [
//           POAP_ALYRA_USER_ACCOUNT_SEED, 
//           publicKey.toBuffer()
//         ], 
//         POAP_ALYRA_PROGRAM_ID
//       );
//       const [userMintsAccountPda, userMintsAccountBump] = PublicKey.findProgramAddressSync(
//         [
//           POAP_ALYRA_USER_MINTS_ACCOUNT_SEED, 
//           publicKey.toBuffer()
//         ], 
//         POAP_ALYRA_PROGRAM_ID
//       );
//       const [userBurnsAccountPda, userBurnsAccountBump] = PublicKey.findProgramAddressSync(
//         [
//           POAP_ALYRA_USER_BURNS_ACCOUNT_SEED, 
//           publicKey.toBuffer()
//         ], 
//         POAP_ALYRA_PROGRAM_ID
//       );

//       // u8 u8 [32]
//       // 1 1 1 [44]
//       const instructionLength = 1+1+1+ 44 * mints.length; // instruction id + userMintsAccountBump + userBurnsAccountBump + mint address * mints.length
//       const instructionData = Buffer.alloc(instructionLength); // Adjust size as needed
//       const InitializeInstructionIndex = 112;
//       instructionData.writeUInt8(InitializeInstructionIndex, 0); // This is the "initialize" instruction index
//       instructionData.writeUInt8( userMintsAccountBump, 1 ); // 
//       instructionData.writeUInt8( userBurnsAccountBump, 2 ); // 
//       let instructionDataPos = 3;
//       for (let index = 0; index < mints.length; index++) {
//         // const adrStr = mints[index];
//         // const bn = new BN(adrStr)
//         // bn.toArrayLike(Buffer, 'le', 32).copy(instructionData, instructionDataPos); // Write data
//         // new BN(mints[index]).toArrayLike(Buffer, 'le', 32).copy(instructionData, instructionDataPos);

//         const bufMint = Buffer.from( mints[index], 'utf8');
//         const len = bufMint.byteLength;
//         console.debug(`${LOGPREFIX}len:${len} mints[${index}]: ${bufMint}`);


//         bufMint.copy(instructionData, instructionDataPos); // Write data

//         instructionDataPos += len; // ?
//       }

//       console.debug(`${LOGPREFIX}instructionData: ${instructionData.toString('hex')}`);

//       const instruction = new TransactionInstruction({
//         keys: [
//           { pubkey: userAccountPda, isSigner: false, isWritable: true },
//           { pubkey: userMintsAccountPda, isSigner: false, isWritable: true },
//           { pubkey: userBurnsAccountPda, isSigner: false, isWritable: true },
//           { pubkey: publicKey, isSigner: true, isWritable: false },
//           { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
//         ],
//         programId: POAP_ALYRA_PROGRAM_ID,
//         data: instructionData,
//       });
  
//       try {
//         const transaction = new Transaction().add(instruction);
//         return transaction;
//       } catch (error) {
//         if (error instanceof SendTransactionError) {
//           console.error(error.getLogs(connection));
//         }
//         return null;
//       }
//     } catch (error) {
//       console.error(error);
//       return null;
//     }
//   };
*/

const stringArrayToPublicKeyArray = (mints: string[]): PublicKey[] => {
  const LOGPREFIX = `${FILEPATH}:stringArrayToPublicKeyArray: `
  const publicKeyArray: PublicKey[] = [];
  try {
    console.debug(`${LOGPREFIX}mints:${mints}`);
    for (let index = 0; index < mints.length; index++) {
      const adrStr = mints[index];
      const publicKey = new PublicKey(adrStr);
      publicKeyArray.push(publicKey);
    }
  } catch (error) {
    console.error(`${LOGPREFIX}error: ${error}`);
  }
  console.debug(`${LOGPREFIX}publicKeyArray:${publicKeyArray}`);
  return publicKeyArray;
}