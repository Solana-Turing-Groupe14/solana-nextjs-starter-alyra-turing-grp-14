export async function loadMetaplexDependencies() {
    const [
      { createUmi },
      { walletAdapterIdentity },
      { mplTokenMetadata },
    ] = await Promise.all([
      import('@metaplex-foundation/umi-bundle-defaults'),
      import('@metaplex-foundation/umi-signer-wallet-adapters'),
      import('@metaplex-foundation/mpl-token-metadata'),
    ]);
  
    return { createUmi, walletAdapterIdentity, mplTokenMetadata };
  }