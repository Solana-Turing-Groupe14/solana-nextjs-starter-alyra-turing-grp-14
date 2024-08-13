import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PoapAlyra } from "../target/types/poap_alyra";
import { expect } from "chai";
import * as poap_alyra_consts from "./poap-alyra-consts";
import * as poap_alyra_utils from "./poap-alyra-utils";

const MAX_MINTS = 15;

describe(`poap-alyra-initialize with 1 mint then mint ${MAX_MINTS}`, () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.PoapAlyra as Program<PoapAlyra>;
  let pdaUserData: anchor.web3.PublicKey, pdaUserMints: anchor.web3.PublicKey, pdaUserBurns: anchor.web3.PublicKey;

  before(async function () {
    console.info("before");
    ({ pdaUserData, pdaUserMints, pdaUserBurns } = await poap_alyra_utils.getPoapAlyraPdas(program as Program));
  });

  it("Is initialized with one mint", async () => {
    // One "mint"
    const firstRandomNftMintPubkey = anchor.web3.PublicKey.unique()
    const firstRandomNftMints = [firstRandomNftMintPubkey]

    const tx = await program.methods.initialize( firstRandomNftMints ).accounts({
      userData: pdaUserData,
      userMints: pdaUserMints,
      userBurns: pdaUserBurns,
    }).rpc();
    console.log("Your transaction signature", tx);

    let userData: any, userMints: any, userBurns: any;
    ({ userData, userMints, userBurns } = await poap_alyra_utils.fetchPoapAlyraPdas(program as Program));

    expect(userData.owner.toString()).to.equal(program.provider.publicKey.toString())

    expect(userMints.lastMinted.toString()).to.equal(firstRandomNftMintPubkey.toString())
    expect(userMints.lastMinted.toString()).to.not.equal(poap_alyra_consts.UNINITIALIZED_PUBLIC_KEY_STRING)

    expect(userMints.totalCountMinted).to.equal(1)
    expect(userMints.maxCurrentSize).to.equal(poap_alyra_consts.MINTED_LIST_INIT_LEN)
    expect(userMints.listMinted.length).to.equal(1)

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

    expect(userData.owner.toString()).to.equal(program.provider.publicKey.toString())

    expect(userMints.lastMinted.toString()).to.equal(newRandomNftMints[newRandomNftMints.length-1].toString())
    expect(userMints.lastMinted.toString()).to.not.equal(poap_alyra_consts.UNINITIALIZED_PUBLIC_KEY_STRING)

    const totalMints = 1+newRandomNftMints.length
    expect(userMints.totalCountMinted).to.equal(totalMints)
    expect(userMints.maxCurrentSize).to.be.greaterThanOrEqual(totalMints)
    expect(userMints.listMinted.length).to.equal(totalMints)

    expect(userBurns.totalCountBurned).to.equal(0)
    expect(userBurns.lastBurned.toString()).to.equal(poap_alyra_consts.UNINITIALIZED_PUBLIC_KEY_STRING)
    expect(userBurns.listBurned.length).to.equal(0)
    expect(userBurns.maxCurrentSize).to.equal(poap_alyra_consts.BURNT_LIST_INIT_LEN)

  });

});

