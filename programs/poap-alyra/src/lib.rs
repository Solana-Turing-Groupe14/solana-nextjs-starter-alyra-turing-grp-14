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
        to call on user first mint(s) 🪙
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
        // remove from mints & add to burnt
        update_mints::delete_mints(&mut ctx_delete_mints, mints_to_delete).unwrap();
        Ok(())
    }

} // mod soaplana_anchor
