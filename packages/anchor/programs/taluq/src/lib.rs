/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, program_pack::Pack};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_2022::spl_token_2022;
use anchor_spl::token_interface::{
    self, Burn, Mint, MintTo, TokenAccount, TokenInterface, TransferChecked,
};
use switchboard_solana::AggregatorAccountData;

mod constants;
mod errors;
mod state;

use constants::*;
use errors::*;
use state::*;

declare_id!("9QfiKQmdQamnfcL4BkyKtamKT1b39kpmSm3zKd5TMZWm");

#[program]
pub mod taluq {
    use super::*;

    pub fn initialize_protocol(ctx: Context<InitializeProtocol>, switchboard_aggregator: Pubkey) -> Result<()> {
        require!(ctx.accounts.admin.key() == master_authority(), TaluqError::Unauthorized);

        let cfg = &mut ctx.accounts.config;
        cfg.admin = ctx.accounts.admin.key();
        cfg.tkes_mint = Pubkey::default();
        cfg.ykes_mint = Pubkey::default();
        cfg.switchboard_aggregator = switchboard_aggregator;
        cfg.current_tbill_bps = 0;
        cfg.last_oracle_update = 0;
        cfg.bump = ctx.bumps.config;

        Ok(())
    }

    pub fn register_user(ctx: Context<RegisterUser>, phone_hash: [u8; 32]) -> Result<()> {
        let profile = &mut ctx.accounts.user_profile;
        profile.phone_hash = phone_hash;
        profile.owner = ctx.accounts.owner.key();
        profile.is_kyc_verified = false;
        profile.ykes_principal = 0;
        profile.last_harvest_ts = Clock::get()?.unix_timestamp;
        profile.bump = ctx.bumps.user_profile;
        Ok(())
    }

    pub fn set_user_kyc(ctx: Context<SetUserKyc>, is_kyc_verified: bool) -> Result<()> {
        require!(ctx.accounts.admin.key() == master_authority(), TaluqError::Unauthorized);
        ctx.accounts.user_profile.is_kyc_verified = is_kyc_verified;
        Ok(())
    }

