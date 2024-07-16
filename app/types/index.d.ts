// import { mintNftFromCM } from "@helpers/mplx.helpers"

export type SiteConfig = {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    twitter: string
    github: string
  }
}

export type AirdropResponseData =
  | {
    success: true
    // message: string
    amount: number,
    address: string
  }
  | {
    success: false
    error: string
  };

export type CollectionCreationResponseData =
  | {
    success: true
    address: string
  }
  | {
    success: false
    error: string
  };


export type mplhelp_T_AirdropResult =
  | {
    success: true
    amount: number
  }
  | {
    success: false
    error: string
  };



export type mplhelp_T_CreateCollectionResult =
  | {
    success: true
    address: string
  }
  | {
    success: false
    error: string
  };


export type mplhelp_T_CreateNftCollectionResult =
  | {
    success: true
    collectionAddress: string
    candyMachineAddress: string
  }
  | {
    success: false
    error: string
  };

export type mplhelp_T_MintNftCMInput =
  {
    walletAdapter: MPL_T_WalletAdapter,
    candyMachineAddress: string,
    collectionAddress: string,
  }

export type mplhelp_T_MintNftCMResult =
  | {
    success: true
    mintAddress: string
  }
  | {
    success: false
    error: string
  };

export type mplhelp_T_CreateMyFullNftCollectionInput =
  {
    walletAdapter: MPL_T_WalletAdapter,
    collectionName: string,
    collectionUri: string,
    nftNamePrefix: string,
    itemsCount: number,
    metadataPrefixUri: string,
    startDateTime: Date | null,
    endDateTime: Date | null,
    // umi:MPL_T_Umi,
  }

// export type mplhelp_T_CheckBalanceError =
// | {
//   missingPublicKey: true
// }
// | {
//   missingPublicKey: false
//   minBalance: MPL_T_SolAmount
//   balance: MPL_T_SolAmount
// };


// export type mplhelp_T_CheckBalanceResult =
//   | {
//     success: true
//   }
//   | {
//       success: false
//       error: mplhelp_T_CheckBalanceError
//     }
