use anchor_lang::prelude::*;
// use std::cmp::max;

use crate::constants::*;

use crate::states::UserBurns;
use crate::states::UserData;
use crate::states::UserMints;

// pub fn initialize_accounts(ctx: Context<InitializeStruct>, first_mint: Pubkey) -> Result<()> {
pub fn initialize_accounts(ctx_init: &mut Context<InitializeStruct>) -> Result<()> {
    ctx_init.accounts.user_mints.max_current_size = MINTED_LIST_INIT_LEN;
    ctx_init.accounts.user_burns.max_current_size = BURNT_LIST_INIT_LEN;
    ctx_init.accounts.user_data.owner = ctx_init.accounts.signer.key();

    msg!(
        "ctx_init.accounts.user_mints.max_current_size={} ",
        ctx_init.accounts.user_mints.max_current_size
    );
    msg!(
        "ctx_init.accounts.user_burns.max_current_size={} ",
        ctx_init.accounts.user_burns.max_current_size
    );
    msg!(
        "Set  first mint: ctx.ctx_init.accounts.user_data.owner={} ",
        ctx_init.accounts.user_data.owner
    );

    /*
    let user_data = &mut ctx.accounts.user_data;
    let user_mints = &mut ctx.accounts.user_mints;
    let user_burns = &mut ctx.accounts.user_burns;

    user_mints.last_minted = first_mint;
    user_mints.total_count_minted = 1;
    user_mints.max_current_size = MINTED_LIST_INIT_LEN;

    // user_mints.total_count_minted = 0; // should be 0 by default ?
    user_burns.max_current_size = BURNT_LIST_INIT_LEN;

    // push in vector
    let list_minted = &mut user_mints.list_minted;
    list_minted.push(first_mint);

    user_data.owner = ctx.accounts.signer.key();
    msg!(
        "Set  first mint: ctx.accounts.user_mint_data.last_minted={} ",
        user_mints.last_minted
    );
    msg!(
        "Set  first mint: ctx.accounts.user_data.owner={} ",
        user_data.owner
    );
*/
    Ok(())
}

#[derive(Accounts)]
//#[instruction(first_mint: Pubkey)]
#[instruction()]

//#[derive(Accounts)]
pub struct InitializeStruct<'info> {
    // We must specify the space in order to initialize each account.
    // First 8 bytes are default account discriminator then account "real" data
    // User data
    #[account(
        init, // allow it to be called only once
        payer = signer,
        space = 8 // discriminator
            + UserData::INIT_SPACE,
        // seeds = [b"account".as_ref(), signer.key().as_ref()],
        seeds = [ACCOUNT_SEED_DATA_BYTES.as_ref(), signer.key().as_ref()],
        bump
        )
    ]
    pub user_data: Account<'info, UserData>,
    // User Mints
    #[account(
        init, // allow it to be called only once
        // init_if_needed,
        payer = signer,
        // space = 8 + 8 + 2
        space = 8 // discriminator
            + UserMints::INIT_SPACE,
        seeds = [ACCOUNT_SEED_MINTS_BYTES.as_ref(), signer.key().as_ref()],
        bump
        )
    ]
    pub user_mints: Account<'info, UserMints>,
    // User Burns
    #[account(
        init, // allow it to be called only once
        // init_if_needed,
        payer = signer,
        // space = 8 + 8 + 2
        space = 8 // discriminator
            + UserBurns::INIT_SPACE,
        seeds = [ACCOUNT_SEED_BURNS_BYTES.as_ref(), signer.key().as_ref()],
        bump
        )
    ]
    pub user_burns: Account<'info, UserBurns>,
    // Signer, sys prog
    #[account(mut)]
    pub signer: Signer<'info>, // Verifies the account signed the transaction
    // #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>, // you must pass the System Program in your accounts as system_program to create a new account
}
