package com.preventia.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Maps an NRI Sponsor (child) to their parent in India (Recipient).
 * Consent must be granted before EMR data (medication, vitals, prescriptions) is accessible.
 */
@Entity
@Table(name = "family_relationships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamilyRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "relationship_id")
    private UUID id;

    /** NRI child (Sponsor) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sponsor_id", nullable = false)
    private User sponsor;

    /** Parent in India (Recipient) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    /**
     * Consent is essential for EMR access.
     * EMR write-access is also token-locked to the duration of the scheduled virtual session.
     */
    @Column(name = "consent_status", nullable = false)
    @Builder.Default
    private boolean consentStatus = false;

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
