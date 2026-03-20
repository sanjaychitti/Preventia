-- V2: PRD Dhanvanthri v1.0 — family map, medication inventory, vitals, service catalog, pharmacy bids

-- Update users role check to include SAHAYAK and PHARMACY
ALTER TABLE users
    DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
    ADD CONSTRAINT users_role_check
    CHECK (role IN ('DOCTOR','SPONSOR','RECIPIENT','SAHAYAK','PHARMACY'));

-- ──────────────────────────────────────────────
-- family_relationships
-- PRD §5.1: Consent is essential for EMR access
-- ──────────────────────────────────────────────
CREATE TABLE family_relationships (
    relationship_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id       UUID        NOT NULL REFERENCES users(id),
    recipient_id     UUID        NOT NULL REFERENCES users(id),
    consent_status   BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (sponsor_id, recipient_id)
);

CREATE INDEX idx_family_sponsor   ON family_relationships (sponsor_id);
CREATE INDEX idx_family_recipient ON family_relationships (recipient_id);

-- ──────────────────────────────────────────────
-- medication_inventory
-- PRD §5.2 & §4.2: Inventory-driven state machine
-- days_remaining = actual_stock_count / daily_dosage
-- Alert when days_remaining <= 7
-- ──────────────────────────────────────────────
CREATE TABLE medication_inventory (
    inventory_id        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id        UUID          NOT NULL REFERENCES users(id),
    medication_name     VARCHAR(255)  NOT NULL,
    dosage_description  VARCHAR(255),
    actual_stock_count  INTEGER       NOT NULL CHECK (actual_stock_count >= 0),
    daily_dosage        NUMERIC(10,2) NOT NULL CHECK (daily_dosage > 0),
    verification_status VARCHAR(20)   NOT NULL DEFAULT 'SELF_REPORTED'
                            CHECK (verification_status IN ('VERIFIED','SELF_REPORTED','SYSTEM_CRON')),
    last_updated_by_id  UUID          REFERENCES users(id),
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medinv_recipient ON medication_inventory (recipient_id);

-- ──────────────────────────────────────────────
-- medication_inventory_logs (audit trail)
-- PRD §7 NFR: log the source (System Cron, Sahayak, or User)
-- PRD §9: Drastic change alert (>50% reduction in one update)
-- ──────────────────────────────────────────────
CREATE TABLE medication_inventory_logs (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id          UUID        NOT NULL REFERENCES medication_inventory(inventory_id),
    previous_count        INTEGER     NOT NULL,
    new_count             INTEGER     NOT NULL,
    change_source         VARCHAR(20) NOT NULL
                              CHECK (change_source IN ('VERIFIED','SELF_REPORTED','SYSTEM_CRON')),
    actor_id              UUID        REFERENCES users(id),
    reason                TEXT,
    drastic_change_flagged BOOLEAN    NOT NULL DEFAULT FALSE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medinvlog_inventory ON medication_inventory_logs (inventory_id);
CREATE INDEX idx_medinvlog_drastic   ON medication_inventory_logs (drastic_change_flagged) WHERE drastic_change_flagged = TRUE;

-- ──────────────────────────────────────────────
-- vitals_records
-- PRD §6.1: BP, SpO2 recorded by Sahayak or self-reported
-- PRD §6.2: Left pane shows "Verified" Sahayak logs
-- ──────────────────────────────────────────────
CREATE TABLE vitals_records (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id    UUID          NOT NULL REFERENCES users(id),
    recorded_by_id  UUID          REFERENCES users(id),
    appointment_id  UUID          REFERENCES appointments(id),
    bp_systolic     INTEGER,
    bp_diastolic    INTEGER,
    spo2            NUMERIC(5,2),
    pulse_rate      INTEGER,
    temperature     NUMERIC(5,2),
    notes           TEXT,
    verified        BOOLEAN       NOT NULL DEFAULT FALSE,
    recorded_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vitals_recipient   ON vitals_records (recipient_id);
CREATE INDEX idx_vitals_appointment ON vitals_records (appointment_id);
CREATE INDEX idx_vitals_verified    ON vitals_records (verified);

-- ──────────────────────────────────────────────
-- service_catalog
-- PRD §8: A-la-Carte (TRANSACTIONAL) and Tiered Programs (PROCEDURAL)
-- ──────────────────────────────────────────────
CREATE TABLE service_catalog (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    name             VARCHAR(255)  NOT NULL,
    description      TEXT,
    key_feature      VARCHAR(255),
    service_type     VARCHAR(20)   NOT NULL CHECK (service_type IN ('TRANSACTIONAL','PROCEDURAL')),
    price_inr        NUMERIC(12,2) NOT NULL,
    duration_minutes INTEGER,
    active           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Seed data from PRD §8
INSERT INTO service_catalog (name, key_feature, service_type, price_inr, duration_minutes)
VALUES
    ('Virtual Consult',       '20-min Video, EMR Integration',           'TRANSACTIONAL', 999.00,   20),
    ('Sahayak Assist',        'Vitals check, Med Audit',                  'TRANSACTIONAL', 1499.00,  null),
    ('Comprehensive Standard','Basic + LFT/KFT, 1 Sahayak Visit',        'PROCEDURAL',    9999.00,  null),
    ('Travel Fit2Fly 360',    'Senior Traveler Screens + DEXA',           'PROCEDURAL',    18999.00, null);

-- ──────────────────────────────────────────────
-- pharmacy_bids
-- PRD §6.3: Pharmacy bidding; Sponsor must [ACCEPT & PAY]
-- PRD §6.2: Real-time price quote when drafting Rx
-- ──────────────────────────────────────────────
CREATE TABLE pharmacy_bids (
    id                       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id          UUID          NOT NULL REFERENCES prescription_indices(id),
    pharmacy_id              UUID          NOT NULL REFERENCES users(id),
    quoted_price_inr         NUMERIC(12,2) NOT NULL,
    estimated_delivery_hours INTEGER       NOT NULL,
    status                   VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                                 CHECK (status IN ('PENDING','ACCEPTED','REJECTED','EXPIRED','DISPATCHED','DELIVERED')),
    razorpay_payment_id      VARCHAR(255),
    accepted_at              TIMESTAMPTZ,
    dispatched_at            TIMESTAMPTZ,
    delivered_at             TIMESTAMPTZ,
    notes                    TEXT,
    created_at               TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (prescription_id, pharmacy_id)
);

CREATE INDEX idx_bid_prescription ON pharmacy_bids (prescription_id);
CREATE INDEX idx_bid_pharmacy     ON pharmacy_bids (pharmacy_id);
CREATE INDEX idx_bid_status       ON pharmacy_bids (status);

-- ──────────────────────────────────────────────
-- stale_task_flags
-- PRD §9: Tasks not completed within 12 hours flagged for Care Manager
-- ──────────────────────────────────────────────
CREATE TABLE stale_task_flags (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id  UUID        NOT NULL REFERENCES appointments(id),
    flagged_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deadline_at     TIMESTAMPTZ NOT NULL,
    resolved        BOOLEAN     NOT NULL DEFAULT FALSE,
    resolved_at     TIMESTAMPTZ,
    resolved_by_id  UUID        REFERENCES users(id)
);

CREATE INDEX idx_stale_unresolved ON stale_task_flags (resolved) WHERE resolved = FALSE;
