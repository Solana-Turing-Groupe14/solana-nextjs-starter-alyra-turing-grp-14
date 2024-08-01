use anchor_lang::prelude::*;
use anchor_lang::system_program;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("AQ6XjNSkYoAkoZKj47zYBPWDHNJywBhu5BE8VvE9RArP");

static ACCOUNT_SEED_DATA: &'static str = "SoaplanaUserData";
static ACCOUNT_SEED_MINTS: &'static str = "SoaplanaUserMints";
static ACCOUNT_SEED_BURNS: &'static str = "SoaplanaUserBurns";

pub static ACCOUNT_SEED_DATA_BYTES: &[u8] = ACCOUNT_SEED_DATA.as_bytes();
pub static ACCOUNT_SEED_MINTS_BYTES: &[u8] = ACCOUNT_SEED_MINTS.as_bytes();
pub static ACCOUNT_SEED_BURNS_BYTES: &[u8] = ACCOUNT_SEED_BURNS.as_bytes();

const LIST_INC_LEN: u32 = 1; // todo : 10 or 100
const MINTED_LIST_INIT_LEN: u32 = 2 * LIST_INC_LEN; // todo: 100
const BURNT_LIST_INIT_LEN: u32 = 1 * LIST_INC_LEN; // todo: 20

// module containing the program’s instruction logic
#[program]
mod soaplana_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, first_mint: Pubkey) -> Result<()> {
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
        Ok(())
    }

    // pub fn count
    // minted - burned

    // pub fn mint
    // minted + 1
    // reallocate when minted override current vec length
    pub fn mint(ctx: Context<Mint>, new_mint: Pubkey) -> Result<()> {
        let user_mints = /* &mut */ &ctx.accounts.user_mints;

        // check length & reallocate space if necessary
        if user_mints.max_current_size == user_mints.list_minted.len().try_into().unwrap() {
            msg!(
                "Increase user_mints.list_minted vec length (currently {}) by {}",
                user_mints.list_minted.len(),
                LIST_INC_LEN
            );

            let user_mints_account_info = &mut ctx.accounts.user_mints.to_account_info();

            // increase size
            let user_mints_new_len = 8 // account discriminator
             + UserMints::INIT_SPACE // initial length
             + usize::try_from( user_mints.max_current_size /*- MINTED_LIST_INIT_LEN*/ + LIST_INC_LEN ).unwrap() // increase by LIST_INC_LEN
                * (usize::try_from( 32+4 ).unwrap()) // vec of addresses: 4(vec)+32(Pubkey) bytes
             + 0 // safety
             ;
            msg!(
                "Increase account mints size from {} to  {}",
                user_mints_account_info.data_len(),
                user_mints_new_len
            );

            let user_mints_account_info = &mut ctx.accounts.user_mints.to_account_info();

            // Fund account with rent difference
            let rent = Rent::get()?;
            let new_minimum_balance = rent.minimum_balance(user_mints_new_len);
            let lamports_diff =
                new_minimum_balance.saturating_sub(user_mints_account_info.lamports());

            msg!(
                "Increasing account mints size costs {} more lamports",
                lamports_diff
            );
            let cpi_context = CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.owner.to_account_info().clone(),
                    to: user_mints_account_info.clone(),
                },
            );
            anchor_lang::system_program::transfer(cpi_context, lamports_diff)?;

            /*
            let cpi_context = CpiContext::new(
    ctx.accounts.system_program.to_account_info(), 
    system_program::Transfer {
        from: ctx.accounts.account_a.clone(),
        to: ctx.accounts.account_b.clone(),
    });
system_program::transfer(cpi_context, bid_amount)?;
*/
            // Realloc
            user_mints_account_info.realloc(user_mints_new_len, false)?;
            let user_mints = &mut ctx.accounts.user_mints;
            user_mints.max_current_size += LIST_INC_LEN; // Update max size
            msg!(
                "user_mints.max_current_size = {}",
                user_mints.max_current_size
            );
        };

        let user_mints = &mut ctx.accounts.user_mints;
        user_mints.last_minted = new_mint;
        user_mints.total_count_minted += 1;

        // Check
        msg!(
            "user_mints.max_current_size = {}",
            user_mints.max_current_size
        );

        // push in vector
        let list_minted = &mut user_mints.list_minted;

        list_minted.push(new_mint);
        msg!(
            "Set  first mint: ctx.accounts.user_mint_data.last_minted={} ",
            user_mints.last_minted
        );
        // Check
        msg!(
            "user_mints.list_minted.len() = {}",
            user_mints.list_minted.len()
        );

        Ok(())
    }

    // pub fn burn
    // burned + 1
    // reallocate
    /*
    pub fn extend(ctx: Context<Extend>) -> Result<()> {
        msg!("Account space extended ");
        Ok(())
    }
    */

    pub fn unallocate(ctx: Context<Unallocate>) -> Result<()> {
        let user_data = &mut ctx.accounts.user_data.to_account_info();
        let user_mints = &mut ctx.accounts.user_mints.to_account_info();
        let user_burns = &mut ctx.accounts.user_burns.to_account_info();

        // Refund to caller/owner
        // user_data
        let lamports = user_data.to_account_info().lamports();
        user_data.sub_lamports(lamports)?;
        ctx.accounts.owner.add_lamports(lamports)?;

        // user_mints
        let lamports = user_mints.to_account_info().lamports();
        user_mints.sub_lamports(lamports)?;
        ctx.accounts.owner.add_lamports(lamports)?;

        // user_burns
        let lamports = user_burns.to_account_info().lamports();
        user_burns.sub_lamports(lamports)?;
        ctx.accounts.owner.add_lamports(lamports)?;

        // Free
        // the assign method changes the owner
        user_data.assign(&system_program::ID);
        /*let res = */
        user_data.realloc(0, false)?;

        // the assign method changes the owner
        user_mints.assign(&system_program::ID);
        /*let res = */
        user_mints.realloc(0, false)?;

        // the assign method changes the owner
        user_burns.assign(&system_program::ID);
        /*let res = */
        user_burns.realloc(0, false)?;

        /*
        if !res.is_ok() {
            return err!(Err::ReallocFailed);
        }
        */

        Ok(())
    }

}

