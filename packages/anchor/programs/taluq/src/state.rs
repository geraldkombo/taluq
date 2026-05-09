/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
use anchor_lang::prelude::*;

#[account]
pub struct ProtocolConfig {
    pub admin: Pubkey,
    pub tkes_mint: Pubkey,
    pub ykes_mint: Pubkey,
    pub switchboard_aggregator: Pubkey,
    pub current_tbill_bps: u16,
    pub last_oracle_update: i64,
    pub bump: u8,
}

impl ProtocolConfig {
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 32 + 2 + 8 + 1;
}

#[account]
pub struct UserProfile {
    pub phone_hash: [u8; 32],
    pub owner: Pubkey,
    pub is_kyc_verified: bool,
    pub ykes_principal: u64,
    pub last_harvest_ts: i64,
    pub bump: u8,
}

impl UserProfile {
    pub const SPACE: usize = 8 + 32 + 32 + 1 + 8 + 8 + 1;
}

#[account]
pub struct Escrow {
    pub amount: u64,
    pub unlock_time: i64,
    pub sender: Pubkey,
    pub merchant: Pubkey,
    pub cancelled: bool,
    pub escrow_bump: u8,
}

impl Escrow {
    pub const SPACE: usize = 8 + 8 + 8 + 32 + 32 + 1 + 1;
}

#[account]
pub struct SettlementEscrow {
    pub total_harvested: u64,
    pub bump: u8,
}

impl SettlementEscrow {
    pub const SPACE: usize = 8 + 8 + 1;
}
