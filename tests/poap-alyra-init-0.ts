import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PoapAlyra } from "../target/types/poap_alyra";
import { expect } from "chai";
import * as poap_alyra_consts from "./poap-alyra-consts";
import * as poap_alyra_utils from "./poap-alyra-utils";

describe("poap-alyra-initialize with 0 mint", () => {
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

  it("Is initialized with 0 mint", async () => {
    // No "mint"
    const firstRandomNftMints = []

    const tx = await program.methods.initialize( pdaUserMintsBump, pdaUserBurnsBump, firstRandomNftMints ).accounts({
      userData: pdaUserData,
      userMints: pdaUserMints,
      userBurns: pdaUserBurns,
    }).rpc();
    console.log("Your transaction signature", tx);

    let userData: any, userMints: any, userBurns: any;
    ({ userData, userMints, userBurns } = await poap_alyra_utils.fetchPoapAlyraPdas(program as Program));

    expect(userData.owner.toString()).to.equal(program.provider.publicKey.toString())

    expect(userMints.lastMinted.toString()).to.equal(poap_alyra_consts.UNINITIALIZED_PUBLIC_KEY_STRING)
    expect(userMints.totalCountMinted).to.equal(0)
    expect(userMints.maxCurrentSize).to.equal(poap_alyra_consts.MINTED_LIST_INIT_LEN)

    console.log("userMints.bump", userMints.bump)

    expect(userBurns.totalCountBurned).to.equal(0)
    expect(userBurns.lastBurned.toString()).to.equal(poap_alyra_consts.UNINITIALIZED_PUBLIC_KEY_STRING)
    expect(userBurns.listBurned.length).to.equal(0)
    expect(userBurns.maxCurrentSize).to.equal(poap_alyra_consts.BURNT_LIST_INIT_LEN)

    console.log("userBurns.bump", userBurns.bump)

  });

});

