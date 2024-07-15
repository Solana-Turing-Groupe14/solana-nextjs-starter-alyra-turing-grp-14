import {
  mplCandyMachine as mplCoreCandyMachine,
} from "@metaplex-foundation/mpl-core-candy-machine";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { PublicKey as soljsweb3PublicKey } from '@solana/web3.js'
import {
  MPL_F_createCollectionV1,
  MPL_F_createSignerFromKeypair,
  MPL_F_generateSigner,
  MPL_F_isSigner,
  MPL_F_publicKey,
  MPL_F_sol, MPL_Keypair,
  MPL_P_KeypairIdentity,
  MPL_P_walletAdapterIdentity,
  MPL_P_walletAdapterPayer,
  MPL_T_GuardSetArgs,
  // MPL_T_KeypairSigner,
  MPL_T_PublicKey,
  // eslint-disable-next-line sort-imports
  MPL_T_SolAmount, MPL_F_some, MPL_T_Umi, MPL_T_WalletAdapter,
  MPL_TX_BUILDR_OPTIONS,
  MPL_F_addConfigLines,
  MPL_F_fetchCandyMachine,
  MPL_F_create,
  MPL_F_transactionBuilder,
  MPL_F_setComputeUnitLimit,
  MPL_F_mintV1,
  // MPL_F_deleteCandyMachine,
} from '@helpers/mtplx';
import { RPC_URL } from '@helpers/solana.helper';
import { mplhelp_T_AirdropResult, mplhelp_T_CreateCollectionResult, mplhelp_T_CreateNftCollectionResult, mplhelp_T_MintNftCMInput, mplhelp_T_MintNftCMResult } from "types";

const filePath = "app/helpers/mplx.helpers.ts"

// --------------------------------------------------

const mplx_umi: MPL_T_Umi = createUmi(RPC_URL).use(mplCoreCandyMachine());
if (!mplx_umi) {
  throw new Error('mplx_umi not found')
}

export const getUmi = (): MPL_T_Umi => {
  return mplx_umi
} // getUmi

// --------------------------------------------------

export const getMplKeypair_fromENV = (signerName: string): MPL_Keypair | null => {
  try {
    console.debug(`mplx.helpers.ts:getMplKeypair_fromENV: signerName = '${signerName}'`)
    if (!signerName) {
      console.warn('mplx.helpers.ts:getMplKeypair_fromENV: signerName not provided')
      console.warn('mplx.helpers.ts:getMplKeypair_fromENV: using "MINT_APP_DEFAULT_KEYPAIR"')
    }
    const SIGNER_SEED_TEXT_from_env = (!signerName ? process.env.MINT_APP_DEFAULT_KEYPAIR || '' : process.env[signerName as string] || '')
    if (!SIGNER_SEED_TEXT_from_env) {
      console.error('app/pages/api/collection-creation-test.ts: SIGNER_SEED_TEXT_from_env', 'Not Found')
      return null
    }
    const jsonSEED = JSON.parse(SIGNER_SEED_TEXT_from_env)
    const buf = Buffer.from(jsonSEED as string, 'utf8')
    // console.debug('mplx.helpers.ts:getMplKeypair_fromENV: buf', buf)
    const SIGNER_SEED: Uint8Array = Uint8Array.from(buf)
    // console.debug('mplx.helpers.ts:getMplKeypair_fromENV: SIGNER_SEED', SIGNER_SEED)
    const keyPair: MPL_Keypair = mplx_umi.eddsa.createKeypairFromSecretKey(SIGNER_SEED);
    // const keyPairPublicKeySTR = keyPair.publicKey.toString()
    // console.debug('mplx.helpers.ts:getMplKeypair_fromENV: keyPairPublicKeySTR', keyPairPublicKeySTR)
    return keyPair;
  } catch (error) {
    console.error('mplx.helpers.ts:getMplKeypair_fromENV: error', error)
    //   const response: ResponseData = { success: false, error: '' };
    if (error instanceof Error) {
      console.error('error', error)
      // response.error = error.message
    } else {
      // response.error = 'Error'
      console.error('error', error)
    }
  } // catch
  return null
} // getMplKeypair_fromENV

// --------------------------------------------------

