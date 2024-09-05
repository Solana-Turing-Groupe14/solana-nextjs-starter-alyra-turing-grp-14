use anchor_lang::prelude::*;

use crate::constants::*;

use crate::states::UserBurns;
use crate::states::UserData;
use crate::states::UserMints;

pub fn initialize_accounts(ctx_init: &mut Context<InitializeStruct>, user_mints_bump: u8, user_burns_bump: u8) -> Result<()> {
    ctx_init.accounts.user_data.owner = ctx_init.accounts.signer.key();
    ctx_init.accounts.user_mints.max_current_size = MINTED_LIST_INIT_LEN;
    ctx_init.accounts.user_burns.max_current_size = BURNT_LIST_INIT_LEN;

    ctx_init.accounts.user_mints.bump = user_mints_bump;
    ctx_init.accounts.user_burns.bump = user_burns_bump;

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

    Ok(())
}

#[derive(Accounts)]
#[instruction(user_mints_bump: u8, user_burns_bump: u8)]

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
        seeds = [ACCOUNT_SEED_DATA_BYTES.as_ref(), signer.key().as_ref()],
        bump
        )
    ]
    pub user_data: Account<'info, UserData>,
    // User Mints
    #[account(
        init, // allow it to be called only once
        payer = signer,
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
        payer = signer,
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
    pub system_program: Program<'info, System>, // you must pass the System Program in your accounts as system_program to create a new account
}
