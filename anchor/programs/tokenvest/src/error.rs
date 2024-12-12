use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorMessage {
    #[msg("Claim not available yet!")]
    ClaimNotAvailableYet,
    #[msg("Invalid vesting period!")]
    InvalidVestingPeriod,
    #[msg("Calculation overflow!")]
    CalculationOverFlow,
    #[msg("Nothing to claim!")]
    NothingToClaim,
}
