// No imports needed: web3, anchor, pg and more are globally available

// Seeds
const SeedUserDataAccount = "SoaplanaUserData";
const SeedUserMintsAccount = "SoaplanaUserMints";
const SeedUserBurnsAccount = "SoaplanaUserBurns";
/*
// Accounts pubkeys
const [pdaUserData] = await web3.PublicKey.findProgramAddress(
  [
    anchor.utils.bytes.utf8.encode(SeedUserDataAccount),
    pg.wallet.publicKey.toBuffer(),
  ],
  pg.PROGRAM_ID
);
const [pdaUserMints] = await web3.PublicKey.findProgramAddress(
  [
    anchor.utils.bytes.utf8.encode(SeedUserMintsAccount),
    pg.wallet.publicKey.toBuffer(),
  ],
  pg.PROGRAM_ID
);
const [pdaUserBurns] = await web3.PublicKey.findProgramAddress(
  [
    anchor.utils.bytes.utf8.encode(SeedUserBurnsAccount),
    pg.wallet.publicKey.toBuffer(),
  ],
  pg.PROGRAM_ID
);
*/

// Consts
const LIST_INC_LEN = 1; // todo : 10 or 100
const MINTED_LIST_INIT_LEN = 2 * LIST_INC_LEN; // todo: 100
const BURNT_LIST_INIT_LEN = 1 * LIST_INC_LEN; // todo: 20

// Dummy types for getting rid of warnings
type PublicKey = any;

