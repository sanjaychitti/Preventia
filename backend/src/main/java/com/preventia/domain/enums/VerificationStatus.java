package com.preventia.domain.enums;

/**
 * Indicates who last updated a medication inventory record.
 * Sahayak updates are Verified (physical pill count); user self-updates are Self-Reported.
 */
public enum VerificationStatus {
    VERIFIED,
    SELF_REPORTED,
    SYSTEM_CRON
}
