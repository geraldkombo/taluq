/* Work Product of Gerald Kombo. Trading as Gerald Kombo (Digital Services). Intellectual Property Rights Reserved. */
use anchor_lang::prelude::*;

#[error_code]
pub enum TaluqError {
    #[msg("Unauthorized: master authority required")]
    Unauthorized,
    #[msg("Math overflow/underflow")]
    MathError,
    #[msg("Escrow time lock has not yet expired (60s grace period active)")]
    EscrowNotExpired,
    #[msg("Escrow time lock has expired (cancellation no longer permitted)")]
    EscrowExpired,
    #[msg("Escrow already cancelled")]
    EscrowCancelled,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Oracle staleness check failed")]
    OracleStale,
}
