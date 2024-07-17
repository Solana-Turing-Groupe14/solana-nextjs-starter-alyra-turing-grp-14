import { createCollectionV1 } from '@metaplex-foundation/mpl-core';
import {
    addConfigLines, create,
    deleteCandyMachine,
    fetchCandyMachine,
    GuardSetArgs,
    mintV1,
    // mplCandyMachine as mplCoreCandyMachine,
} from "@metaplex-foundation/mpl-core-candy-machine";
import { setComputeUnitLimit } from '@metaplex-foundation/mpl-toolbox';
import {
    // dateTime,
    generateSigner,
    keypairIdentity,
    PublicKey,
    // sol,
    some,
    transactionBuilder,
    // TransactionBuilderSendAndConfirmOptions,
    Umi
} from '@metaplex-foundation/umi';
import { MPL_F_sol, MPL_TX_BUILDR_OPTIONS } from '@helpers/mtplx.exports.exports';


// import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
// import { RPC_URL } from '@helpers/solana.helper';

// import { TESTkeyPair } from '@helpers/solana.helper';


import { getUmi } from './mplx.helpers';
// import { CandyGuardDataArgs } from '@metaplex-foundation/mpl-core-candy-machine/dist/src/hooked/candyGuardData.d';

// const someRandomSecretKey_ = [40,  93,  83,  37,  31,  65,  52,  11,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19,  27,  92,  99,  33,  45,  97,  74,  19]

// export const TESTkeyPair_ = Keypair.fromSecretKey(new Uint8Array(
//     someRandomSecretKey_
//   ));

// TODO .env
// const uriURI = '#http://127.0.0.1:8899';
// const umi = createUmi(uriURI).use(mplCoreCandyMachine());
// const uriURI=RPC_URL

/*
// const umi = createUmi(RPC_URL).use(mplCoreCandyMachine());
const umi = getUmi();

// Create a keypair from your private key
// const TESTkeyPair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKey))
const TESTkeyPair = await getKeyPair('random Key , TODO')

// TODO .env
// const keypair = generateSigner(umi);
const keypair = createSignerFromKeypair( umi, TESTkeyPair )
const collectionMint_Signer = generateSigner(umi);
// const collectionMint_Signer = generateSigner(umi);
const treasury_Signer = generateSigner(umi);
// const treasury_Signer = generateSigner(umi);
const candyMachine = generateSigner(umi);
// const candyMachine = generateSigner(umi);

umi.use(keypairIdentity(keypair));
*/
// const options: TransactionBuilderSendAndConfirmOptions = {
//     send: { skipPreflight: true },
//     confirm: { commitment: 'processed' }
// };


interface ExpectedCandyMachineState {
    itemsLoaded: number;
    itemsRedeemed: number;
    authority: PublicKey;
    collection: PublicKey;
}

async function checkCandyMachine(
    umi: Umi,
    candyMachine: PublicKey,
    expectedCandyMachineState: ExpectedCandyMachineState,
    step?: number
) {
    try {
        const loadedCandyMachine = await fetchCandyMachine(umi, candyMachine, MPL_TX_BUILDR_OPTIONS.confirm);
        const { itemsLoaded, itemsRedeemed, authority, collection } = expectedCandyMachineState;
        if (Number(loadedCandyMachine.itemsRedeemed) !== itemsRedeemed) {
            throw new Error('Incorrect number of items available in the Candy Machine.');
        }
        if (loadedCandyMachine.itemsLoaded !== itemsLoaded) {
            throw new Error('Incorrect number of items loaded in the Candy Machine.');
        }
        if (loadedCandyMachine.authority.toString() !== authority.toString()) {
            throw new Error('Incorrect authority in the Candy Machine.');
        }
        if (loadedCandyMachine.collectionMint.toString() !== collection.toString()) {
            throw new Error('Incorrect collection in the Candy Machine.');
        }
        step && console.log(`${step}. ✅ - Candy Machine has the correct configuration.`);
    } catch (error) {
        if (error instanceof Error) {
            step && console.log(`${step}. ❌ - Candy Machine incorrect configuration: ${error.message}`);
        } else {
            step && console.log(`${step}. ❌ - Error fetching the Candy Machine.`);
        }
    }
}

