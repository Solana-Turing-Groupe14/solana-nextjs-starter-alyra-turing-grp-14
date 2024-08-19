// use anchor_lang::constant;

static ACCOUNT_SEED_DATA: &'static str = "AlyraPoapUserData";
static ACCOUNT_SEED_MINTS: &'static str = "AlyraPoapUserMints";
static ACCOUNT_SEED_BURNS: &'static str = "AlyraPoapUserBurns";

pub static ACCOUNT_SEED_DATA_BYTES: &[u8] = ACCOUNT_SEED_DATA.as_bytes();
pub static ACCOUNT_SEED_MINTS_BYTES: &[u8] = ACCOUNT_SEED_MINTS.as_bytes();
pub static ACCOUNT_SEED_BURNS_BYTES: &[u8] = ACCOUNT_SEED_BURNS.as_bytes();

pub const LIST_INC_LEN: u32 = 1; // todo : 10 or 100
pub const MINTED_LIST_INIT_LEN: u32 = 2 * LIST_INC_LEN; // todo: 100
pub const BURNT_LIST_INIT_LEN: u32 = 1 * LIST_INC_LEN; // todo: 20