interface ExpectedCandyMachineState {
  itemsLoaded: number;
  itemsRedeemed: number;
  authority: MPL_T_PublicKey;
  collection: MPL_T_PublicKey;
}

async function checkCandyMachine(
  umi: MPL_T_Umi,
  candyMachine: MPL_T_PublicKey,
  expectedCandyMachineState: ExpectedCandyMachineState,
  // step?: number
) {
  try {
    const loadedCandyMachine = await MPL_F_fetchCandyMachine(umi, candyMachine, MPL_TX_BUILDR_OPTIONS.confirm);
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
    // step && console.log(`${step}. ✅ - Candy Machine has the correct configuration.`);
    console.log(` ✅ - Candy Machine has the correct configuration.`);
  } catch (error) {
    if (error instanceof Error) {
      // step && console.log(`${step}. ❌ - Candy Machine incorrect configuration: ${error.message}`);
      console.log(` ❌ - Candy Machine incorrect configuration: ${error.message}`);
    } else {
      // step && console.log(`${step}. ❌ - Error fetching the Candy Machine.`);
      console.log(` ❌ - Error fetching the Candy Machine.`);
    }
  }
}

// --------------------------------------------------

const AIRDROP_DEFAULT_AMOUNT = 1

export const airdrop = async (
  _publicKeyString: string,
  _amount: number = AIRDROP_DEFAULT_AMOUNT
): Promise<mplhelp_T_AirdropResult> => {
  try {
    console.debug(`mplx.helpers.ts:airdrop: publicKey = '${_publicKeyString}'`)
    if (!_publicKeyString) {
      console.error('mplx.helpers.ts:getMplKeypair_fromENV: _publicKeyString not provided')
      // throw new Error('Public key not provided')
      return { success: false, error: 'Public key not provided' }
    }
    // check address validity
    const isValid = soljsweb3PublicKey.isOnCurve(new soljsweb3PublicKey(_publicKeyString))
    if (!isValid) {
      // throw new Error('Invalid public key')
      return { success: false, error: 'Invalid public key' }
    }
    // const pubK:MPL_T_PublicKey = new soljsweb3PublicKey(_publicKeyString)
    const mpl_publicKey: MPL_T_PublicKey = MPL_F_publicKey(_publicKeyString)

    try {
      const umi = getUmi()
      await umi.rpc.airdrop(mpl_publicKey, MPL_F_sol(_amount), MPL_TX_BUILDR_OPTIONS.confirm);
      console.log(`✅ - Airdropped ${_amount} SOL to the ${mpl_publicKey}`)
      const airdropResult: mplhelp_T_AirdropResult = { success: true, amount: _amount }
      return airdropResult
    } catch (error) {
      console.log(`❌ - Error airdropping SOL to ${mpl_publicKey}`);
      // throw new Error('Error airdropping SOL')

      const airdropResult: mplhelp_T_AirdropResult = { success: false, error: '' };
      if (error instanceof Error) {
        console.log('error', error)
        airdropResult.error = `Error airdropping SOL to ${mpl_publicKey} : ${error.message}`
      } else {
        // response.error = 'Error'
        airdropResult.error = `Error airdropping SOL to ${mpl_publicKey}`
      }
      // res.status(200).json({ success: false, error: `Error airdropping SOL to ${_publicKey}` })
      // res.status(200).json(response)
      return airdropResult
    }

  } catch (error) {
    const airdropResult: mplhelp_T_AirdropResult = { success: false, error: '' };
    if (error instanceof Error) {
      console.error('mplx.helpers.ts:airdrop: error', error)
      airdropResult.error = error.message
    } else {
      console.error('mplx.helpers.ts:airdrop: error', error)
      airdropResult.error = `${error}`
    }
    return airdropResult
  } // catch

} // getMplKeypair_fromENV


// --------------------------------------------------

// https://developers.metaplex.com/umi/public-keys-and-signers
// Umi interface stores two instances of Signer:
// - identity using the app and payer paying for transaction
// - payer paying for transaction

// Umi provides plugins to quickly assign new signers to these attributes.
// The signerIdentity and signerPayer plugins are available for this purpose.


