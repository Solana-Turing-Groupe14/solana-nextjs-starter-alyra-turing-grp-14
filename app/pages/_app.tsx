import { ChakraProvider } from '@chakra-ui/react'
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { clusterApiUrl } from "@solana/web3.js"
import type { AppProps } from "next/app"
import { DefaultSeo } from "next-seo"
import type { FC } from "react"
import React, { useMemo } from "react"
import RootLayout from "@components/layout"
import { siteConfig } from "@config/site"

// Use require instead of import since order matters
require("@solana/wallet-adapter-react-ui/styles.css")
require("../styles/globals.css")

require("../styles/clement/clement-app.css") // Clement's global style

const App: FC<AppProps> = ({ Component, pageProps }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  )


  return (
    <>
      <DefaultSeo
        title={siteConfig.name}
        openGraph={{
          type: "website",
          locale: "en_EN",
          description: siteConfig.description,
          site_name: siteConfig.name,
          title: siteConfig.name,
        }}
        description={siteConfig.description}
      />
      <ChakraProvider>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <RootLayout>
                <Component {...pageProps} />
              </RootLayout>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ChakraProvider>
    </>
  )
}

export default App
