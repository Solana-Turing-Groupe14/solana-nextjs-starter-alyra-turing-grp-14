// CardExample.jsx 
import { 
	Box, 
	Button, 
	Card, 
	CardBody, 
	CardFooter, 
	CardHeader, 
	Heading, 
	Text, 
} from "@chakra-ui/react"; 
import React, { useEffect, useState } from "react"; 

const CardExample = () => { 
	const [transformCount, setTransformCount] = useState(1); 
	const [transformText, setTransformText] = useState(""); 

	useEffect(() => { 
		changeTransfrom(); 
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [transformCount]); 

	const changeTransfrom = () => { 
		if (transformCount > 4) { 
			setTransformCount(1); 
		} 
		switch (transformCount) { 
			case 1: 
				setTransformText("hover:rotate-6"); 
				break; 

			case 2: 
				setTransformText("hover:scale-105"); 
				break; 

			case 3: 
				setTransformText("hover:skew-x-12"); 
				break; 

			case 4: 
				setTransformText("hover:skew-y-12"); 
				break; 

			default: 
				setTransformText("hover:translate-x-12"); 
		} 
	}; 
	const [darkTheme, setDarkTheme] = useState(true); 
	console.log(transformText); 
	return ( 
		<Box 
			rounded={"xl"} 
			// eslint-disable-next-line tailwindcss/no-custom-classname
			className={`p-auto shadow-xl ${transformText} shadow-orange-600 bottom-20 duration-300 ease-in-out`} 
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
						GFG Tailwind Chakra Combination 
					</Heading> 
				</CardHeader> 
				<CardBody> 
					<Text 
						className={darkTheme ? 
							` text-cyan-300 p-2` : `text-cyan-600 p-2`} 
					> 
						You can use both chakraui and tailwind to 
						gather for styling the webpages. 
					</Text> 
					<Text 
						className={darkTheme ? 
							` text-cyan-300 p-2` : `text-cyan-600 p-2`} 
					> 
						This card is made using both the ChakraUI and 
						Tailwind CSS 
					</Text> 
				</CardBody> 
				<CardFooter> 
					<Button 
						color={darkTheme ? "cyan.300" : "blue"} 
						colorScheme={darkTheme ? "green" : "teal"} 
						onClick={() => { 
							setDarkTheme(!darkTheme); 
						}} 
					> 
						{darkTheme ? "light" : "dark"} 
					</Button> 
					<Button 
						color={darkTheme ? "cyan.300" : "blue"} 
						colorScheme={darkTheme ? "green" : "teal"} 
						onClick={() => { 
							setTransformCount(transformCount + 1); 
						}} 
					> 
						{transformCount} 
					</Button> 
				</CardFooter> 
			</Card> 
		</Box> 
	); 
}; 

export default CardExample;
