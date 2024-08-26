// CardExample.jsx 
import { 
	Box, 
	Card, 
	CardBody, 
	CardFooter, 
	CardHeader, 
	Heading, 
	Text, 
} from "@chakra-ui/react"; 
import React, { useEffect, useState } from "react"; 
import { getPoapAlyraUserAccounts } from '@helpers/poap_alyra.helper'
import { useWallet } from "@solana/wallet-adapter-react"
import {
  pa_help_T_poapAlyraAccounts
} from 'types';


const UserData = () => { 

	const [darkTheme,] = useState(true); 
	const [userAccounts, setUserAccounts] = useState<pa_help_T_poapAlyraAccounts|null|undefined>(null);
	const wallet = useWallet()

	useEffect(() => {
    const init = async () => {
			if (wallet.connected && wallet.publicKey) {
				const accounts = await getPoapAlyraUserAccounts(wallet.publicKey);
				setUserAccounts(accounts);
			}
    } // init
		init();
	}, [wallet]);

	return ( 
		<Box 
			rounded={"xl"} 
			// eslint-disable-next-line tailwindcss/no-custom-classname
			className={`p-auto bottom-20 shadow-xl shadow-orange-600 duration-300 ease-in-out`} 
		> 
			<Card 
				rounded={"xl"} 
				align="center"
				bg={darkTheme ? "black" : "white"} 
				// eslint-disable-next-line tailwindcss/no-custom-classname
				className={`box `} 
			> 
				<CardHeader> 
					<Heading 
						size="xl"
						className={darkTheme ? 
							` text-cyan-300 ` : `text-cyan-600`} 
					> 
						User Data
					</Heading> 
				</CardHeader> 
				<CardBody> 
					<Text 
						className={darkTheme ? 
							` p-2 text-cyan-300` : `p-2 text-cyan-600`} 
					> 
						User {userAccounts?.userAccount?.owner.toBase58()}
					</Text> 
					<Text 
						className={darkTheme ? 
							` p-2 text-cyan-300` : `p-2 text-cyan-600`} 
					> Mints :
						{userAccounts?.userMintsAccount?.listMinted &&

							<ul>
								{userAccounts?.userMintsAccount?.listMinted.map(mint => (<li key={mint.toBase58()}>{mint.toBase58()}</li>))} 
							</ul>

						}
					</Text> 
				</CardBody> 
				<CardFooter> 
				</CardFooter> 
			</Card> 
		</Box> 
	); 
}; 

export default UserData;
