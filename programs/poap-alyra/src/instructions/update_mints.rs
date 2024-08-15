use anchor_lang::prelude::*;
// use solana_program::system_instruction;
// use anchor_lang::system_program::{Transfer, transfer};

use std::cmp::max;
use std::{collections::BTreeSet, iter::FromIterator};
//use crate::accounts::*;
use crate::constants::*;

use crate::errors::SoaplanaError;

use crate::states::UserData;
use crate::states::UserMints;
use crate::states::UserBurns;

//pub mod accounts;

pub fn add_mints(
    ctx_add_mints: &mut Context<AddMintsStruct>,
    new_mints: Vec<Pubkey>,
) -> Result<()> {
    add_mints_int(
        &mut ctx_add_mints.accounts.user_mints,
        &mut ctx_add_mints.accounts.owner,
        ctx_add_mints.accounts.system_program.clone(),
        new_mints,
    ).unwrap();

    Ok(())
}

pub fn add_mints_int<'info>(
    // user_data: Account<'info, UserData>,
    user_mints: &mut Account<'info, UserMints>,
    owner: &mut Signer<'info>,
    system_program: Program<'info, System>,
    new_mints: Vec<Pubkey>,
) -> Result<()> {
    let new_mints_len = new_mints.len();
    require!(new_mints_len > 0, SoaplanaError::AtLeastOneNftAdd);

    // check length & reallocate space if necessary
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

        let user_mints_account_info = &mut user_mints.to_account_info();
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

        let user_mints_account_info = &mut user_mints.to_account_info();

        // Fund account with rent difference
        let rent = Rent::get()?;
        let new_minimum_balance = rent.minimum_balance(user_mints_new_len);
        let lamports_diff = new_minimum_balance.saturating_sub(user_mints_account_info.lamports());

        msg!(
            "Increasing account mints size costs {} more lamports for rent",
            lamports_diff
        );
        let cpi_context = CpiContext::new(
            system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: owner.to_account_info().clone(),
                to: user_mints_account_info.clone(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, lamports_diff)?;

        // Realloc
        user_mints_account_info.realloc(user_mints_new_len, false)?;

        user_mints.max_current_size += increase_elements_count; // Update max size
        msg!(
            "user_mints.max_current_size = {}",
            user_mints.max_current_size
        );
    }; // reallocate space

    // let user_mints = &mut ctx.accounts.user_mints;
    // let user_mints = &mut user_mints;

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

    list_minted.extend(new_mints); // add all
    msg!(
        "Set  last mint: ctx.accounts.user_mint_data.last_minted={} ",
        user_mints.last_minted
    );
    // Check
    msg!(
        "user_mints.list_minted.len() = {}",
        user_mints.list_minted.len()
    );

    Ok(())
} // add_mints_int

pub fn delete_mints(
    ctx_delete_mints: &mut Context<DeleteMintsStruct>,
    mints_to_delete: Vec<Pubkey>,
) -> Result<()> {
    delete_mints_int(
        &mut ctx_delete_mints.accounts.user_mints,
        &mut ctx_delete_mints.accounts.user_burns,
        &mut ctx_delete_mints.accounts.owner,
        ctx_delete_mints.accounts.system_program.clone(),
        mints_to_delete,
    ).unwrap();

    Ok(())
}

