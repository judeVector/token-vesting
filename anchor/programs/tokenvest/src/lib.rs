pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use error::*;
pub use instructions::*;
pub use state::*;

declare_id!("A6cHae2BaFZFX3jaWBqoRhR2HLoqp5RFhzfQJdt6k63");

#[program]
pub mod tokenvest {
    use super::*;

    pub fn initialize_vesting_account(
        ctx: Context<CreateVestingAccount>,
        company_name: String,
    ) -> Result<()> {
        make_vest::create_vesting_account(ctx, company_name)
    }

    pub fn create_employee_account(
        ctx: Context<CreateEmployeeAccount>,
        start_time: i64,
        end_time: i64,
        cliff_time: i64,
        total_amount: u64,
    ) -> Result<()> {
        make_employee::create_employee(ctx, start_time, end_time, cliff_time, total_amount)
    }

    pub fn claim_token(ctx: Context<ClaimToken>, company_name: String) -> Result<()> {
        claim_token::token_claiming(ctx, company_name)
    }
}
