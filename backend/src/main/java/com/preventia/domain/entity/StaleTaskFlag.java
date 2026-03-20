package com.preventia.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * PRD §9 Developer Safety Rail — Stale Task Lock:
 * "Tasks not completed within 12 hours of the window are flagged for Care Manager intervention."
 */
@Entity
@Table(name = "stale_task_flags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaleTaskFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** The appointment that was not completed within the 12-hour window */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @Column(name = "flagged_at", nullable = false, updatable = false)
    private Instant flaggedAt;

    /** The time by which the appointment should have been completed */
    @Column(name = "deadline_at", nullable = false)
    private Instant deadlineAt;

    @Column(name = "resolved", nullable = false)
    @Builder.Default
    private boolean resolved = false;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "resolved_by_id")
    private UUID resolvedById;

    @PrePersist
    void prePersist() {
        flaggedAt = Instant.now();
    }
}