// umi.use(signerIdentity(mySigner));
// // Is equivalent to:
// umi.identity = mySigner;
// umi.payer = mySigner;

// umi.use(signerIdentity(mySigner, false));
// // Is equivalent to:
// umi.identity = mySigner;

// umi.use(signerPayer(mySigner));
// // Is equivalent to:
// umi.payer = mySigner;

// Set identity & payer with the same signer: creator_Signer

// umi.use(MPL_P_KeypairIdentity(creator_Signer));

// umi = umi.use(walletAdapterIdentity(wallet));

// --------------------------------------------------

export async function createSponsoredCollection(
): Promise<mplhelp_T_CreateCollectionResult> {
  const LOGPREFIX = `${filePath}:createSponsoredCollection: `
  try {

    const umi = mplx_umi

    const APP_1_KEYPAIR_SIGNER = 'MINT_APP_01_KEYPAIR'
    const creator_keyPair: MPL_Keypair | null = getMplKeypair_fromENV(APP_1_KEYPAIR_SIGNER)
    if (!creator_keyPair) {
      console.error(`${LOGPREFIX} creator_keyPair (${APP_1_KEYPAIR_SIGNER}) Not Found`)
      const collectionResultError: mplhelp_T_CreateCollectionResult = {
        success: false,
        error: ''
      }
      return collectionResultError
    }

    const creator_Signer = MPL_F_createSignerFromKeypair(umi, creator_keyPair)

    // Check if creator_Signer is a signer
    // if (!MPL_F_isSigner(creator_Signer)) {
    //   console.error(`${LOGPREFIX}❌ ${creator_Signer} is not a signer`)
    //   const collectionResultError:mplhelp_T_CreateCollectionResult = {
    //     success: false,
    //     error: `Error creating collection: not a signer`
    //   }
    //   return collectionResultError
    // }


    // Set identity & payer with the same signer: creator_Signer
    umi.use(MPL_P_KeypairIdentity(creator_Signer));

    const res = await createCollection(/* creator_Signer, */ umi)
    console.debug(`${LOGPREFIX} createCollection result`, res)
    return res

  } catch (error) {
    console.error(`${LOGPREFIX}`, error)

    // const response: ResponseData = { success: false, error: '' };
    const collectionResultError: mplhelp_T_CreateCollectionResult = {
      success: false,
      error: ''
    }
    if (error instanceof Error) {
      console.log('error', error)
      collectionResultError.error = error.message
    } else {
      collectionResultError.error = 'Error'
    }
    return collectionResultError
  } // catch
} // createCollection


// --------------------------------------------------

export async function createMyCollection(
  walletAdapter: MPL_T_WalletAdapter,
  // umi:MPL_T_Umi,
): Promise<mplhelp_T_CreateCollectionResult> {
  const LOGPREFIX = `${filePath}:createMyCollection: `
  try {
    const umi = mplx_umi
    // Set identity
    umi.use(MPL_P_walletAdapterIdentity(walletAdapter));
    // Set payer
    umi.use(MPL_P_walletAdapterPayer(walletAdapter));

    // Check if walletAdapter is a valid signer
    if (!MPL_F_isSigner(umi.identity)) {
      console.error(`${LOGPREFIX}❌ wallet ${walletAdapter.publicKey} is not a valid signer`)
      const collectionResultError: mplhelp_T_CreateCollectionResult = {
        success: false,
        error: `Error creating collection: wallet is not a signer`
      }
      return collectionResultError
    }

    // Create a NEW collection

    const res = await createCollection(/* creator_Signer, */ umi)
    console.debug(`${LOGPREFIX} createCollection result`, res)
    return res

    // const createCollectionResultSuccess:mplhelp_T_CreateCollectionResult = {
    //   success: true,
    //   address: "xxxxxxxxxxxxx" }
    // return createCollectionResultSuccess


  } catch (error) {
    console.error(`${LOGPREFIX}`, error)

    const collectionResult: mplhelp_T_CreateCollectionResult = {
      success: false,
      error: ''
    }

    if (error instanceof Error) {
      console.log('error', error)
      collectionResult.error = error.message
    } else {
      collectionResult.error = 'Error'
    }
    return collectionResult
  } // catch
} // createMyCollection