export async function globalMint() {


    const umi = getUmi();

    // Create a keypair from your private key
    // const TESTkeyPair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKey))
    // const TESTkeyPair = await getKeyPair('random Key , TODO')
    // const TESTkeyPair = await getKeyPair('TEST_SIGNER')

    // TODO .env
    const creatorKeyPair = generateSigner(umi);
    // const creatorKeyPair = createSignerFromKeypair( umi, TESTkeyPair )
    const collectionMint_Signer = generateSigner(umi);
    // const collectionMint_Signer = generateSigner(umi);
    const treasury_Signer = generateSigner(umi);
    // const treasury_Signer = generateSigner(umi);
    const candyMachine = generateSigner(umi);
    // const candyMachine = generateSigner(umi);
    
    umi.use(keypairIdentity(creatorKeyPair));
    

    console.log(`Testing Candy Machine Core...`);
    console.log(`Important account information:`)
    console.table({
        keypair: creatorKeyPair.publicKey.toString(),
        collectionMint_Signer: collectionMint_Signer.publicKey.toString(),
        treasury_Signer: treasury_Signer.publicKey.toString(),
        candyMachine: candyMachine.publicKey.toString(),
    });

    // 1. Airdrop 10 SOL to the keypair
    // Skip this step if you already have SOL in the keypair
    try {
        await umi.rpc.airdrop(creatorKeyPair.publicKey, MPL_F_sol(10), MPL_TX_BUILDR_OPTIONS.confirm);
        console.log(`1. ✅ - Airdropped SOL to the ${creatorKeyPair.publicKey.toString()}`)
    } catch (error) {
        console.log('1. ❌ - Error airdropping SOL to the wallet.');
    }

    // 2. Create a collection
    try {
        await createCollectionV1(umi, {
            collection: collectionMint_Signer,
            name: 'My Collection',
            uri: 'https://example.com/my-collection.json',
        }).sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
        console.log(`2. ✅ - Created collection: ${collectionMint_Signer.publicKey.toString()}`)
    } catch (error) {
        console.log('2. ❌ - Error creating collection.');
    }

    const year = 2023;
    const month = 12;
    const day = 31;
    const hour = 16;
    const minute = 33;
    const second = 59;
    const millisecond = 0;

    const date1 = new Date(year, month, day, hour, minute, second, millisecond);
    const date2 = new Date(year+1, month, day, hour, minute, second, millisecond);

    // const now = new Date( 2024, );
    // const now_ = Date.now();
    // const tempsEnMs = now
    // console.log('tempsEnMs', tempsEnMs);

    // const startDateTimeS = dateTime('2023-04-04T16:00:00Z');

    const startDateTime = date1;
    // const endDateTime = null;
    const endDateTime = date2;


    // 3. Create a Candy Machine
    try {
        const prefixUri = 'https://example.com/metadata/' // TODO: change this ; upload metadata to IPFS
        const prefixUriLength = prefixUri.length;

            // TODO: guards
            // let guards_rules = {
            const guards_rules:GuardSetArgs = {
                botTax: some({ lamports: MPL_F_sol(0.001), lastInstruction: true }),
                solPayment: some({ lamports: MPL_F_sol(1.5), destination: treasury_Signer.publicKey }),

                // The Candy Machine will only be able to mint NFTs after this date
                // startDate: some({ date: startDateTime }),
                // The Candy Machine will stop minting NFTs after this date
                // endDate: some({ date: endDateTime }),
                // All other guards are disabled...
            }

            // The Candy Machine will only be able to mint NFTs after this date
            if (startDateTime) {
                guards_rules.startDate = some({ date: startDateTime });
            }
            // The Candy Machine will stop minting NFTs after this date
            if (endDateTime) {
                guards_rules.endDate = some({ date: endDateTime });
            }

        console.debug('guards_rules');
        console.dir(guards_rules);


        const createIx = await create(umi, {
            candyMachine,
            collection: collectionMint_Signer.publicKey,
            collectionUpdateAuthority: umi.identity,
            itemsAvailable: 3, // TODO: change this
            authority: umi.identity.publicKey,
            isMutable: false,
            configLineSettings: some({
                prefixName: 'Quick NFT #', // TODO: change this
                nameLength: 11, // TODO: change this
                prefixUri: prefixUri,
                uriLength: prefixUriLength, // 29, // TODO: change this
                isSequential: false,
            }),
            // TODO: guards
            guards: guards_rules,
        })
        await createIx.sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
        console.log(`3. ✅ - Created Candy Machine: ${candyMachine.publicKey.toString()}`)
    } catch (error) {
        console.log('3. ❌ - Error creating Candy Machine.');
    }

    // 4. Add items to the Candy Machine
    try {
        await addConfigLines(umi, {
            candyMachine: candyMachine.publicKey,
            index: 0,
            configLines: [
                { name: '1', uri: '1.json' },
                { name: '2', uri: '2.json' },
                { name: '3', uri: '3.json' },
            ],
        }).sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
        console.log(`4. ✅ - Added items to the Candy Machine: ${candyMachine.publicKey.toString()}`)
    } catch (error) {
        console.log('4. ❌ - Error adding items to the Candy Machine.');
    }

    // 5. Verify the Candy Machine configuration
    await checkCandyMachine(umi, candyMachine.publicKey, {
        itemsLoaded: 3,
        authority: umi.identity.publicKey,
        collection: collectionMint_Signer.publicKey,
        itemsRedeemed: 0,
    }, 5);

    // 6. Mint NFTs
    try {
        const numMints = 3;
        let minted = 0;
        for (let i = 0; i < numMints; i++) {
            await transactionBuilder()
                .add(setComputeUnitLimit(umi, { units: 800_000 }))
                .add(
                    mintV1(umi, {
                        candyMachine: candyMachine.publicKey,
                        asset: generateSigner(umi),
                        collection: collectionMint_Signer.publicKey,
                        mintArgs: {
                            solPayment: some({ destination: treasury_Signer.publicKey }),
                        },
                    })
                )
                .sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
            minted++;
        }
        console.log(`6. ✅ - Minted ${minted} NFTs.`);
    } catch (error) {
        console.log('6. ❌ - Error minting NFTs.');
    }

    // 7. Verify the Candy Machine configuration
    await checkCandyMachine(umi, candyMachine.publicKey, {
        itemsLoaded: 3,
        authority: umi.identity.publicKey,
        collection: collectionMint_Signer.publicKey,
        itemsRedeemed: 3,
    }, 7);

    // 8. Delete the Candy Machine
    try {
        await deleteCandyMachine(umi, {
            candyMachine: candyMachine.publicKey,
        }).sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
        console.log(`8. ✅ - Deleted the Candy Machine: ${candyMachine.publicKey.toString()}`);
    } catch (error) {
        console.log('8. ❌ - Error deleting the Candy Machine.');
    }
}


// main().catch(console.error);