    pub fn initialize_tkes_mint(ctx: Context<InitializeTkesMint>, decimals: u8) -> Result<()> {
        require!(ctx.accounts.admin.key() == master_authority(), TaluqError::Unauthorized);

        let cfg = &mut ctx.accounts.config;
        cfg.tkes_mint = ctx.accounts.tkes_mint.key();

        let mint_len = spl_token_2022::state::Mint::LEN;
        let lamports = Rent::get()?
            .minimum_balance(mint_len)
            .checked_add(0)
            .ok_or(TaluqError::MathError)?;

        let create_ix = anchor_lang::solana_program::system_instruction::create_account(
            &ctx.accounts.admin.key(),
            &ctx.accounts.tkes_mint.key(),
            lamports,
            mint_len as u64,
            ctx.accounts.token_program.key,
        );

        invoke(
            &create_ix,
            &[
                ctx.accounts.admin.to_account_info(),
                ctx.accounts.tkes_mint.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let init_mint_ix = spl_token_2022::instruction::initialize_mint2(
            ctx.accounts.token_program.key,
            &ctx.accounts.tkes_mint.key(),
            &ctx.accounts.admin.key(),
            None,
            decimals,
        )?;
        invoke(
            &init_mint_ix,
            &[
                ctx.accounts.tkes_mint.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
            ],
        )?;

        Ok(())
    }

    pub fn initialize_ykes_mint(ctx: Context<InitializeYkesMint>, decimals: u8, initial_rate_bps: i16) -> Result<()> {
        require!(ctx.accounts.admin.key() == master_authority(), TaluqError::Unauthorized);

        let cfg = &mut ctx.accounts.config;
        cfg.ykes_mint = ctx.accounts.ykes_mint.key();

        let mint_len = spl_token_2022::extension::ExtensionType::try_calculate_account_len::<
            spl_token_2022::state::Mint,
        >(&[spl_token_2022::extension::ExtensionType::InterestBearingConfig])
        .map_err(|_| TaluqError::MathError)?;

        let lamports = Rent::get()?
            .minimum_balance(mint_len)
            .checked_add(0)
            .ok_or(TaluqError::MathError)?;

        let create_ix = anchor_lang::solana_program::system_instruction::create_account(
            &ctx.accounts.admin.key(),
            &ctx.accounts.ykes_mint.key(),
            lamports,
            mint_len as u64,
            ctx.accounts.token_program.key,
        );

        invoke(
            &create_ix,
            &[
                ctx.accounts.admin.to_account_info(),
                ctx.accounts.ykes_mint.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let init_mint_ix = spl_token_2022::instruction::initialize_mint2(
            ctx.accounts.token_program.key,
            &ctx.accounts.ykes_mint.key(),
            &ctx.accounts.admin.key(),
            None,
            decimals,
        )?;
        invoke(
            &init_mint_ix,
            &[
                ctx.accounts.ykes_mint.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
            ],
        )?;

        let interest_init_ix = spl_token_2022::extension::interest_bearing_mint::instruction::initialize(
            ctx.accounts.token_program.key,
            &ctx.accounts.ykes_mint.key(),
            Some(ctx.accounts.admin.key()),
            initial_rate_bps,
        )?;
        invoke(
            &interest_init_ix,
            &[
                ctx.accounts.ykes_mint.to_account_info(),
                ctx.accounts.admin.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
            ],
        )?;

        Ok(())
    }

    pub fn refresh_tbill_rate(ctx: Context<RefreshTbillRate>, max_staleness_secs: i64) -> Result<()> {
        let cfg = &mut ctx.accounts.config;
        require!(cfg.switchboard_aggregator == ctx.accounts.aggregator.key(), TaluqError::Unauthorized);

        let clock = Clock::get()?;
        let feed = ctx.accounts.aggregator.load()?;
        feed.check_staleness(clock.unix_timestamp, max_staleness_secs)
            .map_err(|_| TaluqError::OracleStale)?;

        let value = feed.get_result().map_err(|_| TaluqError::OracleStale)?;
        let rate_percent: f64 = value.try_into().map_err(|_| TaluqError::OracleStale)?;

        let rate_bps_u64 = (rate_percent * 100.0).round() as i64;
        require!(rate_bps_u64 >= 0 && rate_bps_u64 <= i16::MAX as i64, TaluqError::MathError);
        cfg.current_tbill_bps = rate_bps_u64 as u16;
        cfg.last_oracle_update = clock.unix_timestamp;

        Ok(())
    }

    pub fn update_ykes_interest_rate(ctx: Context<UpdateYkesInterestRate>) -> Result<()> {
        require!(ctx.accounts.admin.key() == master_authority(), TaluqError::Unauthorized);

        let cfg = &ctx.accounts.config;
        require!(cfg.ykes_mint == ctx.accounts.ykes_mint.key(), TaluqError::Unauthorized);

        let new_rate: i16 = i16::try_from(cfg.current_tbill_bps).map_err(|_| TaluqError::MathError)?;

        let ix = spl_token_2022::extension::interest_bearing_mint::instruction::update_rate(
            ctx.accounts.token_program.key,
            &ctx.accounts.ykes_mint.key(),
            &ctx.accounts.admin.key(),
            &[],
            new_rate,
        )?;

        invoke(
            &ix,
            &[
                ctx.accounts.ykes_mint.to_account_info(),
                ctx.accounts.admin.to_account_info(),
                ctx.accounts.token_program.to_account_info(),
            ],
        )?;

        Ok(())
    }

    pub fn mint_tkes_from_fiat(ctx: Context<MintTkesFromFiat>, amount: u64) -> Result<()> {
        require!(ctx.accounts.admin.key() == master_authority(), TaluqError::Unauthorized);
        require!(amount > 0, TaluqError::InvalidAmount);

        let cfg = &ctx.accounts.config;
        require!(cfg.tkes_mint == ctx.accounts.tkes_mint.key(), TaluqError::Unauthorized);

        let cpi_accounts = MintTo {
            mint: ctx.accounts.tkes_mint.to_account_info(),
            to: ctx.accounts.user_tkes_ata.to_account_info(),
            authority: ctx.accounts.admin.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
        token_interface::mint_to(cpi_ctx, amount)?;

        Ok(())
    }

    pub fn deposit_tkes_for_ykes(ctx: Context<DepositTkesForYkes>, amount: u64) -> Result<()> {
        require!(amount > 0, TaluqError::InvalidAmount);
        require!(ctx.accounts.user_profile.is_kyc_verified, TaluqError::Unauthorized);

        let cfg = &ctx.accounts.config;
        require!(cfg.tkes_mint == ctx.accounts.tkes_mint.key(), TaluqError::Unauthorized);
        require!(cfg.ykes_mint == ctx.accounts.ykes_mint.key(), TaluqError::Unauthorized);

        let burn_accounts = Burn {
            mint: ctx.accounts.tkes_mint.to_account_info(),
            from: ctx.accounts.user_tkes_ata.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        };
        token_interface::burn(CpiContext::new(ctx.accounts.token_program.to_account_info(), burn_accounts), amount)?;

        let mint_accounts = MintTo {
            mint: ctx.accounts.ykes_mint.to_account_info(),
            to: ctx.accounts.user_ykes_ata.to_account_info(),
            authority: ctx.accounts.admin.to_account_info(),
        };
        token_interface::mint_to(CpiContext::new(ctx.accounts.token_program.to_account_info(), mint_accounts), amount)?;

        let profile = &mut ctx.accounts.user_profile;
        profile.ykes_principal = profile.ykes_principal.checked_add(amount).ok_or(TaluqError::MathError)?;

        Ok(())
    }

    pub fn create_escrow(ctx: Context<CreateEscrow>, amount: u64, escrow_nonce: u64) -> Result<()> {
        require!(amount > 0, TaluqError::InvalidAmount);

        let clock = Clock::get()?;
        let unlock_time = clock
            .unix_timestamp
            .checked_add(ESCROW_GRACE_PERIOD_SECS)
            .ok_or(TaluqError::MathError)?;

        let escrow = &mut ctx.accounts.escrow;
        escrow.amount = amount;
        escrow.unlock_time = unlock_time;
        escrow.sender = ctx.accounts.sender.key();
        escrow.merchant = ctx.accounts.merchant.key();
        escrow.cancelled = false;
        escrow.escrow_bump = ctx.bumps.escrow;

        let transfer_accounts = TransferChecked {
            from: ctx.accounts.sender_tkes_ata.to_account_info(),
            mint: ctx.accounts.tkes_mint.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.sender.to_account_info(),
        };
        token_interface::transfer_checked(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_accounts),
            amount,
            ctx.accounts.tkes_mint.decimals,
        )?;

        emit!(EscrowCreated {
            escrow: ctx.accounts.escrow.key(),
            sender: ctx.accounts.sender.key(),
            merchant: ctx.accounts.merchant.key(),
            amount,
            unlock_time,
            escrow_nonce,
        });

        Ok(())
    }

    pub fn cancel_escrow(ctx: Context<CancelEscrow>, escrow_nonce: u64) -> Result<()> {
        let clock = Clock::get()?;
        require!(clock.unix_timestamp < ctx.accounts.escrow.unlock_time, TaluqError::EscrowExpired);
        require!(!ctx.accounts.escrow.cancelled, TaluqError::EscrowCancelled);

        ctx.accounts.escrow.cancelled = true;

        let escrow_key = ctx.accounts.escrow.key();
        let sender_key = ctx.accounts.sender.key();
        let merchant_key = ctx.accounts.merchant.key();
        let escrow_seeds: &[&[u8]] = &[
            SEED_ESCROW,
            sender_key.as_ref(),
            merchant_key.as_ref(),
            &escrow_nonce.to_le_bytes(),
            &[ctx.accounts.escrow.escrow_bump],
        ];

        let transfer_accounts = TransferChecked {
            from: ctx.accounts.vault.to_account_info(),
            mint: ctx.accounts.tkes_mint.to_account_info(),
            to: ctx.accounts.sender_tkes_ata.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };

        token_interface::transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_accounts,
                &[escrow_seeds],
            ),
            ctx.accounts.escrow.amount,
            ctx.accounts.tkes_mint.decimals,
        )?;

        emit!(EscrowCancelledEvent { escrow: escrow_key });

        Ok(())
    }

    pub fn settle_escrow(ctx: Context<SettleEscrow>, escrow_nonce: u64) -> Result<()> {
        let clock = Clock::get()?;
        require!(clock.unix_timestamp >= ctx.accounts.escrow.unlock_time, TaluqError::EscrowNotExpired);
        require!(!ctx.accounts.escrow.cancelled, TaluqError::EscrowCancelled);

        let escrow_key = ctx.accounts.escrow.key();
        let sender_key = ctx.accounts.sender.key();
        let merchant_key = ctx.accounts.merchant.key();
        let escrow_seeds: &[&[u8]] = &[
            SEED_ESCROW,
            sender_key.as_ref(),
            merchant_key.as_ref(),
            &escrow_nonce.to_le_bytes(),
            &[ctx.accounts.escrow.escrow_bump],
        ];

        let transfer_accounts = TransferChecked {
            from: ctx.accounts.vault.to_account_info(),
            mint: ctx.accounts.tkes_mint.to_account_info(),
            to: ctx.accounts.merchant_tkes_ata.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };

        token_interface::transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_accounts,
                &[escrow_seeds],
            ),
            ctx.accounts.escrow.amount,
            ctx.accounts.tkes_mint.decimals,
        )?;

        emit!(EscrowSettled {
            escrow: escrow_key,
            settled_by: ctx.accounts.settler.key(),
        });

        Ok(())
    }

