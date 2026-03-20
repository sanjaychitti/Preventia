-- V1: Initial Preventia schema
-- Managed by Flyway

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────
-- users
-- ──────────────────────────────────────────────
CREATE TABLE users (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('DOCTOR', 'SPONSOR', 'RECIPIENT')),
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role  ON users (role);

-- ──────────────────────────────────────────────
-- appointments
-- ──────────────────────────────────────────────
CREATE TABLE appointments (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    sponsor_id        UUID        NOT NULL REFERENCES users(id),
    recipient_id      UUID        NOT NULL REFERENCES users(id),
    doctor_id         UUID        NOT NULL REFERENCES users(id),
    scheduled_at      TIMESTAMPTZ NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'REQUESTED'
                          CHECK (status IN ('REQUESTED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED')),
    daily_room_url    TEXT,
    daily_room_name   VARCHAR(255),
    recipient_token   TEXT,
    notes             TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appt_sponsor    ON appointments (sponsor_id);
CREATE INDEX idx_appt_recipient  ON appointments (recipient_id);
CREATE INDEX idx_appt_doctor     ON appointments (doctor_id);
CREATE INDEX idx_appt_status     ON appointments (status);
CREATE INDEX idx_appt_scheduled  ON appointments (scheduled_at);

-- ──────────────────────────────────────────────
-- prescription_indices
-- ──────────────────────────────────────────────
CREATE TABLE prescription_indices (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id  UUID        NOT NULL REFERENCES appointments(id),
    doctor_id       UUID        NOT NULL REFERENCES users(id),
    s3_key          VARCHAR(512) NOT NULL UNIQUE,
    file_name       VARCHAR(255) NOT NULL,
    diagnosis       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_presc_appointment  ON prescription_indices (appointment_id);
CREATE INDEX idx_presc_doctor       ON prescription_indices (doctor_id);
