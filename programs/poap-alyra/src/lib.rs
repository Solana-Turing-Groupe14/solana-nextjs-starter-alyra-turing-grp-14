use anchor_lang::prelude::*;

declare_id!("8Sga1hBE4oexR4E4pYQCXpvrSqCVbmyXwahnhTSjJJoh");

#[program]
pub mod poap_alyra {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
