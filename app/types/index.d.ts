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


export type mplhelp_T_CreateCMNftCollectionResult =
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

export type mplhelp_T_CreateFullNftCollectionInput =
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

// Creates a NFT collection

export type mplhelp_T_CreateNftCollection_fromApp_Input =
  {
    collectionName: string,
    collectionUri: string,
  }

export type mplhelp_T_CreateNftCollection_fromWallet_Input =
  {
    walletAdapter: MPL_T_WalletAdapter,
    collectionName: string,
    collectionUri: string,
  }

export type mplhelp_T_CreateNftCollection_Input =
  {
    collectionName: string,
    collectionUri: string,
    umi: MPL_T_Umi,
  }

export type mplhelp_T_CreateNftCollection_Result =
  | {
    success: true
    collectionAddress: string,
    collectionSigner: _collectionSigner,
  }
  | {
    success: false
    error: string
  };

// Creates a Candy Machine NFT collection

export type mplhelp_T_CreateCmNftCollection_fromApp_Input =
  {
    // collectionAddress: string,
    collectionSigner: MPL_T_KeypairSigner,
    nftNamePrefix: string,
    itemsCount: number,
    metadataPrefixUri: string,
    startDateTime: Date | null,
    endDateTime: Date | null,
  }

export type mplhelp_T_CreateCmNftCollection_fromWallet_Input =
  {
    walletAdapter: MPL_T_WalletAdapter,
    // collectionAddress: string,
    collectionSigner: MPL_T_KeypairSigner,

    nftNamePrefix: string,
    itemsCount: number,
    metadataPrefixUri: string,
    startDateTime: Date | null,
    endDateTime: Date | null,
  }

export type mplhelp_T_CreateCmNftCollection_Input =
  {
    collectionSigner: MPL_T_KeypairSigner,

    nftNamePrefix: string,
    itemsCount: number,
    metadataPrefixUri: string,
    startDateTime: Date | null,
    endDateTime: Date | null,

    umi: MPL_T_Umi,
  }

export type mplhelp_T_CreateCmNftCollection_Result =
  | {
    success: true
    candyMachineAddress: string,
    candyMachineSigner: MPL_T_KeypairSigner,
  }
  | {
    success: false
    error: string
  };


// Finalises/completes/updates a Candy Machine NFT collection

export type mplhelp_T_FinalizeCmNftCollectionConfig_fromApp_Input =
  {
    collectionSigner: MPL_T_KeypairSigner,
    candyMachineSigner: MPL_T_KeypairSigner,
    itemsCount: number,
    umi: MPL_T_Umi,
  }
export type mplhelp_T_FinalizeCmNftCollectionConfig_fromWallet_Input =
  {
    walletAdapter: MPL_T_WalletAdapter,
    collectionSigner: MPL_T_KeypairSigner,
    candyMachineSigner: MPL_T_KeypairSigner,
    itemsCount: number,
  }

export type mplhelp_T_FinalizeCmNftCollectionConfig =
  mplhelp_T_FinalizeCmNftCollectionConfig_fromApp_Input



export type mplhelp_T_FinalizeCmNftCollectionConfig_Result =
  | {
    success: true
    collectionAddress: string
    candyMachineAddress: string,
  }
  | {
    success: false
    error: string
  };

// Create an entire NFT collection / Candy Machine NFT collection

export type mplhelp_T_CreateCompleteNftCollectionCmConfig_Input =
  {
    collectionName: string,
    collectionUri: string,
    nftNamePrefix: string,
    metadataPrefixUri: string,
    itemsCount: number,
    startDateTime: Date | null,
    endDateTime: Date | null,
  }

type mplhelp_T_CreateCompleteNftCollectionCmConfig_Result =
  mplhelp_T_FinalizeCmNftCollectionConfig_Result


  export type CreateCompleteCollectionCmConfigResponseData =
  | {
    success: true
    collectionAddress: string
    candyMachineAddress: string,
  }
  | {
    success: false
    error: string
  };

export type T_CreateCompleteCollectionCmConfigInputData = {
  collectionName: string,
  collectionDescription: string,
  collectionUri: string,
  nftNamePrefix: string,
  metadataPrefixUri: string,
  itemsCount: number,
  startDateTime: Date | null,
  endDateTime: Date | null,
}

// Mint NFTs from a Candy Machine
// TODO