    pub fn harvest_yield(ctx: Context<HarvestYield>) -> Result<()> {
        let clock = Clock::get()?;
        let profile = &mut ctx.accounts.user_profile;
        let cfg = &ctx.accounts.config;

        let time_elapsed = clock.unix_timestamp.checked_sub(profile.last_harvest_ts).ok_or(TaluqError::MathError)?;
        if time_elapsed <= 0 {
            return Ok(());
        }

        // Interest = Principal * Rate * Time
        let rate_bps = cfg.current_tbill_bps as u64;
        let principal = profile.ykes_principal;
        
        let seconds_per_year: u64 = 365 * 24 * 3600;
        let denominator = seconds_per_year.checked_mul(10000).ok_or(TaluqError::MathError)?;
        
        let accrued_yield = principal 
            .checked_mul(rate_bps).ok_or(TaluqError::MathError)?
            .checked_mul(time_elapsed as u64).ok_or(TaluqError::MathError)?
            .checked_div(denominator)
            .ok_or(TaluqError::MathError)?;

        if accrued_yield > 0 {
            require!(cfg.ykes_mint == ctx.accounts.ykes_mint.key(), TaluqError::Unauthorized);

            let transfer_accounts = TransferChecked {
                from: ctx.accounts.user_ykes_ata.to_account_info(),
                mint: ctx.accounts.ykes_mint.to_account_info(),
                to: ctx.accounts.escrow_ykes_ata.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            };

            token_interface::transfer_checked(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    transfer_accounts,
                ),
                accrued_yield,
                ctx.accounts.ykes_mint.decimals,
            )?;

            let escrow = &mut ctx.accounts.settlement_escrow;
            escrow.total_harvested = escrow.total_harvested.checked_add(accrued_yield).ok_or(TaluqError::MathError)?;
        }

