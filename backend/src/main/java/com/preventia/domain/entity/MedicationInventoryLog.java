package com.preventia.domain.entity;

import com.preventia.domain.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Immutable audit log of every change to a medication inventory record.
 * PRD §7 NFR: "Every change to medication inventory must log the source
 * (System Cron, Sahayak, or User)."
 */
@Entity
@Table(name = "medication_inventory_logs")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationInventoryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inventory_id", nullable = false)
    private MedicationInventory inventory;

    @Column(name = "previous_count", nullable = false)
    private int previousCount;

    @Column(name = "new_count", nullable = false)
    private int newCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "change_source", nullable = false)
    private VerificationStatus changeSource;

    /** The user who triggered the change (null for SYSTEM_CRON). */
    @Column(name = "actor_id")
    private UUID actorId;

    /** Free-text reason / note (e.g. "Sahayak visit — pill count".) */
    @Column(name = "reason")
    private String reason;

    /**
     * Flagged when the decrease is > 50% of previous stock in one update.
     * PRD §9 Developer Safety Rail.
     */
    @Column(name = "drastic_change_flagged", nullable = false)
    @Builder.Default
    private boolean drasticChangeFlagged = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }
}
