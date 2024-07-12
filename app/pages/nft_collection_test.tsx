import { Button } from "@chakra-ui/react"
import { Typography } from "@components/ui/typography"

import {main} from "@helpers/nft_collection_test"

export default function HomePage() {

  const mint = async () => {

    // if (!publicKey) throw new WalletNotConnectedError()

    try {
      main()
    } catch (error) {
      console.error(error)
    } finally {
    }
  }

  return (
    <div className="mx-auto my-20 flex w-full max-w-md flex-col gap-6 rounded-2xl p-6">
      <Typography as="h2" level="h6" className="font-bold">
        Mint nft collection test
      </Typography>
      <div className="flex flex-col gap-4 ">
        <Button
          disabled={false}
          onClick={mint}
          colorScheme='blue'
        >
          Mint
        </Button>
      </div>
    </div>
  )
}
