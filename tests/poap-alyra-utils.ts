import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import * as poap_alyra_consts from "./poap-alyra-consts";

const getPoapAlyraPdas = async (program: Program) => {
    // Accounts pubkeys
    const [pdaUserData, pdaUserDataBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(poap_alyra_consts.SEED_USER_DATA_ACCOUNT), program.provider.publicKey.toBuffer()],
      program.programId,
    )
    const [pdaUserMints, pdaUserMintsBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(poap_alyra_consts.SEED_USER_MINTS_ACCOUNT), program.provider.publicKey.toBuffer()],
      program.programId,
    )
    const [pdaUserBurns, pdaUserBurnsBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(poap_alyra_consts.SEED_USER_BURNS_ACCOUNT), program.provider.publicKey.toBuffer()],
      program.programId,
    )
    return {
      pdaUserData: pdaUserData,
      pdaUserMints: pdaUserMints,
      pdaUserBurns: pdaUserBurns,
      pdaUserDataBump: pdaUserDataBump,
      pdaUserMintsBump: pdaUserMintsBump,
      pdaUserBurnsBump: pdaUserBurnsBump,
    };
  };

const fetchPoapAlyraPdas = async (program: Program) => {
    let pdaUserData: anchor.web3.PublicKey, pdaUserMints: anchor.web3.PublicKey, pdaUserBurns: anchor.web3.PublicKey;
    ({ pdaUserData, pdaUserMints, pdaUserBurns } = await getPoapAlyraPdas(program as Program));
    const userData = await program.account.userData.fetch(pdaUserData);
    const userMints = await program.account.userMints.fetch(pdaUserMints);
    const userBurns = await program.account.userBurns.fetch(pdaUserBurns);
    return {
        userData: userData,
        userMints: userMints,
        userBurns: userBurns,
      };
};

const getRandomPositiveInt = (min: number = 1, max: number = 1) => {
    const defaultVal = 1;
    const randomNum = max < 0 ? (min<0?defaultVal:min) : min+Math.floor(Math.random() * (max-min+1))
    // console.info(`randomNum   = ${randomNum}`);
    return randomNum;
};

export {
    getPoapAlyraPdas,
    fetchPoapAlyraPdas,
    getRandomPositiveInt,
}