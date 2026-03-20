# Preventia

A telemedicine platform enabling NRI sponsors to book video consultations with doctors for recipients in India. Doctors can create and securely share prescriptions during or after calls.

## Architecture Overview

```
Frontends                  Backend & Logic              Infrastructure & Storage
─────────────              ───────────────              ────────────────────────
Next.js Doctor Dashboard → Spring Boot API (AWS App     Amazon RDS (PostgreSQL)
React Native Mobile Apps    Runner, ap-south-1 Mumbai)  Amazon S3 (prescriptions/)
                           ├─ AppointmentService         Amazon CloudWatch
                           ├─ PrescriptionService        AWS IAM / Security Groups
                           ├─ DailyWebhookController
                           └─ Flyway Migrations          External: Daily.co Video API
```

## Modules

| Module | Path | Tech |
|---|---|---|
| Backend API | `backend/` | Spring Boot 3, Java 21, PostgreSQL |
| Doctor Dashboard | `frontend/web/` | Next.js 14, TypeScript, TailwindCSS |
| Sponsor/Recipient App | `frontend/mobile/` | React Native (Expo), TypeScript |
| Infrastructure | `infrastructure/` | AWS CDK (TypeScript) |

## Key Workflows

### Workflow 1 — Appointment Booking & Video Provisioning
1. Sponsor POSTs `/api/appointments` (with JWT)
2. Backend creates appointment record (`status=REQUESTED`)
3. Backend calls Daily.co to provision a private video room
4. `daily_room_url` stored; `appointment_id` + `recipient_token` returned to Sponsor

### Workflow 2 — In-Call Prescription Creation & Viewing
1. Doctor POSTs `/api/prescriptions` (prescription data)
2. Backend uploads `prescription.pdf` to S3 (`prescriptions/` prefix)
3. S3 key recorded in `prescription_indices` table
4. Sponsor GETs `/api/prescriptions/{id}/view` → backend returns 15-min pre-signed S3 URL

## Getting Started

### Prerequisites
- Java 21+
- Node.js 20+
- Docker & Docker Compose
- AWS CLI (configured)
- Daily.co API key

### Local Development

```bash
# Start PostgreSQL and LocalStack (S3 emulation)
docker-compose up -d

# Backend
cd backend
./mvnw spring-boot:run

# Doctor dashboard
cd frontend/web
npm install && npm run dev

# Mobile app
cd frontend/mobile
npm install && npx expo start
```

### Environment Variables

Copy `.env.example` to `.env` and fill in values. See each module's README for module-specific variables.

## Deployment

The backend is deployed to **AWS App Runner** in `ap-south-1` (Mumbai) for data residency compliance. See `infrastructure/` for CDK stacks.

Database migrations are managed by **Flyway** and run automatically on startup.