pub fn delete_mints_int<'info>(
    user_mints: &mut Account<'info, UserMints>,
    user_burns: &mut Account<'info, UserBurns>,
    owner: &mut Signer<'info>,
    system_program: Program<'info, System>,
    mints_to_delete: Vec<Pubkey>,
) -> Result<()> {
    let mints_to_delete_len = mints_to_delete.len();
    require!(mints_to_delete_len > 0, SoaplanaError::AtLeastOneNftDel);

    let delete_elements_count = user_mints.max_current_size - <usize as TryInto<u32>>::try_into(user_mints.list_minted.len()).unwrap() // currently free slots
        +  <usize as TryInto<u32>>::try_into(mints_to_delete_len).unwrap() // slots to delete
        - LIST_INC_LEN; // slots to keep

    msg!("Removing {} elements, deleting {} slots", mints_to_delete_len, delete_elements_count);


    msg!(
        "Before removal user_mints.list_minted.len() = {}",
        user_mints.list_minted.len()
    );

    // remove each from vec
    let to_remove = BTreeSet::from_iter(mints_to_delete.clone());
    user_mints.list_minted.retain(|e| !to_remove.contains(e));

    msg!(
        "After removal user_mints.list_minted.len() = {}",
        user_mints.list_minted.len()
    );

    // Rent difference
    let rent = Rent::get()?;
    // check length & reallocate space if necessary
    if user_mints.max_current_size - <usize as TryInto<u32>>::try_into(mints_to_delete_len).unwrap()
        > LIST_INC_LEN
    {
        let user_mints_account_info = &mut user_mints.to_account_info();
        // increase size
        let user_mints_new_len = 8 // account discriminator
                + UserMints::INIT_SPACE // initial length
                + usize::try_from( user_mints.max_current_size - delete_elements_count ).unwrap() // decrease by LIST_INC_LEN
                * (usize::try_from( 32+4 ).unwrap()) // vec of addresses: 4(vec)+32(Pubkey) bytes
                + 0 // safety
                ;
        msg!(
            "Decrease account mints size from {} to {}",
            user_mints_account_info.data_len(),
            user_mints_new_len
        );
        // Resize
        let user_mints_account_info = &mut user_mints.to_account_info();
        user_mints_account_info.realloc(user_mints_new_len, false)?;
        user_mints.max_current_size -= delete_elements_count; // Update max size
        msg!(
            "user_mints.max_current_size = {}",
            user_mints.max_current_size
        );

        // // Rent difference
        // let rent = Rent::get()?;
        let user_mints_new_minimum_balance = rent.minimum_balance(user_mints_new_len);
        let lamports_diff = user_mints_account_info.lamports().saturating_sub(user_mints_new_minimum_balance);

        msg!(
            "Moving {} lamports from account mints to account burns for rent",
            lamports_diff
        );

        // Move amount from Mints to Burns
        // user_mints_account_info.sub_lamports(lamports_diff)?;
        // // owner.add_lamports(lamports_diff)?; // refund owner
        // user_burns.add_lamports(lamports_diff)?;

    }
    let user_burns_account_info = &mut user_burns.to_account_info();
    // increase size
    if  <u32 as TryInto<usize>>::try_into(user_burns.max_current_size).unwrap()
        < (user_burns.list_burned.len() + mints_to_delete_len)
        {
            let mut increase_burns_elements_count = max(LIST_INC_LEN, mints_to_delete_len.try_into().unwrap());
            if user_burns.max_current_size + increase_burns_elements_count
                - <usize as TryInto<u32>>::try_into(mints_to_delete_len).unwrap()
                <= LIST_INC_LEN
            {
                // Add some more space and avoid to resize too often
                increase_burns_elements_count += LIST_INC_LEN;
            }
            msg!(
                "Increase user_burns.list_burned vec length (currently {}) by {}",
                user_burns.list_burned.len(),
                increase_burns_elements_count
            );
            //let user_burns_increase_elements_count = user_burns.total_count_burned + <usize as TryInto<u32>>::try_into(mints_to_delete_len).unwrap() - user_burns.max_current_size + ;
            let user_burns_new_len = 8 // account discriminator
                    + UserBurns::INIT_SPACE // initial length
                    + usize::try_from( user_burns.max_current_size + increase_burns_elements_count ).unwrap() // increase by increase_burns_elements_count
                    * (usize::try_from( 32+4 ).unwrap()) // vec of addresses: 4(vec)+32(Pubkey) bytes
                    + 0 // safety
                    ;
            let user_burns_new_minimum_balance = rent.minimum_balance(user_burns_new_len);
            let lamports_diff = user_burns_new_minimum_balance.saturating_sub(user_burns_account_info.lamports());
        
            msg!(
                "Increasing account burns size costs {} more lamports for rent",
                lamports_diff
            );
        
            let cpi_context = CpiContext::new(
                system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: owner.to_account_info().clone(),
                    to: user_burns_account_info.clone(),
                },
            );
            anchor_lang::system_program::transfer(cpi_context, lamports_diff)?;
            user_burns_account_info.realloc(user_burns_new_len, false)?;
            // user_burns.max_current_size += increase_burns_elements_count; // Update max size
            // user_burns.max_current_size = user_burns.list_burned.len() + increase_burns_elements_count; // Update max size
            user_burns.max_current_size = <usize as TryInto<u32>>::try_into(user_burns.list_burned.len()).unwrap() + increase_burns_elements_count; // Update max size
            
            
        }
    user_burns.last_burned = *mints_to_delete.last().unwrap(); // set last burned
    user_burns.total_count_burned += <usize as TryInto<u32>>::try_into(mints_to_delete_len).unwrap(); // update total count
    user_burns.list_burned.extend(mints_to_delete); // add all deleted to burned list

    Ok(())
}

#[derive(Accounts)]
#[instruction(new_mints: Vec<Pubkey>)]
pub struct AddMintsStruct<'info> {
    #[account(has_one=owner @ SoaplanaError::OnlyOwner)]
    pub user_data: Account<'info, UserData>,
    #[account(mut)]
    pub user_mints: Account<'info, UserMints>,
    #[account(mut)]
    pub owner: Signer<'info>, // Verifies the account signed the transaction
    // #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>, // System Program required for reallocating (extending) space
}

#[derive(Accounts)]
#[instruction(new_mints: Vec<Pubkey>)]
pub struct DeleteMintsStruct<'info> {
    #[account(has_one=owner @ SoaplanaError::OnlyOwner)]
    pub user_data: Account<'info, UserData>,
    #[account(mut)]
    pub user_mints: Account<'info, UserMints>,
    #[account(mut)]
    pub user_burns: Account<'info, UserBurns>,
    #[account(mut)]
    pub owner: Signer<'info>, // Verifies the account signed the transaction
    // #[account(address = system_program::ID)]
    pub system_program: Program<'info, System>, // System Program required for reallocating (extending) space
}
