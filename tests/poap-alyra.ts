import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PoapAlyra } from "../target/types/poap_alyra";

// Seeds
const SeedUserDataAccount = "SoaplanaUserData";
const SeedUserMintsAccount = "SoaplanaUserMints";
const SeedUserBurnsAccount = "SoaplanaUserBurns";

describe("poap-alyra", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PoapAlyra as Program<PoapAlyra>;

  it("Is initialized!", async () => {
    // Add your test here.
    // First "mint"
    const firstRandomNftMintPubkey = anchor.web3.PublicKey.unique();
    const firstRandomNftMints = [firstRandomNftMintPubkey];

    const [pdaUserData, ] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(SeedUserDataAccount), program.provider.publicKey.toBuffer()],
      program.programId,
    )
    const [pdaUserMints, ] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(SeedUserMintsAccount), program.provider.publicKey.toBuffer()],
      program.programId,
    )
    const [pdaUserBurns, ] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(SeedUserBurnsAccount), program.provider.publicKey.toBuffer()],
      program.programId,
    )
    const tx = await program.methods.initialize( firstRandomNftMints ).accounts({
      userData: pdaUserData,
      userMints: pdaUserMints,
      userBurns: pdaUserBurns,
  }).rpc();
    console.log("Your transaction signature", tx);
  });
});


const getRandomPositiveInt = (max: number = 1) => {
  const defaultVal = 1;
  const randomNum = max < 0 ? defaultVal : Math.floor(Math.random() * max) + 1;
  console.info(`randomNum = ${randomNum}`);
  return randomNum;
};