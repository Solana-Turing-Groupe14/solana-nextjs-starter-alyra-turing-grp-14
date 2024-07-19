/* eslint-disable @next/next/no-img-element */
import { Link } from '@chakra-ui/next-js'
// import { Button, Stack, Switch, useColorMode } from '@chakra-ui/react'
import { useColorMode } from '@chakra-ui/react'
// import { IconButton } from "./ui/icon-button"
import { IconButton } from '@chakra-ui/react'
import { useWallet } from '@solana/wallet-adapter-react';
import { /* MenuIcon, */ Moon, Sun } from "lucide-react"
// import { useRouter } from "next/router"
// import { cn } from "@clement-utils/cn"
import { useEffect, useState } from 'react';
import ConnectWalletButton from "@components/connect-wallet-button"
import { siteConfig } from "@config/site"
import { getSolanaBalance } from '@helpers/solana.helper';
import Balance from './balance'
import { Typography } from "../ui/typography"

const MenuItems = [
  {
    text: "Home",
    href: "/",
  },
  {
    text: "Create Collection",
    href: "/createCollection",
  },
  {
    text: "Mint",
    href: "/mint/",
  },
  {
    text: "Tools",
    href: "/tools",
  },
  // {
  //   text: "About",
  //   href: "/about",
  // },
  // {
  //   text: "Clément",
  //   href: "/ClementApp",
  // },
  // {
  //   text: "Transfer",
  //   href: "/transfer",
  // },
  // {
  //   text: "Card",
  //   href: "/card",
  // },
]

// type headerParams = {
//   // colorMode: string;
//   // toggleColorMode: () => void;
//   // wallet: WalletContextState;
//   // solanaBalance: number | null;
//   refreshBalance: () => void;
// }

// export default function Header( { headerParams }: { headerParams: any } ) {
export default function Header( ) {
  // const { asPath } = useRouter()
  const { colorMode, toggleColorMode } = useColorMode()
    const wallet = useWallet();
  const [solanaBalance, setSolanaBalance] = useState<number | null | undefined>(null);

  const BALANCE_UPDATE_INTERVAL = 10_000

  useEffect(() => {
    let interval = null
    if (wallet.publicKey) {
      // console.debug(`header.tsx: wallet.publicKey=${wallet.publicKey.toBase58()}`);
      getSolanaBalance(wallet.publicKey.toBase58())
        .then((balance) => { /* console.debug(`header.tsx: balance=${balance}`) ; */ setSolanaBalance(balance)})
        .catch((err) => { console.error(`header.tsx: getSolanaBalance error: ${err}`); } );
        // Update balance every n seconds
        interval = setInterval(() => {
          if (wallet.publicKey) {
            getSolanaBalance(wallet.publicKey.toBase58())
            .then((balance) => { /* console.debug(`header.tsx: balance=${balance}`) ; */ setSolanaBalance(balance)})
            .catch((err) => { console.error(`header.tsx: getSolanaBalance error: ${err}`); } );
          }
        }, BALANCE_UPDATE_INTERVAL)

    } else {
      setSolanaBalance(null);
    }
      // cleanup
      return () => {
      if (interval) clearInterval(interval)
      }
  }, [wallet.publicKey, ]);

  return (
    <header className="fixed left-0 top-0 z-20 w-full border-b border-gray-200">
      <div className="container mx-auto flex items-center p-4 md:px-6">

        <div className='items-start mx-1 '>
          <IconButton
                isRound={true}
                variant='solid'
                colorScheme='teal'
                aria-label='Switch Theme'
                fontSize='20px'
                icon={ colorMode === 'light' ? <Moon /> : <Sun />}
                onClick={toggleColorMode}
              />
        </div>


        <a href="/" className="flex items-center">
          <img src="/assets/logo.png" className="mr-3 h-8" alt={siteConfig.name} />
          <Typography as="span" level="h6" className="hidden whitespace-nowrap font-semibold md:inline-block">
            {siteConfig.name}
          </Typography>
        </a>

        <ul className="ml-10 hidden items-center gap-6 md:flex">
          {MenuItems.map((item) => (
            <li key={item.text}>
{/* 
               <Link
                href={item.href}
                className={cn("text-gray-600 hover:underline", {
                  "text-gray-900": item.href === "/" ? asPath === item.href : asPath.startsWith(item.href),
                })}
              >
                <Typography level="body4" className="font-semibold">
                  {item.text}(TW)
                </Typography>
              </Link>
              <br/>
               <Link
                href={item.href}
                color='blue.400' _hover={{ color: 'blue.500' }}
               >
                <Typography level="body4" className="font-semibold">
                  {item.text}(Chakra)
                </Typography>
              </Link>

*/}
               <Link
                href={item.href}
                color='blue.400' _hover={{ color: 'blue.500' }}
               >
                <Typography level="body4" className="font-semibold">
                  {item.text}
                </Typography>
              </Link>

            </li>
          ))}
        </ul>

        <div className="flex flex-1 items-center justify-end gap-2">
          <ConnectWalletButton />
          <Balance balance={solanaBalance} />
{/*           <IconButton className="md:hidden">
            <MenuIcon />
          </IconButton>
 */}
{/* 
          <Button onClick={toggleColorMode}>
            Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
          </Button>
          <Stack direction='row'>
            <Switch colorScheme='blue' onChange={toggleColorMode}/>
            <Switch colorScheme='blue' size='lg' onChange={toggleColorMode}/>
          </Stack>
 */}
{/* 
           <IconButton
            isRound={true}
            variant='solid'
            colorScheme='teal'
            aria-label='Switch Theme'
            fontSize='20px'
            icon={ colorMode === 'light' ? <Moon /> : <Sun />}
            onClick={toggleColorMode}
          />
 */}
         </div>
      </div>
    </header>
  )
}