// Run once
// .only .skip
describe.skip("Initialize", () => {
  let pdaUserData: PublicKey, pdaUserMints: PublicKey, pdaUserBurns: PublicKey;

  before(async function () {
    console.info("before");
    ({ pdaUserData, pdaUserMints, pdaUserBurns } = await getPdas());
  });

  it("initialize with mint", async () => {
    // First "mint"
    const firstRandomNftMintPubkey = new web3.Keypair().publicKey;

    console.info(`pdaUserData (publicKey) : ${pdaUserData}`);
    console.info(`pdaUserMints (publicKey) : ${pdaUserMints}`);
    console.info(`pdaUserBurns (publicKey) : ${pdaUserBurns}`);
    console.info(`firstRandomNftMintPubkey : ${firstRandomNftMintPubkey}`);
    console.info(`pg.wallet.publicKey : ${pg.wallet.publicKey}`);

    // Send transaction
    const txHash = await pg.program.methods
      .initialize(firstRandomNftMintPubkey)
      .accounts({
        userData: pdaUserData,
        userMints: pdaUserMints,
        userBurns: pdaUserBurns,
        signer: pg.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([])
      .rpc();
    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

    // Confirm transaction
    await pg.connection.confirmTransaction(txHash);

    // Check newly created accounts
    // Fetch "user data"
    const newAccountUserData = await pg.program.account.userData.fetch(
      pdaUserData
    );
    // Fetch "user mints"
    const newAccountUserMints = await pg.program.account.userMints.fetch(
      pdaUserMints
    );
    // Fetch "user burns"
    const newAccountUserBurns = await pg.program.account.userBurns.fetch(
      pdaUserBurns
    );

    console.log(
      "On-chain data: lastMinted (Pubkey) = ",
      newAccountUserMints.lastMinted.toString()
    );

    // Check whether the data on-chain is equal to expected 'data'
    assert(firstRandomNftMintPubkey.equals(newAccountUserMints.lastMinted));
    assert(newAccountUserBurns.totalCountBurned == 0);
  });
});

// ------------

describe("Checks after initialize", () => {
  let pdaUserData: PublicKey, pdaUserMints: PublicKey, pdaUserBurns: PublicKey;

  before(async function () {
    console.info("before");
    ({ pdaUserData, pdaUserMints, pdaUserBurns } = await getPdas());
  });

  it("check i am owner", async () => {
    // Fetch the created "user data" account
    const newAccountUserData = await pg.program.account.userData.fetch(
      pdaUserData
    );

    console.log(
      "On-chain data: owner (Pubkey) = ",
      newAccountUserData.owner.toString()
    );

    assert(pg.wallet.publicKey.equals(newAccountUserData.owner));
  });

  it("check nft minted count is 1", async () => {
    // Fetch the created "user mints" account
    const newAccountUserMints = await pg.program.account.userMints.fetch(
      pdaUserMints
    );

    console.log(
      "On-chain data: newAccountUserMints.totalCountMinted = ",
      newAccountUserMints.totalCountMinted
    );
    console.log(
      "On-chain data: newAccountUserMints.listMinted.length = ",
      newAccountUserMints.listMinted.length
    );
    // Check whether the data on-chain is equal to expected 'data'
    assert(newAccountUserMints.totalCountMinted == 1);
    assert(newAccountUserMints.listMinted.length == 1);
  });

  it(`check nft max mintable count is ${MINTED_LIST_INIT_LEN}`, async () => {
    // Fetch the created "user mints" account
    const newAccountUserMints = await pg.program.account.userMints.fetch(
      pdaUserMints
    );

    console.log(
      "On-chain data: newAccountUserMints.maxCurrentSize = ",
      newAccountUserMints.maxCurrentSize
    );
    // Check whether the data on-chain is equal to expected 'data'
    assert(newAccountUserMints.maxCurrentSize == MINTED_LIST_INIT_LEN);
  });

  it(`check nft burnt count is 0`, async () => {
    // Fetch the created "user mints" account
    const newAccountUserBurns = await pg.program.account.userBurns.fetch(
      pdaUserBurns
    );
    console.log(
      "On-chain data: newAccountUserBurns.totalCountBurned = ",
      newAccountUserBurns.totalCountBurned
    );
    console.log(
      "On-chain data: newAccountUserBurns.listBurned.length = ",
      newAccountUserBurns.listBurned.length
    );
    // Check whether the data on-chain is equal to expected 'data'
    assert(newAccountUserBurns.totalCountBurned == 0);
    assert(newAccountUserBurns.listBurned.length == 0);
  });

  it(`check nft max burnable count is ${BURNT_LIST_INIT_LEN}`, async () => {
    // Fetch the created "user mints" account
    const newAccountUserBurns = await pg.program.account.userBurns.fetch(
      pdaUserBurns
    );

    console.log(
      "On-chain data: newAccountUserBurns.maxCurrentSize = ",
      newAccountUserBurns.maxCurrentSize
    );
    // Check whether the data on-chain is equal to expected 'data'
    assert(newAccountUserBurns.maxCurrentSize == BURNT_LIST_INIT_LEN);
  });

  /*
  it("check first mint", async () => {
    // Fetch the created "user mints" account
    const newAccountUserMints = await pg.program.account.userMints.fetch(
      // newAccountUserDataKp.publicKey
      pdaUserMints
    );

    console.log(
      "On-chain data: lastMinted (Pubkey) = ",
      newAccountUserMints.lastMinted.toString()
    );

    // Check whether the data on-chain is equal to expected 'data'
    assert(firstRandomNftMintPubkey.equals(newAccountUserMints.lastMinted));
  });
*/
});

/*
describe.skip("Adding Nfts", () => {
  it.skip(`succeeds`, async () => {
    console.log("On-chain data: newAccountUserBurns.maxCurrentSize = ", 1);
    // Check whether the data on-chain is equal to expected 'data'
    assert(1 == 1);
  });
});
*/

// .only
describe.only("Adding Nft(s)", () => {
  let pdaUserData: PublicKey, pdaUserMints: PublicKey, pdaUserBurns: PublicKey;
  let last_minted = undefined,
    list_Minted_length = undefined,
    max_current_size = undefined,
    total_count_minted = undefined;

  before(async function () {
    console.info("before");
    ({ pdaUserData, pdaUserMints, pdaUserBurns } = await getPdas());

    console.info(`pdaUserData (publicKey) : ${pdaUserData}`);
    console.info(`pdaUserMints (publicKey) : ${pdaUserMints}`);
    console.info(`pdaUserBurns (publicKey) : ${pdaUserBurns}`);
    console.info(`pg.wallet.publicKey : ${pg.wallet.publicKey}`);
    // Fetch the created "user mints" account
    const newAccountUserMints = await pg.program.account.userMints.fetch(
      pdaUserMints
    );
    last_minted = newAccountUserMints.lastMinted;
    list_Minted_length = newAccountUserMints.listMinted.length;
    max_current_size = newAccountUserMints.maxCurrentSize;
    total_count_minted = newAccountUserMints.totalCountMinted;
    console.log(
      `On-chain data: newAccountUserMints.lastMinted = ${newAccountUserMints.lastMinted}`
    );
    console.log(
      `On-chain data: newAccountUserMints.listMinted.length = ${newAccountUserMints.listMinted.length}`
    );
    console.log(
      `On-chain data: newAccountUserMints.maxCurrentSize = ${newAccountUserMints.maxCurrentSize}`
    );
    console.log(
      `On-chain data: newAccountUserMints.totalCountMinted = ${newAccountUserMints.totalCountMinted}`
    );
  });

  it(`Adds new Mint(s)`, async () => {
    // New "mint"
    const newRandomNftMintPubkey = new web3.Keypair().publicKey;
    console.info(`newRandomNftMintPubkey : ${newRandomNftMintPubkey}`);

    // Send transaction
    const txHash = await pg.program.methods
      .mint(newRandomNftMintPubkey)
      .accounts({
        userData: pdaUserData,
        userMints: pdaUserMints,
        owner: pg.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([])
      .rpc();
    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

    // Confirm transaction
    await pg.connection.confirmTransaction(txHash);

    // Fetch "user mints" account
    const accountUserMints = await pg.program.account.userMints.fetch(
      pdaUserMints
    );

    console.log(
      `On-chain data: accountUserMints.lastMinted = ${accountUserMints.lastMinted}`
    );
    console.log(
      `On-chain data: accountUserMints.listMinted.length = ${accountUserMints.listMinted.length}`
    );
    console.log(
      `On-chain data: accountUserMints.maxCurrentSize = ${accountUserMints.maxCurrentSize}`
    );
    console.log(
      `On-chain data: accountUserMints.totalCountMinted = ${accountUserMints.totalCountMinted}`
    );

    // Check whether the data on-chain is equal to expected 'data'
    assert(accountUserMints.totalCountMinted == total_count_minted + 1);
    // assert(accountUserMints.totalCountMinted == 2);
  });
});

// ==========================================================================

const getPdas = async () => {
  // Accounts pubkeys
  const [pdaUserData] = await web3.PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode(SeedUserDataAccount),
      pg.wallet.publicKey.toBuffer(),
    ],
    pg.PROGRAM_ID
  );
  const [pdaUserMints] = await web3.PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode(SeedUserMintsAccount),
      pg.wallet.publicKey.toBuffer(),
    ],
    pg.PROGRAM_ID
  );
  const [pdaUserBurns] = await web3.PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode(SeedUserBurnsAccount),
      pg.wallet.publicKey.toBuffer(),
    ],
    pg.PROGRAM_ID
  );

  return {
    pdaUserData: pdaUserData,
    pdaUserMints: pdaUserMints,
    pdaUserBurns: pdaUserBurns,
  };
};