        profile.last_harvest_ts = clock.unix_timestamp;

        Ok(())
    }
}

#[event]
pub struct EscrowCreated {
    pub escrow: Pubkey,
    pub sender: Pubkey,
    pub merchant: Pubkey,
    pub amount: u64,
    pub unlock_time: i64,
    pub escrow_nonce: u64,
}

#[event]
pub struct EscrowCancelledEvent {
    pub escrow: Pubkey,
}

#[event]
pub struct EscrowSettled {
    pub escrow: Pubkey,
    pub settled_by: Pubkey,
}

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        init,
        payer = admin,
        space = ProtocolConfig::SPACE,
        seeds = [SEED_CONFIG],
        bump
    )]
    pub config: Account<'info, ProtocolConfig>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(phone_hash: [u8; 32])]
pub struct RegisterUser<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = UserProfile::SPACE,
        seeds = [SEED_USER, phone_hash.as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetUserKyc<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [SEED_USER, user_profile.phone_hash.as_ref()],
        bump = user_profile.bump
    )]
    pub user_profile: Account<'info, UserProfile>,
}

#[derive(Accounts)]
pub struct InitializeTkesMint<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [SEED_CONFIG],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,
    #[account(mut)]
    pub tkes_mint: Signer<'info>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeYkesMint<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [SEED_CONFIG],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,
    #[account(mut)]
    pub ykes_mint: Signer<'info>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RefreshTbillRate<'info> {
    #[account(
        mut,
        seeds = [SEED_CONFIG],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,
    pub aggregator: AccountLoader<'info, AggregatorAccountData>,
}

