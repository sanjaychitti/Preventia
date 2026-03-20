package com.preventia.domain.entity;

import com.preventia.domain.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Tracks a recipient's medication stock level.
 *
 * State Machine (from PRD §4.2):
 *   days_remaining = total_quantity / daily_dosage
 *   Alert threshold: days_remaining ≤ 7  → "Refill Required"
 *   Drastic change: reduction > 50% in one update → verification prompt
 *
 * Verification status:
 *   VERIFIED       → updated by a Sahayak (physical pill count)
 *   SELF_REPORTED  → updated by the recipient/sponsor themselves
 *   SYSTEM_CRON    → automated daily decrement
 */
@Entity
@Table(name = "medication_inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "inventory_id")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(name = "medication_name", nullable = false)
    private String medicationName;

    @Column(name = "dosage_description")
    private String dosageDescription;

    /** Current physical stock count (units / tablets / ml etc.) */
    @Column(name = "actual_stock_count", nullable = false)
    private int actualStockCount;

    /** How many units are consumed per day */
    @Column(name = "daily_dosage", nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyDosage;

    /**
     * Computed property — not persisted.
     * days_remaining = actual_stock_count / daily_dosage
     */
    @Transient
    public BigDecimal getDaysRemaining() {
        if (dailyDosage == null || dailyDosage.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.valueOf(Long.MAX_VALUE);
        }
        return BigDecimal.valueOf(actualStockCount).divide(dailyDosage, 1, java.math.RoundingMode.FLOOR);
    }

    /** True when days_remaining ≤ 7 */
    @Transient
    public boolean isRefillRequired() {
        return getDaysRemaining().compareTo(BigDecimal.valueOf(7)) <= 0;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.SELF_REPORTED;

    @Column(name = "last_updated_by_id")
    private UUID lastUpdatedById;

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
