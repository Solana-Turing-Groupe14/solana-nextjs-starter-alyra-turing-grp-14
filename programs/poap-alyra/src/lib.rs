use anchor_lang::prelude::*;
use instructions::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod states;

// ---------- consts ----------

// Program public key
declare_id!("Chwos3p7sWSZZToE5HCe7RQLiinB2i7uvy6u9jRTReVd");

// ---------- program ----------

// module containing the program’s instruction logic
#[program]
mod poap_alyra {
    use super::*;
    /* initialize:
        called on user first mint 🪙
        or just to create user accounts
     */
    pub fn initialize(
        mut ctx_init: Context<InitializeStruct>,
        user_mints_bump: u8, user_burns_bump: u8,
        new_mints: Vec<Pubkey>,
    ) -> Result<()> {
        // create::initialize_accounts(&mut ctx_init).unwrap();
        create::initialize_accounts(&mut ctx_init, user_mints_bump, user_burns_bump).unwrap();
        if new_mints.len() > 0 {
            msg!("initialize: call add_mints");
            update_mints::add_mints_int(
                // ctx_init.accounts.user_mints.clone(),
                // ctx_init.accounts.signer.clone(),
                &mut ctx_init.accounts.user_mints,
                &mut ctx_init.accounts.signer,
                ctx_init.accounts.system_program.clone(),
                new_mints,
            ).unwrap();
        }
        Ok(())
    }

    pub fn add_mints(
        mut ctx_add_mints: Context<AddMintsStruct>,
        new_mints: Vec<Pubkey>,
    ) -> Result<()> {
        update_mints::add_mints(&mut ctx_add_mints, new_mints).unwrap();
        Ok(())
    }

    pub fn burn_mints(
        mut ctx_delete_mints: Context<DeleteMintsStruct>,
        mints_to_delete: Vec<Pubkey>,
    ) -> Result<()> {
        // remove from mints
        update_mints::delete_mints(&mut ctx_delete_mints, mints_to_delete).unwrap();
        // add to burnt

        Ok(())
    }

    // -------

    // OLD STUFF TO REMOVE

    /*
    pub fn initialize(ctx: Context<InitializeStruct>, first_mint: Pubkey) -> Result<()> {
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
*/
    // pub fn count

    /*
        mint :
        called on user mints 🪙 (excepted first one)
        allocates extra space to userMints account if necessary
     */
    /*
    pub fn add_mints(ctx: Context<AddMintsStruct>, new_mints: Vec<Pubkey>) -> Result<()> {
        // let cpi_context = CpiContext::new(ctx.accounts.user_mints);

        // add_mints_int(cpi_context, new_mints);

        // let cpi_ctx = CpiContext::new(ctx.accounts., callee_accounts);

        let new_mints_len = new_mints.len();
        require!(new_mints_len > 0, SoaplanaError::AtLeastOneNft);

        let user_mints = /* &mut */ &ctx.accounts.user_mints;

        //new_mints.clone().into_iter().nth(0);

        // check length & reallocate space if necessary
        // if user_mints.max_current_size == user_mints.list_minted.len().try_into().unwrap() {
        if user_mints.max_current_size
            < (user_mints.list_minted.len() + new_mints_len)
                .try_into()
                .unwrap()
        {
            let mut increase_elements_count = max(LIST_INC_LEN, new_mints_len.try_into().unwrap());
            if user_mints.max_current_size + increase_elements_count
                - <usize as TryInto<u32>>::try_into(new_mints_len).unwrap()
                <= LIST_INC_LEN
            {
                // Add some more space and avoid to resize too often
                increase_elements_count += LIST_INC_LEN;
            }
            msg!(
                "Increase user_mints.list_minted vec length (currently {}) by {}",
                user_mints.list_minted.len(),
                increase_elements_count
            );

            let user_mints_account_info = &mut ctx.accounts.user_mints.to_account_info();
            // increase size
            let user_mints_new_len = 8 // account discriminator
             + UserMints::INIT_SPACE // initial length
             + usize::try_from( user_mints.max_current_size + increase_elements_count ).unwrap() // increase by LIST_INC_LEN
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
                "Increasing account mints size costs {} more lamports for rent",
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

            // Realloc
            user_mints_account_info.realloc(user_mints_new_len, false)?;
            let user_mints = &mut ctx.accounts.user_mints;
            user_mints.max_current_size += increase_elements_count; // Update max size
            msg!(
                "user_mints.max_current_size = {}",
                user_mints.max_current_size
            );
        }; // reallocate space

        let user_mints = &mut ctx.accounts.user_mints;
        //user_mints.last_minted = new_mint;
        user_mints.last_minted = *new_mints.last().unwrap();
        user_mints.total_count_minted += <usize as TryInto<u32>>::try_into(new_mints_len).unwrap();

        // Check
        msg!(
            "user_mints.max_current_size = {}",
            user_mints.max_current_size
        );

        // push in vector
        let list_minted = &mut user_mints.list_minted;

