import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PoapAlyra } from "../target/types/poap_alyra";
import { expect } from "chai";
import * as poap_alyra_consts from "./poap-alyra-consts";
import * as poap_alyra_utils from "./poap-alyra-utils";

const MAX_MINTS = 15;

describe(`poap-alyra-initialize with 0 mint then mint 2 - ${MAX_MINTS} then delete 1 - ${MAX_MINTS}`, () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.PoapAlyra as Program<PoapAlyra>;
  let pdaUserData: anchor.web3.PublicKey, pdaUserMints: anchor.web3.PublicKey, pdaUserBurns: anchor.web3.PublicKey;
  // let list_minted_length;
  let initial_list_minted = []

  before(async function () {
    console.info("before");
    ({ pdaUserData, pdaUserMints, pdaUserBurns } = await poap_alyra_utils.getPoapAlyraPdas(program as Program));
  });

  it("Is initialized with 0 mint", async () => {

    // One "mint" // const firstRandomNftMintPubkey = anchor.web3.PublicKey.unique()

    // No "mint"
    const firstRandomNftMints = []

    const tx = await program.methods.initialize( firstRandomNftMints ).accounts({
      userData: pdaUserData,
      userMints: pdaUserMints,
      userBurns: pdaUserBurns,
    }).rpc();
    console.log("Your transaction signature", tx);

    let userData: any, userMints: any, userBurns: any;
    ({ userData, userMints, userBurns } = await poap_alyra_utils.fetchPoapAlyraPdas(program as Program));

    expect(userData.owner.toString()).to.equal(program.provider.publicKey.toString())

    // expect(userMints.lastMinted.toString()).to.equal(firstRandomNftMintPubkey.toString())
    expect(userMints.lastMinted.toString()).to.equal(poap_alyra_consts.UNINITIALIZED_PUBLIC_KEY_STRING)
    expect(userMints.totalCountMinted).to.equal(0)
    expect(userMints.maxCurrentSize).to.equal(poap_alyra_consts.MINTED_LIST_INIT_LEN)

    expect(userBurns.totalCountBurned).to.equal(0)
    expect(userBurns.lastBurned.toString()).to.equal(poap_alyra_consts.UNINITIALIZED_PUBLIC_KEY_STRING)
    expect(userBurns.listBurned.length).to.equal(0)
    expect(userBurns.maxCurrentSize).to.equal(poap_alyra_consts.BURNT_LIST_INIT_LEN)

  });

  it(`Mints between 2 - ${MAX_MINTS} Nft`, async () => {

    // Multiple "mints"
    const newMintsCount = poap_alyra_utils.getRandomPositiveInt(2,MAX_MINTS); // get between 2 and 15 mints
    const newRandomNftMints = []
    for (let i = 0; i < newMintsCount; i++) {
      const randomNftMintPubkey = anchor.web3.PublicKey.unique();
      // console.info(`randomNftMintPubkey = ${randomNftMintPubkey}`);
      newRandomNftMints.push(randomNftMintPubkey);
    }

    console.info(`newRandomNftMints[${newRandomNftMints.length}] = ${newRandomNftMints}`);

    const tx = await program.methods.addMints( newRandomNftMints ).accounts({
      userData: pdaUserData,
      userMints: pdaUserMints,
    }).rpc();
    console.log("Your transaction signature", tx);

    let userData: any, userMints: any, userBurns: any;
    ({ userData, userMints, userBurns } = await poap_alyra_utils.fetchPoapAlyraPdas(program as Program));

    const totalMints = newRandomNftMints.length
    // list_minted_length = totalMints
    initial_list_minted = newRandomNftMints

    expect(userData.owner.toString()).to.equal(program.provider.publicKey.toString())

    expect(userMints.lastMinted.toString()).to.equal(newRandomNftMints[newRandomNftMints.length-1].toString())
    expect(userMints.lastMinted.toString()).to.not.equal(poap_alyra_consts.UNINITIALIZED_PUBLIC_KEY_STRING)

    expect(userMints.totalCountMinted).to.equal(totalMints)
    expect(userMints.maxCurrentSize).to.be.greaterThanOrEqual(totalMints)
    expect(userMints.listMinted.length).to.equal(totalMints)

    expect(userBurns.totalCountBurned).to.equal(0)
    expect(userBurns.lastBurned.toString()).to.equal(poap_alyra_consts.UNINITIALIZED_PUBLIC_KEY_STRING)
    expect(userBurns.listBurned.length).to.equal(0)
    expect(userBurns.maxCurrentSize).to.equal(poap_alyra_consts.BURNT_LIST_INIT_LEN)

  });

  it(`Deletes between 1 - ${MAX_MINTS} Nft`, async () => {

    // let remainingMints = initial_list_minted.length
    let remanining_list_minted = initial_list_minted

    do {
      console.info(`remanining_list_minted (${remanining_list_minted.length}) = ${remanining_list_minted}`)

      // Delete multiple "mints"
      const deleteNFtCount = poap_alyra_utils.getRandomPositiveInt(1, remanining_list_minted.length); // between 1 and 15 mints
      const nftMintPubkeys_toDelete = [];
      // let i = 0;

      while (nftMintPubkeys_toDelete.length < deleteNFtCount) {
        // if (i > 10) break;
        const nftIdx = poap_alyra_utils.getRandomPositiveInt(0, remanining_list_minted.length-1); // Get Nft between [0..items count-1]
        // console.info(`nftIdx = ${nftIdx}`)
        const nftToDelete = remanining_list_minted[nftIdx];
        // console.log(`nftToDelete = ${nftToDelete}`);
        if (
          nftMintPubkeys_toDelete.filter((nft) => nft == nftToDelete).length == 0
        ) {
          // console.log(`adding one`);
          nftMintPubkeys_toDelete.push(nftToDelete);
        }
        // i++;
        // console.log(`nftMintPubkeys_toDelete = ${nftMintPubkeys_toDelete}`);
      }
      console.info(`nftMintPubkeys_toDelete[${nftMintPubkeys_toDelete.length}] = ${nftMintPubkeys_toDelete}`);

      const tx = await program.methods.burnMints( nftMintPubkeys_toDelete ).accounts({
        userData: pdaUserData,
        userMints: pdaUserMints,
        userBurns: pdaUserBurns,
      }).rpc();
      console.log("Your transaction signature", tx);

      let expectedRemainingMints = remanining_list_minted.length - nftMintPubkeys_toDelete.length
      console.info(`expectedRemainingMints = ${expectedRemainingMints}`)

      let userData: any, userMints: any, userBurns: any;
      ({ userData, userMints, userBurns } = await poap_alyra_utils.fetchPoapAlyraPdas(program as Program));

      // expect(userData.owner.toString()).to.equal(program.provider.publicKey.toString())

      // expect(userMints.lastMinted.toString()).to.equal(newRandomNftMints[newRandomNftMints.length-1].toString())
      expect(userMints.lastMinted.toString()).to.not.equal(poap_alyra_consts.UNINITIALIZED_PUBLIC_KEY_STRING)

      expect(userMints.totalCountMinted).to.equal(initial_list_minted.length)
      expect(userMints.maxCurrentSize).to.be.lessThanOrEqual(remanining_list_minted.length + poap_alyra_consts.LIST_INC_LEN)
      // expect(userMints.maxCurrentSize).to.be.greaterThanOrEqual(expectedRemainingMints)
      expect(userMints.listMinted.length).to.equal(expectedRemainingMints)

      // console.info(`remaining items (${userMints.listMinted.length}) =`);
      // userMints.listMinted.forEach((item: any) => {
      //   console.info(`${item}`);
      // })

      remanining_list_minted = userMints.listMinted

      // TODO: IMPLEMENT BURN
      expect(userBurns.totalCountBurned).to.equal(0)
      expect(userBurns.lastBurned.toString()).to.equal(poap_alyra_consts.UNINITIALIZED_PUBLIC_KEY_STRING)
      expect(userBurns.listBurned.length).to.equal(0)
      expect(userBurns.maxCurrentSize).to.equal(poap_alyra_consts.BURNT_LIST_INIT_LEN)

    } while (remanining_list_minted.length > 0);

  });

});

