-- V3: Master Product Table — Integrated Ecosystem
-- Replaces V2 seed data with the full 9-product catalog
-- Categories: A_LA_CARTE, STANDARD, TRAVEL
-- Pricing in INR (base currency; USD via Geo-IP at runtime)

-- ─────────────────────────────────────────────────────────
-- Schema changes
-- ─────────────────────────────────────────────────────────

-- Add customer-facing category column
ALTER TABLE service_catalog
    ADD COLUMN IF NOT EXISTS category VARCHAR(20) NOT NULL DEFAULT 'A_LA_CARTE'
    CHECK (category IN ('A_LA_CARTE','STANDARD','TRAVEL'));

-- Add sort_order for consistent display ordering
ALTER TABLE service_catalog
    ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Replace old single key_feature text with a normalised features table
CREATE TABLE IF NOT EXISTS service_catalog_features (
    service_id    UUID    NOT NULL REFERENCES service_catalog(id) ON DELETE CASCADE,
    feature       TEXT    NOT NULL,
    feature_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (service_id, feature_order)
);

-- ─────────────────────────────────────────────────────────
-- Wipe V2 seed data and re-seed with the full product table
-- ─────────────────────────────────────────────────────────
DELETE FROM service_catalog_features;
DELETE FROM service_catalog;

-- ── A-la-Carte (TRANSACTIONAL) ───────────────────────────

INSERT INTO service_catalog (id, name, description, category, service_type, price_inr, duration_minutes, sort_order)
VALUES
  ('00000001-0000-0000-0000-000000000001',
   'E-Prescription',
   'Quick Rx Issuance/Renewal',
   'A_LA_CARTE', 'TRANSACTIONAL',
   499.00, NULL, 1),

  ('00000001-0000-0000-0000-000000000002',
   'Virtual Consult',
   '20-min Video Session',
   'A_LA_CARTE', 'TRANSACTIONAL',
   999.00, 20, 2),

  ('00000001-0000-0000-0000-000000000003',
   'Lab Test',
   'Individual Diagnostics',
   'A_LA_CARTE', 'TRANSACTIONAL',
   799.00, NULL, 3),

  ('00000001-0000-0000-0000-000000000004',
   'Sahayak Assist',
   'Health Coach Visit',
   'A_LA_CARTE', 'TRANSACTIONAL',
   1499.00, 60, 4);

-- ── Standard (PROCEDURAL) ────────────────────────────────

INSERT INTO service_catalog (id, name, description, category, service_type, price_inr, duration_minutes, sort_order)
VALUES
  ('00000002-0000-0000-0000-000000000001',
   'Basic',
   'Essential Check',
   'STANDARD', 'PROCEDURAL',
   4999.00, NULL, 5),

  ('00000002-0000-0000-0000-000000000002',
   'Comprehensive',
   'Active Prevention',
   'STANDARD', 'PROCEDURAL',
   9999.00, NULL, 6),

  ('00000002-0000-0000-0000-000000000003',
   'Executive',
   'Deep Health Insight',
   'STANDARD', 'PROCEDURAL',
   14999.00, NULL, 7);

-- ── Travel (PROCEDURAL) ──────────────────────────────────

INSERT INTO service_catalog (id, name, description, category, service_type, price_inr, duration_minutes, sort_order)
VALUES
  ('00000003-0000-0000-0000-000000000001',
   'Fit2Fly Lite',
   'Parent Travelers',
   'TRAVEL', 'PROCEDURAL',
   12999.00, NULL, 8),

  ('00000003-0000-0000-0000-000000000002',
   'Fit2Fly 360',
   'Senior Travelers',
   'TRAVEL', 'PROCEDURAL',
   18999.00, NULL, 9);

-- ─────────────────────────────────────────────────────────
-- Key Features (normalised rows)
-- ─────────────────────────────────────────────────────────

-- E-Prescription
INSERT INTO service_catalog_features (service_id, feature, feature_order) VALUES
  ('00000001-0000-0000-0000-000000000001', 'Valid Digital Signature', 0),
  ('00000001-0000-0000-0000-000000000001', 'Doctor Review',           1),
  ('00000001-0000-0000-0000-000000000001', 'Pharmacy Ready',          2);

-- Virtual Consult
INSERT INTO service_catalog_features (service_id, feature, feature_order) VALUES
  ('00000001-0000-0000-0000-000000000002', 'Secure Link',             0),
  ('00000001-0000-0000-0000-000000000002', 'Digital EMR Integration', 1);

-- Lab Test
INSERT INTO service_catalog_features (service_id, feature, feature_order) VALUES
  ('00000001-0000-0000-0000-000000000003', 'Home Collection',         0),
  ('00000001-0000-0000-0000-000000000003', 'Digital Report',          1);

-- Sahayak Assist
INSERT INTO service_catalog_features (service_id, feature, feature_order) VALUES
  ('00000001-0000-0000-0000-000000000004', '1-hr Home Visit',  0),
  ('00000001-0000-0000-0000-000000000004', 'Vitals Check',     1),
  ('00000001-0000-0000-0000-000000000004', 'Medication Audit', 2);

-- Basic
INSERT INTO service_catalog_features (service_id, feature, feature_order) VALUES
  ('00000002-0000-0000-0000-000000000001', 'Vitals',           0),
  ('00000002-0000-0000-0000-000000000001', 'CBC',              1),
  ('00000002-0000-0000-0000-000000000001', 'Sugar & Lipid',    2),
  ('00000002-0000-0000-0000-000000000001', '1 MD Consult',     3);

-- Comprehensive
INSERT INTO service_catalog_features (service_id, feature, feature_order) VALUES
  ('00000002-0000-0000-0000-000000000002', 'Basic Package',    0),
  ('00000002-0000-0000-0000-000000000002', 'LFT / KFT',        1),
  ('00000002-0000-0000-0000-000000000002', '1 Sahayak Visit',  2);

-- Executive
INSERT INTO service_catalog_features (service_id, feature, feature_order) VALUES
  ('00000002-0000-0000-0000-000000000003', 'Comprehensive Package', 0),
  ('00000002-0000-0000-0000-000000000003', 'Cardiac Screening',     1),
  ('00000002-0000-0000-0000-000000000003', '2 MD Consults',         2);

-- Fit2Fly Lite
INSERT INTO service_catalog_features (service_id, feature, feature_order) VALUES
  ('00000003-0000-0000-0000-000000000001', 'Vitals',                  0),
  ('00000003-0000-0000-0000-000000000001', 'EKG',                     1),
  ('00000003-0000-0000-0000-000000000001', 'Lung Screen',             2),
  ('00000003-0000-0000-0000-000000000001', 'Mental Health Screen',    3);

-- Fit2Fly 360
INSERT INTO service_catalog_features (service_id, feature, feature_order) VALUES
  ('00000003-0000-0000-0000-000000000002', 'Fit2Fly Lite Package', 0),
  ('00000003-0000-0000-0000-000000000002', 'Colonoscopy',          1),
  ('00000003-0000-0000-0000-000000000002', 'DEXA Scan',            2),
  ('00000003-0000-0000-0000-000000000002', 'Gender Screening',     3);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_category   ON service_catalog (category);
CREATE INDEX IF NOT EXISTS idx_service_sort_order ON service_catalog (sort_order);