        // list_minted.push(new_mint);
        list_minted.extend(new_mints); // add all
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
    } // add_mints
 */
    // pub fn burn
    /*
        burn 🔥
     */
    /*
    pub fn remove_mints(ctx: Context<RemoveMintsStruct>, to_burn: Pubkey) -> Result<()> {
        let user_mints = /* &mut */ &ctx.accounts.user_mints;
        let user_burnss = /* &mut */ &ctx.accounts.user_burns;


        Ok(())

    }
     */
    /*
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
    } // pub fn unallocate
*/

} // mod soaplana_anchor

// ----------------------------------
/*
pub fn add_mints_int(ctx: Context<AddMintsIntStruct>, new_mints: Vec<Pubkey>) -> Result<()> {
    let new_mints_len = new_mints.len();
    require!(new_mints_len > 0, SoaplanaError::AtLeastOneNft);

    // let user_mints = &mut &ctx.accounts.user_mints;
    let user_mints = &ctx.accounts.user_mints;

    //new_mints.clone().into_iter().nth(0);

    // check length & reallocate space if necessary
    // if user_mints.max_current_size == user_mints.list_minted.len().try_into().unwrap() {
    if user_mints.max_current_size
        < (user_mints.list_minted.len() + new_mints_len)
            .try_into()
            .unwrap()
    {
        let mut increase_elements_count = max(LIST_INC_LEN, new_mints_len.try_into().unwrap());
        if user_mints.max_current_size + increase_elements_count
            - <usize as TryInto<u32>>::try_into(new_mints_len).unwrap()
            <= LIST_INC_LEN
        {
            // Add some more space and avoid to resize too often
            increase_elements_count += LIST_INC_LEN;
        }
        msg!(
            "Increase user_mints.list_minted vec length (currently {}) by {}",
            user_mints.list_minted.len(),
            increase_elements_count
        );

        let user_mints_account_info = &mut ctx.accounts.user_mints.to_account_info();
        // increase size
        let user_mints_new_len = 8 // account discriminator
            + UserMints::INIT_SPACE // initial length
            + usize::try_from( user_mints.max_current_size + increase_elements_count ).unwrap() // increase by LIST_INC_LEN
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
        let lamports_diff = new_minimum_balance.saturating_sub(user_mints_account_info.lamports());

        msg!(
            "Increasing account mints size costs {} more lamports for rent",
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

        // Realloc
        user_mints_account_info.realloc(user_mints_new_len, false)?;
        let user_mints = &mut ctx.accounts.user_mints;
        user_mints.max_current_size += increase_elements_count; // Update max size
        msg!(
            "user_mints.max_current_size = {}",
            user_mints.max_current_size
        );
    }; // reallocate space

    let user_mints = &mut ctx.accounts.user_mints;
    //user_mints.last_minted = new_mint;
    user_mints.last_minted = *new_mints.last().unwrap();
    user_mints.total_count_minted += <usize as TryInto<u32>>::try_into(new_mints_len).unwrap();

    // Check
    msg!(
        "user_mints.max_current_size = {}",
        user_mints.max_current_size
    );

    // push in vector
    let list_minted = &mut user_mints.list_minted;

    // list_minted.push(new_mint);
    list_minted.extend(new_mints); // add all
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
} // add_mints_int
*/
/*
#[error_code]
pub enum Err {
    #[msg("realloc failed")]
    ReallocFailed,
}
*/

/*
#[error_code]
pub enum SoaplanaError {
    #[msg("Only owner can call")]
    OnlyOwner,
    #[msg("At least one Nft address must be provided")]
    AtLeastOneNft,
}
*/

// structs to indicate a list of accounts required for an instruction
/*
#[derive(Accounts)]
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
    pub system_program: Program<'info, System>, // you must pass the System Program in your accounts as system_program to create a new account
}

#[derive(Accounts)]
pub struct AddMintsStruct<'info> {
    #[account(has_one=owner @ SoaplanaError::OnlyOwner)]
    pub user_data: Account<'info, UserData>,
    #[account(mut)]
    pub user_mints: Account<'info, UserMints>,
    #[account(mut)]
    pub owner: Signer<'info>, // Verifies the account signed the transaction
    pub system_program: Program<'info, System>, // System Program required for reallocating (extending) space
}

#[derive(Accounts)]
pub struct AddMintsIntStruct<'info> {
    #[account(mut)]
    pub user_mints: Account<'info, UserMints>,
    #[account(mut)]
    pub owner: Signer<'info>, // Verifies the account signed the transaction
    pub system_program: Program<'info, System>, // System Program required for reallocating (extending) space
}
#[derive(Accounts)]
pub struct RemoveMintsStruct<'info> {
    #[account(has_one=owner @ SoaplanaError::OnlyOwner)]
    pub user_data: Account<'info, UserData>,
    #[account(mut)]
    pub user_mints: Account<'info, UserMints>,
    #[account(mut)]
    pub user_burns: Account<'info, UserBurns>,
    #[account(mut)]
    pub owner: Signer<'info>, // Verifies the account signed the transaction
    pub system_program: Program<'info, System>, // System Program required for reallocating (shrinking/extending) space
}

#[derive(Accounts)]
pub struct Unallocate<'info> {
    #[account(mut, has_one=owner @ SoaplanaError::OnlyOwner)]
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
 */
// ---------- custom account types ----------

// https://www.sec3.dev/blog/all-about-anchor-account-size
// https://book.anchor-lang.com/anchor_references/space.html

/*
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
*/
