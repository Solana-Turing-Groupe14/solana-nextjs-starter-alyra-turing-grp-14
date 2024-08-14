use anchor_lang::prelude::*;

use crate::constants::*;

// ---------- custom account types ----------

// https://www.sec3.dev/blog/all-about-anchor-account-size
// https://book.anchor-lang.com/anchor_references/space.html

#[account]
#[derive(InitSpace)]
pub struct UserData {
    // pub bump: u8,
    pub owner: Pubkey,
    // owners: [Pubkey;5]
}

#[account]
#[derive(InitSpace)]
pub struct UserMints {
    pub bump: u8,
    // owner: Pubkey,
    // owners: [Pubkey;5]
    pub last_minted: Pubkey,     // 32 bytes
    pub total_count_minted: u32, // 8 bytes
    pub max_current_size: u32,   // 8 bytes ; number of elements in Vec
    #[max_len(MINTED_LIST_INIT_LEN)]
    pub list_minted: Vec<Pubkey>, // 4(vec)+32(Pubkey) bytes * MINTED_LIST_INIT_LEN
}

#[account]
#[derive(InitSpace)]
pub struct UserBurns {
    pub bump: u8,
    // owner: Pubkey,
    // owners: [Pubkey;5]
    pub last_burned: Pubkey,     // 32 bytes
    pub total_count_burned: u32, // 8 bytes
    pub max_current_size: u32,   // 8 bytes ; number of elements in Vec
    #[max_len(BURNT_LIST_INIT_LEN)]
    pub list_burned: Vec<Pubkey>, // 4(vec)+32(Pubkey) bytes * BURNT_LIST_INIT_LEN
}
