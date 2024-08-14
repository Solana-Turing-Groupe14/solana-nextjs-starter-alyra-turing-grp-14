import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PoapAlyra } from "../target/types/poap_alyra";
import { expect } from "chai";
import * as poap_alyra_consts from "./poap-alyra-consts";
import * as poap_alyra_utils from "./poap-alyra-utils";

describe("poap-alyra-initialize with 1 mint", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.PoapAlyra as Program<PoapAlyra>;
  let pdaUserData: anchor.web3.PublicKey, pdaUserMints: anchor.web3.PublicKey, pdaUserBurns: anchor.web3.PublicKey;
  let pdaUserMintsBump: number, pdaUserBurnsBump: number;

  before(async function () {
    // console.info("before");
    ({ pdaUserData, pdaUserMints, pdaUserBurns, pdaUserMintsBump, pdaUserBurnsBump } =
      await poap_alyra_utils.getPoapAlyraPdas(program as Program));
  });

  it("Is initialized with one mint", async () => {
    // One "mint"
    const firstRandomNftMintPubkey = anchor.web3.PublicKey.unique()
    const firstRandomNftMints = [firstRandomNftMintPubkey]

    const tx = await program.methods.initialize( pdaUserMintsBump, pdaUserBurnsBump, firstRandomNftMints ).accounts({
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

});

