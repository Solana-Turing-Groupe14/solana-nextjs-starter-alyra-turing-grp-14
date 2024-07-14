// MetaPlex TypeScript types, plugins and functions
// prefixes: MPL_
// MPL_f_ - MetaPlex functions
// MPL_P_ - MetaPlex plugins
// MPL_T_ - MetaPlex types

import {
  createCollectionV1 as MPL_f_createCollectionV1,
} from '@metaplex-foundation/mpl-core';
import {
  createSignerFromKeypair as MPL_f_createSignerFromKeypair,
  generateSigner as MPL_f_generateSigner,
  isSigner as MPL_f_isSigner,
  publicKey as MPL_f_publicKey,
  sol as MPL_f_sol,
  Keypair as MPL_Keypair,
  keypairIdentity as MPL_P_KeypairIdentity,
  KeypairSigner as MPL_T_KeypairSigner,
  PublicKey as MPL_T_PublicKey,
  SolAmount as MPL_T_SolAmount,
  Umi as MPL_T_Umi,
  TransactionBuilderSendAndConfirmOptions
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
  MPL_f_sol,
  MPL_f_createSignerFromKeypair,
  MPL_f_publicKey,
  MPL_f_createCollectionV1,
  MPL_f_generateSigner,
  MPL_f_isSigner,
  MPL_P_walletAdapterIdentity,
  MPL_P_walletAdapterPayer,
};
export type {
  MPL_Keypair,
  MPL_T_KeypairSigner,
  MPL_T_PublicKey,
  MPL_T_SolAmount,
  MPL_T_Umi,
  MPL_T_WalletAdapter,
};