export async function createCollection(
  // creator_Signer: MPL_T_KeypairSigner,
  umi: MPL_T_Umi,
): Promise<mplhelp_T_CreateCollectionResult> {
  const LOGPREFIX = `${filePath}:createCollection: `
  try {
    // // Check if creator_Signer is a signer
    // if (!MPL_F_isSigner(creator_Signer)) {
    //   console.error(`${LOGPREFIX}❌ ${creator_Signer} is not a signer`)
    //   const collectionResultError:mplhelp_T_CreateCollectionResult = {
    //     success: false,
    //     error: `Error creating collection: not a signer`
    //   }
    //   return collectionResultError
    // }

    // const collectionSigner = generateSigner(umi)
    const collection_Signer = MPL_F_generateSigner(umi) // NEW random signer

    console.log(`Account information:`)
    console.table({
      umi_payer: umi.payer,
      umi_identity: umi.identity,
    });

    // Check balance(s)
    const MINIMUM_CREATOR_BALANCE = 1 // 1 SOL
    const LOW_CREATOR_BALANCE = 10 // 10 SOL
    const MINIMUM_CREATOR_BALANCE_SOL = MPL_F_sol(MINIMUM_CREATOR_BALANCE)
    const LOW_CREATOR_BALANCE_SOL = MPL_F_sol(LOW_CREATOR_BALANCE)
    // const payerBalance:MPL_T_SolAmount = await umi.rpc.getBalance(creator_Signer.publicKey);
    const payerBalance: MPL_T_SolAmount = await umi.rpc.getBalance(umi.payer.publicKey);

    // console.debug(`${LOGPREFIX}Creator balance `, balance);

    if (payerBalance.basisPoints < LOW_CREATOR_BALANCE_SOL.basisPoints) {
      console.warn(`${LOGPREFIX}⚠️  Low (less than ${LOW_CREATOR_BALANCE} SOL) balance  : ${Number(payerBalance.basisPoints) / (10 ** payerBalance.decimals)} SOL`);
    }
    if (payerBalance.basisPoints < MINIMUM_CREATOR_BALANCE_SOL.basisPoints) {
      console.error(`${LOGPREFIX}❌ Insufficient (less than ${MINIMUM_CREATOR_BALANCE} SOL) balance : ${Number(payerBalance.basisPoints) / (10 ** payerBalance.decimals)} SOL`);
      const collectionResultError: mplhelp_T_CreateCollectionResult = {
        success: false,
        error: `Error creating collection: Insufficient (less than ${MINIMUM_CREATOR_BALANCE} SOL) balance : ${Number(payerBalance.basisPoints) / (10 ** payerBalance.decimals)} SOL`
      }
      return collectionResultError
    }

    console.log(`Account information:`)
    console.table({
      // creator_Signer: creator_Signer.publicKey.toString(),
      creator: umi.identity.publicKey.toString(),
      payer: umi.payer.publicKey.toString(),
      collection: collection_Signer.publicKey.toString(),
    });

    // Create a NEW collection
    try {
      await MPL_F_createCollectionV1(umi, {
        collection: collection_Signer, // address of the new collection
        name: 'My Collection',
        uri: 'https://example.com/my-collection.json',
        // plugins: []
        // updateAuthority: creator_Signer.publicKey,

      }).sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
      console.log(`✅ - Created collection: ${collection_Signer.publicKey.toString()}`)

      const createCollectionResultSuccess: mplhelp_T_CreateCollectionResult = {
        success: true,
        address: collection_Signer.publicKey.toString()
      }
      return createCollectionResultSuccess

    } catch (error) {
      console.error('❌ - Error creating collection.');

      const collectionResultError: mplhelp_T_CreateCollectionResult = {
        success: false,
        error: ''
      }

      if (error instanceof Error) {
        console.error(`${LOGPREFIX}`, error)
        collectionResultError.error = error.message
      } else {
        collectionResultError.error = 'Error'
      }
      return collectionResultError
    } // catch


  } catch (error) {
    console.error(`${LOGPREFIX}`, error)

    // const response: ResponseData = { success: false, error: '' };
    const collectionResult: mplhelp_T_CreateCollectionResult = {
      success: false,
      error: ''
    }
    if (error instanceof Error) {
      console.log('error', error)
      collectionResult.error = error.message
    } else {
      collectionResult.error = 'Error'
    }
    return collectionResult
  } // catch
} // createCollection

