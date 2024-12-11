#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod tokenvest {
    use super::*;

  pub fn close(_ctx: Context<CloseTokenvest>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.tokenvest.count = ctx.accounts.tokenvest.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.tokenvest.count = ctx.accounts.tokenvest.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeTokenvest>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.tokenvest.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeTokenvest<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Tokenvest::INIT_SPACE,
  payer = payer
  )]
  pub tokenvest: Account<'info, Tokenvest>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseTokenvest<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub tokenvest: Account<'info, Tokenvest>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub tokenvest: Account<'info, Tokenvest>,
}

#[account]
#[derive(InitSpace)]
pub struct Tokenvest {
  count: u8,
}