/*
pub fn edit(ctx: Context<DataEdit>,data: u8) -> Result<()> {
    let my_data = &mut ctx.accounts.my_data;
    let owner = &ctx.accounts.owner.key();

    require!(my_data.owners.contains(owner),Errors::NotAnOwner); // Multiple owners

    my_data.data = data;
    Ok(())
}
 */
/*
#[error_code]
pub enum Err {
    #[msg("realloc failed")]
    ReallocFailed,
}
*/

#[error_code]
pub enum OnlyOwner {
    #[msg("Only owner can call")]
    WrongUser,
}

// structs to indicate a list of accounts required for an instruction

#[derive(Accounts)]
pub struct Initialize<'info> {
    // We must specify the space in order to initialize an account.
    // First 8 bytes are default account discriminator,
    // next 8 bytes come from UserMintData.raw_data being type u64.
    // (u64 = 64 bits unsigned integer = 8 bytes)
    #[account(
        init, // allow it to be called only once
        // init_if_needed,
        payer = signer,
        // space = 8 + 8 + 2
        space = 8 // discriminator
            + UserData::INIT_SPACE,
        // seeds = [b"account".as_ref(), signer.key().as_ref()],
        seeds = [ACCOUNT_SEED_DATA_BYTES.as_ref(), signer.key().as_ref()],
        bump
        )
    ]
    pub user_data: Account<'info, UserData>,

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

    #[account(mut)]
    pub signer: Signer<'info>, // Verifies the account signed the transaction
    pub system_program: Program<'info, System>, // you must pass the System Program in your accounts as system_program to create a new account
}

#[derive(Accounts)]
pub struct Mint<'info> {
    #[account(has_one=owner @ OnlyOwner::WrongUser)]
    pub user_data: Account<'info, UserData>,
    #[account(mut)]
    pub user_mints: Account<'info, UserMints>,
    #[account(mut)]
    pub owner: Signer<'info>, // Verifies the account signed the transaction
    pub system_program: Program<'info, System>, // System Program required for reallocating (extending) space
}

#[derive(Accounts)]
pub struct Unallocate<'info> {
    #[account(mut, has_one=owner @ OnlyOwner::WrongUser)]
    pub user_data: Account<'info, UserData>,
    #[account(mut)]
    pub user_mints: Account<'info, UserMints>,
    #[account(mut)]
    pub user_burns: Account<'info, UserBurns>,
    // #[account(mut)]
    //#[account(mut, has_one = authority @)] // ensure owner only call it
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>, // System Program required for sending lamports & unallocating space
}
/* 
#[derive(Accounts)]
pub struct Extend<'info> {
    #[account(mut, has_one=owner @ OnlyOwner::WrongUser)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [ACCOUNT_SEED_BYTES.as_ref(), signer.key().as_ref()],
        bump,
        realloc = 8 + std::mem::size_of::() + 1000, // TODO
        realloc::payer = payer,
        realloc::zero = false, // Keep existing data !
    )]
    pub user_mint_data: Account<'info, UserMintData>,
    pub system_program: Program<'info, System>,
}
*/
/*
#[derive(Accounts)]
pub struct ExtendMint<'info> {
    #[account(
        mut,
        seeds = [ACCOUNT_SEED_BYTES.as_ref(), signer.key().as_ref()],
        bump,
        realloc = 8 // bump
            + std::mem::size_of_val(&user_mint_data) + std::mem::size_of::<UserMintData>()
            + 32

        realloc::payer = signer,
        realloc::zero = false
    )]
    pub user_mint_data: Account<'info, UserMintData>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>
}
*/

// custom account types

// https://www.sec3.dev/blog/all-about-anchor-account-size
// https://book.anchor-lang.com/anchor_references/space.html

#[account]
#[derive(InitSpace)]
pub struct UserData {
    owner: Pubkey,
    // owners: [Pubkey;5]
}

#[account]
#[derive(InitSpace)]
pub struct UserMints {
    // owner: Pubkey,
    // owners: [Pubkey;5]
    last_minted: Pubkey,     // 32 bytes
    total_count_minted: u32, // 8 bytes
    max_current_size: u32,   // 8 bytes ; number of elements in Vec
    #[max_len(MINTED_LIST_INIT_LEN)]
    list_minted: Vec<Pubkey>, // 4(vec)+32(Pubkey) bytes * MINTED_LIST_INIT_LEN
}

#[account]
#[derive(InitSpace)]
pub struct UserBurns {
    // owner: Pubkey,
    // owners: [Pubkey;5]
    last_burned: Pubkey,     // 32 bytes
    total_count_burned: u32, // 8 bytes
    max_current_size: u32,   // 8 bytes ; number of elements in Vec
    #[max_len(BURNT_LIST_INIT_LEN)]
    list_burned: Vec<Pubkey>, // 4(vec)+32(Pubkey) bytes * BURNT_LIST_INIT_LEN
}
