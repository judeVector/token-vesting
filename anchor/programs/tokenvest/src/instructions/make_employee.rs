use anchor_lang::prelude::*;

use crate::{EmployeeAccount, VestingAccount, ANCHOR_DISCRIMINATOR};

#[derive(Accounts)]
pub struct CreateEmployeeAccount<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub beneficiary: SystemAccount<'info>,

    #[account(
        has_one = owner,
    )]
    pub vesting_account: Account<'info, VestingAccount>,

    #[account(
        init,
        payer = owner,
        space = ANCHOR_DISCRIMINATOR + EmployeeAccount::INIT_SPACE,
        seeds = [b"employee_vesting", beneficiary.key().as_ref(), vesting_account.key().as_ref()],
        bump
    )]
    pub employee_account: Account<'info, EmployeeAccount>,
    pub system_program: Program<'info, System>,
}

pub fn create_employee(
    ctx: Context<CreateEmployeeAccount>,
    start_time: i64,
    end_time: i64,
    cliff_time: i64,
    total_amount: u64,
) -> Result<()> {
    ctx.accounts.employee_account.set_inner(EmployeeAccount {
        beneficiary: ctx.accounts.beneficiary.key(),
        start_time,
        end_time,
        cliff_time,
        total_amount,
        total_withdrawn: 0,
        vesting_account: ctx.accounts.vesting_account.key(),
        bump: ctx.bumps.employee_account,
    });
    Ok(())
}
