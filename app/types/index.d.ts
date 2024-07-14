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