#[derive(Accounts)]
pub struct UpdateYkesInterestRate<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [SEED_CONFIG],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,
    /// CHECK: Token-2022 mint owned by the token program
    #[account(mut)]
    pub ykes_mint: AccountInfo<'info>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct MintTkesFromFiat<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        seeds = [SEED_CONFIG],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,
    pub tkes_mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub user_tkes_ata: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct DepositTkesForYkes<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        seeds = [SEED_CONFIG],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,
    #[account(
        seeds = [SEED_USER, user_profile.phone_hash.as_ref()],
        bump = user_profile.bump,
        constraint = user_profile.owner == owner.key()
    )]
    pub user_profile: Account<'info, UserProfile>,
    pub tkes_mint: InterfaceAccount<'info, Mint>,
    pub ykes_mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub user_tkes_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub user_ykes_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
#[instruction(amount: u64, escrow_nonce: u64)]
pub struct CreateEscrow<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    /// CHECK: Merchant wallet (receiver of settled funds)
    pub merchant: AccountInfo<'info>,
    #[account(
        seeds = [SEED_CONFIG],
        bump = config.bump
    )]
    pub config: Account<'info, ProtocolConfig>,
    pub tkes_mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub sender_tkes_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        payer = sender,
        space = Escrow::SPACE,
        seeds = [SEED_ESCROW, sender.key().as_ref(), merchant.key().as_ref(), &escrow_nonce.to_le_bytes()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        init,
        payer = sender,
        associated_token::mint = tkes_mint,
        associated_token::authority = escrow,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(escrow_nonce: u64)]
pub struct CancelEscrow<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    /// CHECK: Merchant wallet (seed component)
    pub merchant: AccountInfo<'info>,
    pub tkes_mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub sender_tkes_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [SEED_ESCROW, sender.key().as_ref(), merchant.key().as_ref(), &escrow_nonce.to_le_bytes()],
        bump = escrow.escrow_bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = tkes_mint,
        associated_token::authority = escrow,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
#[instruction(escrow_nonce: u64)]
pub struct SettleEscrow<'info> {
    /// CHECK: Sender wallet (seed component)
    pub sender: AccountInfo<'info>,
    /// CHECK: Merchant wallet (seed component)
    #[account(mut)]
    pub merchant: AccountInfo<'info>,
    pub tkes_mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub merchant_tkes_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [SEED_ESCROW, sender.key().as_ref(), merchant.key().as_ref(), &escrow_nonce.to_le_bytes()],
        bump = escrow.escrow_bump,
        close = merchant
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = tkes_mint,
        associated_token::authority = escrow,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub settler: Signer<'info>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct HarvestYield<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [SEED_USER, user_profile.phone_hash.as_ref()],
        bump = user_profile.bump,
        constraint = user_profile.owner == owner.key()
    )]
    pub user_profile: Account<'info, UserProfile>,
     #[account(
         init_if_needed,
        payer = owner,
        space = SettlementEscrow::SPACE,
        seeds = [SEED_SETTLEMENT_ESCROW],
        bump
    )]
    pub settlement_escrow: Account<'info, SettlementEscrow>,
    #[account(
        init_if_needed,
        payer = owner,
        associated_token::mint = ykes_mint,
        associated_token::authority = settlement_escrow,
    )]
    pub escrow_ykes_ata: InterfaceAccount<'info, TokenAccount>,
    pub ykes_mint: InterfaceAccount<'info, Mint>,
    #[account(mut)]
    pub user_ykes_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(seeds = [SEED_CONFIG], bump = config.bump)]
    pub config: Account<'info, ProtocolConfig>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
