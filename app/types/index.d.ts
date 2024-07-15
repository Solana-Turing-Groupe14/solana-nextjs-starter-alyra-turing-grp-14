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
      // mintAddress: string
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

  // type mplhelp_T_MintNftCMInput = Parameters<typeof mintNftFromCM>


  export type mplhelp_T_MintNftCMResult =
  | {
      success: true
      mintAddress: string
    }
  | {
      success: false
      error: string
    };