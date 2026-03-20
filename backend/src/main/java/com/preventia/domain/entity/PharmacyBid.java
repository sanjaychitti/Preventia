package com.preventia.domain.entity;

import com.preventia.domain.enums.BidStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * A pharmacy's fulfillment bid against a prescription.
 *
 * PRD §6.3 Pharmacy Bidding System:
 *  - Pharmacies receive signed prescriptions and input INR price quotes + delivery times.
 *  - Sponsor must click [ACCEPT & PAY] before the pharmacy dispatches the medication.
 *
 * PRD §6.2 Living Prescription:
 *  - Drafting an Rx triggers a real-time price quote from pharmacy partners.
 */
@Entity
@Table(name = "pharmacy_bids")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyBid {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    /** The pharmacy submitting this bid */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pharmacy_id", nullable = false)
    private User pharmacy;

    /** Quoted total price in INR */
    @Column(name = "quoted_price_inr", nullable = false, precision = 12, scale = 2)
    private BigDecimal quotedPriceInr;

    /** Estimated delivery time in hours */
    @Column(name = "estimated_delivery_hours", nullable = false)
    private int estimatedDeliveryHours;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private BidStatus status = BidStatus.PENDING;

    /** Razorpay order/payment ID set when sponsor clicks [ACCEPT & PAY] */
    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    /** Timestamp when sponsor approved and paid */
    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @Column(name = "dispatched_at")
    private Instant dispatchedAt;

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}
