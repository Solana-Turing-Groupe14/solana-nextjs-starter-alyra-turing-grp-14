
import {
  sol as MPL_SOL,
  TransactionBuilderSendAndConfirmOptions
} from '@metaplex-foundation/umi';

const MPL_OPTIONS: TransactionBuilderSendAndConfirmOptions = {
  send: { skipPreflight: true },
  confirm: { commitment: 'processed' }
};

export {
  MPL_OPTIONS,
  MPL_SOL
}