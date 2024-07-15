// MetaPlex TypeScript types, plugins and functions
// prefixes: MPL_
// MPL_F_ - MetaPlex functions
// MPL_P_ - MetaPlex plugins
// MPL_T_ - MetaPlex types
// MPL_C - MetaPlex consts
// MPL_CLS - MetaPlex class

  import {
  createCollectionV1 as MPL_F_createCollectionV1,
} from '@metaplex-foundation/mpl-core';
import {
  emptyDefaultGuardSetArgs as MPL_C_emptyDefaultGuardSetArgs,
  addConfigLines as MPL_F_addConfigLines,
  create as MPL_F_create,
  deleteCandyMachine as MPL_F_deleteCandyMachine,
  fetchCandyMachine as MPL_F_fetchCandyMachine,
  mintV1 as MPL_F_mintV1,
  GuardSetArgs as MPL_T_GuardSetArgs,
} from '@metaplex-foundation/mpl-core-candy-machine';
import {
  setComputeUnitLimit as MPL_F_setComputeUnitLimit,
}
from '@metaplex-foundation/mpl-toolbox';
import {
  createSignerFromKeypair as MPL_F_createSignerFromKeypair,
  generateSigner as MPL_F_generateSigner,
  isSigner as MPL_F_isSigner,
  publicKey as MPL_F_publicKey,
  sol as MPL_F_sol,
  some as MPL_F_some,
  transactionBuilder as MPL_F_transactionBuilder,
  Keypair as MPL_Keypair,
  keypairIdentity as MPL_P_KeypairIdentity,
  KeypairSigner as MPL_T_KeypairSigner,
  PublicKey as MPL_T_PublicKey,
  SolAmount as MPL_T_SolAmount,
  Umi as MPL_T_Umi,
  TransactionBuilderSendAndConfirmOptions,
} from '@metaplex-foundation/umi';
import {
  walletAdapterIdentity as MPL_P_walletAdapterIdentity,
  walletAdapterPayer as MPL_P_walletAdapterPayer,
  WalletAdapter as MPL_T_WalletAdapter,
} from "@metaplex-foundation/umi-signer-wallet-adapters";

const MPL_TX_BUILDR_OPTIONS: TransactionBuilderSendAndConfirmOptions = {
  send: { skipPreflight: true },
  confirm: { commitment: 'processed' }
};

export {
  MPL_TX_BUILDR_OPTIONS,
  MPL_P_KeypairIdentity,
  MPL_F_sol,
  MPL_F_createSignerFromKeypair,
  MPL_F_publicKey,
  MPL_F_createCollectionV1,
  MPL_F_generateSigner,
  MPL_F_isSigner,
  MPL_P_walletAdapterIdentity,
  MPL_P_walletAdapterPayer,
  MPL_C_emptyDefaultGuardSetArgs,
  MPL_F_some,
  MPL_F_addConfigLines,
  MPL_F_fetchCandyMachine,
  MPL_F_create,
  MPL_F_transactionBuilder,
  MPL_F_setComputeUnitLimit,
  MPL_F_mintV1,
  MPL_F_deleteCandyMachine,
};
export type {
  MPL_Keypair,
  MPL_T_KeypairSigner,
  MPL_T_PublicKey,
  MPL_T_SolAmount,
  MPL_T_Umi,
  MPL_T_WalletAdapter,
  MPL_T_GuardSetArgs,
};

