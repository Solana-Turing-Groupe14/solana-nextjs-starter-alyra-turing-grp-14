import { BN, Idl, Program } from "@coral-xyz/anchor";
import { AnchorWallet, WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SendTransactionError, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { sign } from 'tweetnacl';
import { IDL, USER_ACCOUNT_SEED, USER_DATA_PROGRAM_ID } from "../imports/consts";

if (!process.env.NEXT_PUBLIC_RPC_URL) {
    throw new Error("NEXT_PUBLIC_RPC_URL is required");
}
// console.log('NEXT_PUBLIC_RPC_URL', process.env.NEXT_PUBLIC_RPC_URL);

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "", "confirmed");
// Use @coral-xyz/anchor 0.29.0
// do not update to 0.30+ version (breaking changes) until solpg allows exporting new IDL format, see below:
// https://www.anchor-lang.com/release-notes/0.30.0#account-resolution
// https://solana.stackexchange.com/questions/13076/anchor-idl-different-incorrect-from-solana-playground-idl-generated
const program = new Program<Idl>(IDL as Idl, USER_DATA_PROGRAM_ID, {
  connection,
});

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
if (RPC_URL === undefined) {
  throw new Error('RPC_URL not found')
}

export async function getSolanaBalance(publicKey: string): Promise<number|undefined> {
  try {
    const balanceInLamports = await connection.getBalance(new PublicKey(publicKey));
    const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;
    return balanceInSol;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export const getWalletAuthentication = async (wallet: WalletContextState, message: string): Promise<Uint8Array | null> => {
    try {
      const messageEncoded = new TextEncoder().encode(`${message}`);
      if (!wallet.signMessage) {
        console.error('The wallet does not support message signing');
        return null;
      }
      return await wallet.signMessage(messageEncoded);
    } catch (error) {
      console.error(error);
      return null;
    }
};

export const verifyEncodedMessage = async (wallet: WalletContextState, message: string, encodedMessage: Uint8Array): Promise<boolean> => {
    try {
      if (!wallet.publicKey) {
        console.error('Wallet not connected');
        return false;
      }
      const messageEncoded = new TextEncoder().encode(`${message}`);

      return sign.detached.verify(messageEncoded, encodedMessage, wallet.publicKey.toBytes());
    } catch (error) {
      console.error(error);
      return false;
    }
};

export const getRecentBlockhash = async (): Promise<string | null> => {
    try {
      return (await connection.getLatestBlockhash()).blockhash;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

export const transferSolana = async (wallet: WalletContextState, destination: PublicKey, amount: number): Promise<string | null> => {
    try {
        if (!wallet.publicKey || !wallet.signTransaction) return null;
      const recentBlockhash = await getRecentBlockhash();
      const transferTransaction = new Transaction();

      // JUST FOR TESTING THE SIZE OF THE TRANSACTION
    //   if (!recentBlockhash) return null;
    //   transferTransaction.feePayer = wallet.publicKey;
    //   transferTransaction.recentBlockhash = recentBlockhash;
    //   console.log(transferTransaction.serialize({ requireAllSignatures: false }).byteLength);

      const transfer = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: destination,
        lamports: amount * LAMPORTS_PER_SOL
      });

      transferTransaction.add(transfer);

      if (transferTransaction && recentBlockhash) {
        transferTransaction.feePayer = wallet.publicKey;
        transferTransaction.recentBlockhash = recentBlockhash;
        const signedTransaction = await wallet.signTransaction(transferTransaction);
        return await connection.sendRawTransaction(signedTransaction.serialize());
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
};

// export const initializeAccount = async (anchorWallet: AnchorWallet, data: number, age: number): Promise<string | null> => {
export const initializeAccount = async (anchorWallet: AnchorWallet, data: number, age: number, taille: number): Promise<string | null> => {
    try {
      console.debug(`initializeAccount data:${data} age:${age} taille:${taille}`);

      // const accountTransaction = await getInitializeAccountTransactionWWithoutAnchor(anchorWallet.publicKey, new BN(data), new BN(age));
      const accountTransaction = await getInitializeAccountTransaction(anchorWallet.publicKey, new BN(data), new BN(age), new BN(taille));

      console.debug(`initializeAccount: accountTransaction=${JSON.stringify(accountTransaction)}`);

      const recentBlockhash = await getRecentBlockhash();
      if (accountTransaction && recentBlockhash) {
          accountTransaction.feePayer = anchorWallet.publicKey;
          accountTransaction.recentBlockhash = recentBlockhash;
          console.debug('initializeAccount: anchorWallet.signTransaction');

          try {
            const signedTransaction = await anchorWallet.signTransaction(accountTransaction);
            console.debug('initializeAccount: signedTransaction', signedTransaction);
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
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
};

export const getAccount = async (publicKey: PublicKey): Promise<any> => {
    try {
      // console.debug('getAccount', publicKey.toBase58());
      // const accountSeed = Buffer.from("account");

      const [accountPda] = PublicKey.findProgramAddressSync(
        [
          USER_ACCOUNT_SEED, // accountSeed,
          publicKey.toBuffer()
        ],
        new PublicKey(USER_DATA_PROGRAM_ID.toString())
      );
      // const fetchAccountPromise = await program.account.newAccount.fetch(accountPda);
      const fetchAccountPromise = await program.account.userData.fetch(accountPda);
      // console.debug('fetchAccountPromise', JSON.stringify( (fetchAccountPromise) ) );
      return fetchAccountPromise
    } catch (error) {
      console.error(error);
      return null;
    }
};

// export const getInitializeAccountTransaction = async (publicKey: PublicKey, data: BN, age: BN): Promise<Transaction | null> => {
export const getInitializeAccountTransaction = async (publicKey: PublicKey, data: BN, age: BN, taille: BN): Promise<Transaction | null> => {
    try {
      console.debug(`getInitializeAccountTransaction publicKey:${publicKey} data:${data} age:${age} taille:${taille}`);
      // const accountSeed = Buffer.from("account");
      const [accountPda] = PublicKey.findProgramAddressSync(
        [
          USER_ACCOUNT_SEED, // accountSeed,
          publicKey.toBuffer()
        ],
        new PublicKey(USER_DATA_PROGRAM_ID.toString())
      );
      console.debug(`getInitializeAccountTransaction accountPda:${accountPda}`);
      // return await program.methods.initialize(data, age, taille) // additonal parameter: taille
      return await program.methods.initialize(data, age)
        .accounts({
          // newAccount: accountPda,
          userData: accountPda,
          signer: publicKey,
            systemProgram: SystemProgram.programId
        })
        .transaction()
      } catch (error) {
        console.error(error);
        alert('Error: ' + error);
        return null;
      }
};

export const getInitializeAccountTransactionWWithoutAnchor = async (publicKey: PublicKey, data: BN, age: BN, taille: BN): Promise<Transaction | null> => {
    try {

      console.debug(`getInitializeAccountTransactionWWithoutAnchor publicKey:${publicKey} data:${data} age:${age} taille:${taille}`);

      const accountSeed = Buffer.from("account");
      const [accountPda] = PublicKey.findProgramAddressSync(
        [
          accountSeed, 
          publicKey.toBuffer()
        ], 
        new PublicKey(USER_DATA_PROGRAM_ID.toString())
      );
  
      // u64 u16 u8
      // 8 2 1
      const instructionLength = 8+2+1;
      const instructionData = Buffer.alloc(instructionLength); // Adjust size as needed
      instructionData.writeUInt8(0, 0); // This is the "initialize" instruction index
      data.toArrayLike(Buffer, 'le', 8).copy(instructionData, 1); // Write data
      age.toArrayLike(Buffer, 'le', 2).copy(instructionData, 9); // Write age
      // taille.toArrayLike(Buffer, 'le', 1).copy(instructionData, 11); // Write taille
      // taille.toArrayLike(Buffer, 'le', 1).copy(instructionData, 11); // Write taille
  
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: accountPda, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: new PublicKey(USER_DATA_PROGRAM_ID.toString()),
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

  //

  export const getTxUri = (_txId: string): string | null => {
    try {

      console.debug(`app/helpers/solana.helper.ts: getTxUri txId:${_txId}`);
      if (!_txId) return null;

      const url = `${process.env.NEXT_PUBLIC_EXPLORER_URL_BASE}${process.env.NEXT_PUBLIC_EXPLORER_URL_ADDRESS}${_txId}${process.env.NEXT_PUBLIC_EXPLORER_URL_TRANSACTIONS}${process.env.NEXT_PUBLIC_EXPLORER_URL_CLUSTER}`;
      return url;

    } catch (error) {
      console.error(error);
      return null;
    }
  }

  //

  export const getAddressUri = (_address: string): string | null => {
    try {

      console.debug(`app/helpers/solana.helper.ts: getTxUri txId:${_address}`);
      if (!_address) return null;

      const url = `${process.env.NEXT_PUBLIC_EXPLORER_URL_BASE}${process.env.NEXT_PUBLIC_EXPLORER_URL_ADDRESS}${_address}${process.env.NEXT_PUBLIC_EXPLORER_URL_CLUSTER}`;
      return url;

    } catch (error) {
      console.error(error);
      return null;
    }
  }
