package com.preventia.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Vitals recorded by a Sahayak (or self-reported by recipient) during a home visit.
 * PRD §6.1: "record BP, SpO2, and perform physical pill counts."
 */
@Entity
@Table(name = "vitals_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VitalsRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    /** Sahayak or Doctor who recorded the vitals (nullable if self-reported) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by_id")
    private User recordedBy;

    /** Linked appointment or home-visit appointment */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    /** Systolic blood pressure (mmHg) */
    @Column(name = "bp_systolic")
    private Integer bpSystolic;

    /** Diastolic blood pressure (mmHg) */
    @Column(name = "bp_diastolic")
    private Integer bpDiastolic;

    /** Blood oxygen saturation (%) */
    @Column(name = "spo2", precision = 5, scale = 2)
    private BigDecimal spo2;

    /** Pulse rate (bpm) */
    @Column(name = "pulse_rate")
    private Integer pulseRate;

    /** Body temperature (°C) */
    @Column(name = "temperature", precision = 5, scale = 2)
    private BigDecimal temperature;

    /** Free-form Sahayak field notes */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    /** True = recorded by a Sahayak (Verified); False = self-reported */
    @Column(name = "verified", nullable = false)
    @Builder.Default
    private boolean verified = false;

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private Instant recordedAt;

    @PrePersist
    void prePersist() {
        recordedAt = Instant.now();
    }
}
