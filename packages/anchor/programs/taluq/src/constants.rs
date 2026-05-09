/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
use anchor_lang::prelude::*;
use std::str::FromStr;

pub const MASTER_AUTHORITY_STR: &str = "9QfiKQmdQamnfcL4BkyKtamKT1b39kpmSm3zKd5TMZWm";

pub fn master_authority() -> Pubkey {
    Pubkey::from_str(MASTER_AUTHORITY_STR).expect("MASTER_AUTHORITY_STR must be a valid pubkey")
}

pub const SEED_CONFIG: &[u8] = b"config";
pub const SEED_USER: &[u8] = b"user";
pub const SEED_ESCROW: &[u8] = b"escrow";
pub const SEED_SETTLEMENT_ESCROW: &[u8] = b"settlement_escrow";

pub const ESCROW_GRACE_PERIOD_SECS: i64 = 60;
