package com.preventia.domain.enums;

/**
 * Marketing category for service catalog products.
 *
 * From the Master Product Table:
 *  A_LA_CARTE — Immediate, individual services (E-Prescription, Virtual Consult, Lab Test, Sahayak Assist)
 *  STANDARD   — Tiered health programs (Basic, Comprehensive, Executive)
 *  TRAVEL     — Pre-travel / senior traveler health screens (Fit2Fly Lite, Fit2Fly 360)
 *
 * Note: ServiceType (TRANSACTIONAL / PROCEDURAL from PRD §4.1) governs business logic;
 * ServiceCategory is the customer-facing product grouping.
 */
public enum ServiceCategory {
    A_LA_CARTE,
    STANDARD,
    TRAVEL
}
