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

// Mint NFTs from a Candy Machine

export type mplhelp_T_MintNftCm_fromApp_Input =
  {
    candyMachineAddress: string,
    minterAddress: string,
  }

  export type mplhelp_T_MintNftCm =
  {
    candyMachineAddress: string
    // minterAddress: string,
    ownerPublicKey: MPL_T_PublicKey,
    umi: MPL_T_Umi,
  }

export type mplhelp_T_MintNftCm_fromWallet_Input =
{
  walletAdapter: MPL_T_WalletAdapter,
  candyMachineAddress: string,
}

export type mintFromCmFromAppResponseData =
| {
  success: true
  mintAddress: string
}
| {
  success: false
  error: string
};


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

interface I_ExpectedCandyMachineState {
  itemsLoaded: number;
  itemsRedeemed: number;
  authority: MPL_T_PublicKey;
  collection: MPL_T_PublicKey;
}


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

export type mplhelp_T_CmNftCollection_Params =
{
  itemsCount: number,
  mintFee: number,
  maxMintPerwallet: number,
  startDateTime: Date | null,
  endDateTime: Date | null,
}

export type mplhelp_T_CreateCmNftCollection_fromApp_Input =
  {
    collectionSigner: MPL_T_KeypairSigner,
    nftNamePrefix: string,
    metadataPrefixUri: string,
    cmNftCollectioNParams:mplhelp_T_CmNftCollection_Params,
  }

export type mplhelp_T_CreateCmNftCollection_fromWallet_Input =
  {
    walletAdapter: MPL_T_WalletAdapter,
    collectionSigner: MPL_T_KeypairSigner,
    nftNamePrefix: string,
    metadataPrefixUri: string,
    cmNftCollectioNParams:mplhelp_T_CmNftCollection_Params,
  }

export type mplhelp_T_CreateCmNftCollection_Input =
  {
    collectionSigner: MPL_T_KeypairSigner,
    nftNamePrefix: string,
    metadataPrefixUri: string,
    cmNftCollectioNParams:mplhelp_T_CmNftCollection_Params,
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


export type mplhelp_T_NameUri =
{
  name: string,
  uri: string,
}

export type mplhelp_T_NameUriArray =
{
  name: string,
  uri: string,
}[]


export type mplhelp_T_FinalizeCmNftCollectionConfig_fromApp_Input =
  {
    collectionSigner: MPL_T_KeypairSigner,
    candyMachineSigner: MPL_T_KeypairSigner,
    itemsCount: number,
    nameUriArray: mplhelp_T_NameUriArray,
    umi: MPL_T_Umi,
  }
export type mplhelp_T_FinalizeCmNftCollectionConfig_fromWallet_Input =
  {
    walletAdapter: MPL_T_WalletAdapter,
    collectionSigner: MPL_T_KeypairSigner,
    candyMachineSigner: MPL_T_KeypairSigner,
    itemsCount: number,
    nameUriArray: mplhelp_T_NameUriArray,
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
    nameUriArray: mplhelp_T_NameUriList,
    metadataPrefixUri: string,
    cmNftCollectioNParams:mplhelp_T_CmNftCollection_Params,
  }

type mplhelp_T_CreateCompleteNftCollectionCmConfig_Result =
  mplhelp_T_FinalizeCmNftCollectionConfig_Result

export type T_CreateCompleteCollectionCmConfigInputData = {
  collectionName: string,
  collectionDescription: string,
  collectionUri: string,
  nftNamePrefix: string,
  metadataPrefixUri: string|null|undefined,
  nameUriArray: mplhelp_T_NameUriList,
  cmNftCollectioNParams:mplhelp_T_CmNftCollection_Params,
}

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


interface I_QrCode {
  text: string,
  id: string, 
}