// --------------------------------------------------


export async function createMyFullNftCollection(
  _walletAdapter: MPL_T_WalletAdapter,
  _collectionName: string,
  _collectionUri: string,
  _nftNamePrefix: string,
  _itemsCount: number,
  _metadataPrefixUri: string,
  _startDateTime: Date | null,
  _endDateTime: Date | null,
  // umi:MPL_T_Umi,
): Promise<mplhelp_T_CreateNftCollectionResult> {
  const LOGPREFIX = `${filePath}:createFullNftCollection: `
  try {

    const umi = mplx_umi
    // Set identity
    umi.use(MPL_P_walletAdapterIdentity(_walletAdapter));
    // Set payer
    umi.use(MPL_P_walletAdapterPayer(_walletAdapter));

    // Check if walletAdapter is a valid signer
    if (!MPL_F_isSigner(umi.identity)) {
      console.error(`${LOGPREFIX}❌ wallet ${_walletAdapter.publicKey} is not a valid signer`)
      const collectionResultError: mplhelp_T_CreateCollectionResult = {
        success: false,
        error: `Error creating collection: wallet is not a signer`
      }
      return collectionResultError
    }

    // TODO
    // --------------------------------------------------------------

    const collection_Signer = MPL_F_generateSigner(umi) // NEW random signer

    // const collectionName = 'My Collection'
    // const collectionUri = 'https://example.com/my-collection.json'
    const collectionName = _collectionName
    const collectionUri = _collectionUri
    // 2. Create a collection
    try {
      await MPL_F_createCollectionV1(umi, {
        collection: collection_Signer,
        name: collectionName,
        uri: collectionUri,
      }).sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
      console.log(`2. ✅ - Created collection: ${collection_Signer.publicKey.toString()}`)
    } catch (error) {
      console.log('2. ❌ - Error creating collection.');
    }



    // try {

    // } catch (error) {
    //   console.error(`${LOGPREFIX}`, error)
    //   const collectionResult:mplhelp_T_CreateNftCollectionResult = {
    //     success: false,
    //     error: ''
    //   }
    //   if (error instanceof Error) {
    //     console.log('error', error)
    //     collectionResult.error = error.message
    //   } else {
    //     collectionResult.error = 'Error'
    //   }
    //   return collectionResult
    // } // catch




    // const year = 2023;
    // const month = 12;
    // const day = 31;
    // const hour = 16;
    // const minute = 33;
    // const second = 59;
    // const millisecond = 0;

    // const date1 = new Date(year, month, day, hour, minute, second, millisecond);
    // const date2 = new Date(year+1, month, day, hour, minute, second, millisecond);

    // const now = new Date( 2024, );
    // const now_ = Date.now();
    // const tempsEnMs = now
    // console.log('tempsEnMs', tempsEnMs);

    // const startDateTimeS = dateTime('2023-04-04T16:00:00Z');

    // const startDateTime = date1;
    // // const endDateTime = null;
    // const endDateTime = date2;
    const startDateTime = _startDateTime;
    // const endDateTime = null;
    const endDateTime = _endDateTime;


    // TODO
    // TODO
    // TODO : signers

    const treasury_Signer = MPL_F_generateSigner(umi);
    const candyMachine = MPL_F_generateSigner(umi);

    // TODO
    // TODO
    // TODO

    // const itemsAvailable = 3; // TODO: change this
    const itemsAvailable = _itemsCount;
    // const nftNamePrefix = 'Quick NFT'; // TODO: change this
    const nftNamePrefix = _nftNamePrefix;

    // const nftNameMaxLength = nftNamePrefix.length+1; // TODO: change this
    const nftNameMaxLength = nftNamePrefix.length + _itemsCount.toString().length; // TODO: change this

    // const metadataPrefixUri = 'https://example.com/metadata/' // TODO: change this ; upload metadata to IPFS
    const metadataPrefixUri = _metadataPrefixUri
    const metadataPrefixUriLength = metadataPrefixUri.length

    // 3. Create a Candy Machine
    try {

      // TODO: guards
      // let guards_rules = {
      const guards_rules: MPL_T_GuardSetArgs = {
        botTax: MPL_F_some({ lamports: MPL_F_sol(0.001), lastInstruction: true }),
        solPayment: MPL_F_some({ lamports: MPL_F_sol(1.5), destination: treasury_Signer.publicKey }),
        // All other guards are disabled...
      }
      // The Candy Machine will only be able to mint NFTs after this date
      if (startDateTime) {
        guards_rules.startDate = MPL_F_some({ date: startDateTime });
      }
      // The Candy Machine will stop minting NFTs after this date
      if (endDateTime) {
        guards_rules.endDate = MPL_F_some({ date: endDateTime });
      }

      console.debug('guards_rules');
      console.dir(guards_rules);


      const createIx = await MPL_F_create(umi, {
        candyMachine,
        collection: collection_Signer.publicKey, // create assets into this collection
        collectionUpdateAuthority: umi.identity,
        itemsAvailable: itemsAvailable,
        authority: umi.identity.publicKey,
        isMutable: false,
        // https://developers.metaplex.com/core-candy-machine/create#config-line-settings
        configLineSettings: MPL_F_some({
          prefixName: nftNamePrefix,
          nameLength: nftNameMaxLength,
          prefixUri: metadataPrefixUri,
          uriLength: metadataPrefixUriLength,
          isSequential: false,
        }),
        // TODO: guards
        guards: guards_rules,
      })
      await createIx.sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
      console.log(`3. ✅ - Created Candy Machine: ${candyMachine.publicKey.toString()}`)
    } catch (error) {
      // console.log('3. ❌ - Error creating Candy Machine.');
      console.error(`${LOGPREFIX} ❌ - Error creating Candy Machine.`, error)
      const collectionResult: mplhelp_T_CreateNftCollectionResult = {
        success: false,
        error: 'Error creating Candy Machine.'
      }
      if (error instanceof Error) {
        console.log('error', error)
        collectionResult.error += ` ${error.message}`
      } else {
        collectionResult.error = ` ${error}`
      }
      return collectionResult
    } // catch


    // 4. Add items to the Candy Machine


    try {
      const configLines = [];
      for (let i = 1; i <= itemsAvailable; i++) {
        configLines.push(
          {
            name: `${i}`,
            uri: `${i}.json`,
          })
      }
      await MPL_F_addConfigLines(umi, {
        candyMachine: candyMachine.publicKey,
        index: 0,
        configLines: configLines,
        // configLines: [
        //     { name: '1', uri: '1.json' },
        //     { name: '2', uri: '2.json' },
        //     { name: '3', uri: '3.json' },
        // ],
      }).sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
      console.log(`4. ✅ - Added items to the Candy Machine: ${candyMachine.publicKey.toString()}`)
    } catch (error) {
      // console.log('4. ❌ - Error adding items to the Candy Machine.');
      console.error(`${LOGPREFIX} ❌ - Error adding items to the Candy Machine`, error)
      const collectionResult: mplhelp_T_CreateNftCollectionResult = {
        success: false,
        error: 'Error adding items to the Candy Machine.'
      }
      if (error instanceof Error) {
        console.log('error', error)
        collectionResult.error += ` ${error.message}`
      } else {
        collectionResult.error = ` ${error}`
      }
      return collectionResult
    } // catch

    // 5. Verify the Candy Machine configuration
    try {
      await checkCandyMachine(umi, candyMachine.publicKey, {
        itemsLoaded: itemsAvailable,
        authority: umi.identity.publicKey,
        collection: collection_Signer.publicKey,
        itemsRedeemed: 0,
      });
      // , 5);
    } catch (error) {
      console.error(`${LOGPREFIX} ❌ - Error verifying the Candy Machine configuration`, error)
      const collectionResult: mplhelp_T_CreateNftCollectionResult = {
        success: false,
        error: 'Error verifying the Candy Machine configuration.'
      }
      if (error instanceof Error) {
        console.log('error', error)
        collectionResult.error += ` ${error.message}`
      } else {
        collectionResult.error = ` ${error}`
      }
      return collectionResult
    } // catch



    // try {

    // } catch (error) {
    //   console.error(`${LOGPREFIX}`, error)
    //   const collectionResult:mplhelp_T_CreateNftCollectionResult = {
    //     success: false,
    //     error: ''
    //   }
    //   if (error instanceof Error) {
    //     console.log('error', error)
    //     collectionResult.error = error.message
    //   } else {
    //     collectionResult.error = 'Error'
    //   }
    //   return collectionResult
    // } // catch


    // 6. Mint NFTs
    // try {
    //     const numMints = 3;
    //     let minted = 0;
    //     for (let i = 0; i < numMints; i++) {
    //         await MPL_F_transactionBuilder()
    //             .add(MPL_F_setComputeUnitLimit(umi, { units: 800_000 }))
    //             .add(
    //               MPL_F_mintV1(umi, {
    //                     candyMachine: candyMachine.publicKey,
    //                     asset: MPL_F_generateSigner(umi),
    //                     collection: collection_Signer.publicKey,
    //                     mintArgs: {
    //                         solPayment: MPL_F_some({ destination: treasury_Signer.publicKey }),
    //                     },
    //                 })
    //             )
    //             .sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
    //         minted++;
    //     }
    //     console.log(`6. ✅ - Minted ${minted} NFTs.`);
    // } catch (error) {
    //     console.log('6. ❌ - Error minting NFTs.');
    // }

    // 6. Mint ONE NFT

    // try {

    // } catch (error) {
    //   console.error(`${LOGPREFIX}`, error)
    //   const collectionResult:mplhelp_T_CreateNftCollectionResult = {
    //     success: false,
    //     error: ''
    //   }
    //   if (error instanceof Error) {
    //     console.log('error', error)
    //     collectionResult.error = error.message
    //   } else {
    //     collectionResult.error = 'Error'
    //   }
    //   return collectionResult
    // } // catch


    try {
      const numMints = 1;
      let minted = 0;
      for (let i = 0; i < numMints; i++) {
        await MPL_F_transactionBuilder()
          .add(MPL_F_setComputeUnitLimit(umi, { units: 800_000 }))
          .add(
            MPL_F_mintV1(umi, {
              candyMachine: candyMachine.publicKey,
              asset: MPL_F_generateSigner(umi),
              collection: collection_Signer.publicKey,
              mintArgs: {
                solPayment: MPL_F_some({ destination: treasury_Signer.publicKey }),
              },
            })
          )
          .sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
        minted++;
      }
      console.log(`6. ✅ - Minted ${minted} NFTs.`);
    } catch (error) {
      // console.log('6. ❌ - Error minting NFTs.');
      console.error(`${LOGPREFIX} ❌ - Error minting NFT`, error)
      const collectionResult: mplhelp_T_CreateNftCollectionResult = {
        success: false,
        error: 'Error minting NFT.'
      }
      if (error instanceof Error) {
        console.log('error', error)
        collectionResult.error += ` ${error.message}`
      } else {
        collectionResult.error = ` ${error}`
      }
      return collectionResult
    } // catch

    // 7. Verify the Candy Machine configuration
    // await checkCandyMachine(umi, candyMachine.publicKey, {
    //     itemsLoaded: itemsAvailable,
    //     authority: umi.identity.publicKey,
    //     collection: collection_Signer.publicKey,
    //     itemsRedeemed: itemsAvailable, // all items have been minted
    //   // }, 7);
    // });

    // 8. Delete the Candy Machine
    // try {
    //     await MPL_F_deleteCandyMachine(umi, {
    //         candyMachine: candyMachine.publicKey,
    //     }).sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);
    //     console.log(`8. ✅ - Deleted the Candy Machine: ${candyMachine.publicKey.toString()}`);
    // } catch (error) {
    //     console.log('8. ❌ - Error deleting the Candy Machine.');
    // }

    // --------------------------------------------------------------
    // TODO


    const collectionResult: mplhelp_T_CreateNftCollectionResult = {
      success: true,
      collectionAddress: collection_Signer.publicKey,
      candyMachineAddress: candyMachine.publicKey,
    }

    console.debug(`${LOGPREFIX} collectionResult`, collectionResult)
    return collectionResult

  } catch (error) {
    console.error(`${LOGPREFIX}`, error)
    const collectionResult: mplhelp_T_CreateNftCollectionResult = {
      success: false,
      error: ''
    }
    if (error instanceof Error) {
      console.log('error', error)
      collectionResult.error = error.message
    } else {
      collectionResult.error = 'Error'
    }
    return collectionResult
  } // catch

} // createMyFullNftCollection


