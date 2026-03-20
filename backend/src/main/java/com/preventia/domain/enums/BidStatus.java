package com.preventia.domain.enums;

/**
 * Lifecycle state of a pharmacy fulfillment bid against a prescription.
 */
public enum BidStatus {
    PENDING,
    ACCEPTED,    // Sponsor clicked [ACCEPT & PAY]
    REJECTED,
    EXPIRED,
    DISPATCHED,
    DELIVERED
}
