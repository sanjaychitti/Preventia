package com.preventia.domain.entity;

import com.preventia.domain.enums.ServiceCategory;
import com.preventia.domain.enums.ServiceType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Master Product Table — Integrated Ecosystem.
 *
 * category  (customer-facing grouping): A_LA_CARTE | STANDARD | TRAVEL
 * serviceType (business logic, PRD §4.1): TRANSACTIONAL | PROCEDURAL
 *
 * Products:
 *   A-la-Carte: E-Prescription, Virtual Consult, Lab Test, Sahayak Assist
 *   Standard:   Basic, Comprehensive, Executive
 *   Travel:     Fit2Fly Lite, Fit2Fly 360
 */
@Entity
@Table(name = "service_catalog")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /** Customer-facing category: A_LA_CARTE, STANDARD, or TRAVEL */
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private ServiceCategory category;

    /** Business-logic type from PRD §4.1: TRANSACTIONAL or PROCEDURAL */
    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false)
    private ServiceType serviceType;

    /** Key features listed in the product table */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "service_catalog_features", joinColumns = @JoinColumn(name = "service_id"))
    @Column(name = "feature")
    @OrderColumn(name = "feature_order")
    private List<String> keyFeatures;

    /** Price in INR (base currency). USD conversion done on the fly via Geo-IP. */
    @Column(name = "price_inr", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceInr;

    /** Duration in minutes (for video consults etc.) */
    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }
}
