package com.preventia.domain.enums;

/**
 * Transactional = immediate A-la-Carte services (e.g. Virtual Consult, Sahayak Assist).
 * Procedural   = multi-step linear journeys (Sample → Lab → Review).
 */
public enum ServiceType {
    TRANSACTIONAL,
    PROCEDURAL
}