// --------------------------------------------------

export async function mintNftFromCM(
  // _walletAdapter: MPL_T_WalletAdapter,
  // _candyMachineAddress: string,
  // _collectionAddress: string,
  // umi:MPL_T_Umi,
  {walletAdapter: _walletAdapter,
    candyMachineAddress: _candyMachineAddress,
    collectionAddress: _collectionAddress}: mplhelp_T_MintNftCMInput
): Promise<mplhelp_T_MintNftCMResult> {
  const LOGPREFIX = `${filePath}:mintNftFromCM: `
  try {

    const umi = mplx_umi

    // Set identity
    umi.use(MPL_P_walletAdapterIdentity(_walletAdapter));
    // Set payer
    umi.use(MPL_P_walletAdapterPayer(_walletAdapter));

    // console.debug(`${LOGPREFIX} candyMachineAddress=${_candyMachineAddress} collectionAddress=${_collectionAddress}`)
    // console.debug(`${LOGPREFIX}`)
    console.table({
        logger: LOGPREFIX,
        candyMachineAddress: _candyMachineAddress,
        collectionAddress: _collectionAddress,
      })

    if (!_candyMachineAddress) {
      console.error(`${LOGPREFIX} _candyMachineAddress`)
      const collectionResultError: mplhelp_T_MintNftCMResult = {
        success: false,
        error: 'No Candy Machine Address provided'
      }
      return collectionResultError
    }
    if (!_collectionAddress) {
      console.error(`${LOGPREFIX} _collectionAddress`)
      const collectionResultError: mplhelp_T_MintNftCMResult = {
        success: false,
        error: 'No Collection Address provided'
      }
      return collectionResultError
    }

    const candyMachinePublicKey: MPL_T_PublicKey = MPL_F_publicKey(_candyMachineAddress)
    const collectionPublicKey: MPL_T_PublicKey = MPL_F_publicKey(_collectionAddress)

    try {
        await MPL_F_transactionBuilder()
          .add(MPL_F_setComputeUnitLimit(umi, { units: 800_000 }))
          .add(
            MPL_F_mintV1(umi, {
              candyMachine: candyMachinePublicKey, // candyMachine.publicKey
              asset: MPL_F_generateSigner(umi),
              collection: collectionPublicKey, // collection_Signer.publicKey
              // mintArgs: {
              //   solPayment: MPL_F_some({ destination: treasury_Signer.publicKey }),
              // },
            })
          )
          .sendAndConfirm(umi, MPL_TX_BUILDR_OPTIONS);

          console.log(`✅ - NFT Minted.`);
    } catch (error) {
      // console.log('6. ❌ - Error minting NFTs.');
      console.error(`${LOGPREFIX} ❌ - Error minting NFT`, error)
      const collectionResult: mplhelp_T_CreateNftCollectionResult = {
        success: false,
        error: 'Error minting NFT.'
      }
      if (error instanceof Error) {
        console.log('error', error)
        collectionResult.error += ` ${error.message}`
      } else {
        collectionResult.error = ` ${error}`
      }
      return collectionResult
    } // catch


    const collectionResult: mplhelp_T_MintNftCMResult = {
      success: true,
      mintAddress: "TODO",
    }

    console.debug(`${LOGPREFIX} collectionResult`, collectionResult)
    return collectionResult

  } catch (error) {
    console.error(`${LOGPREFIX}`, error)
    const collectionResult: mplhelp_T_MintNftCMResult = {
      success: false,
      error: ''
    }
    if (error instanceof Error) {
      console.log('error', error)
      collectionResult.error = error.message
    } else {
      collectionResult.error = 'Error'
    }
    return collectionResult
  } // catch

} // mintNftFromCM

