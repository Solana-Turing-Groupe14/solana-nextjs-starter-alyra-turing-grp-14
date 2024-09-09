use anchor_lang::prelude::*;

#[error_code]
pub enum SoaplanaError {
    #[msg("Only owner can call")]
    OnlyOwner,
    #[msg("At least one Nft address to add must be provided")]
    AtLeastOneNftAdd,
    #[msg("At least one Nft address to delete must be provided")]
    AtLeastOneNftDel
}
