# Assessly — Online Exam Management & Assessment Platform

[![CI Pipeline](https://github.com/bonssss/assessly/actions/workflows/ci.yml/badge.svg)](https://github.com/bonssss/assessly/actions/workflows/ci.yml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E.svg)](https://supabase.com/)

**Assessly** is an online examination, question bank management, and self-assessment platform built according to the **Software Requirements Specification (SRS v1.0)**. It supports automated single-choice MCQ scoring, server-side timed exam enforcement, free trial quotas, manual offline payment verification (Telebirr & CBE), learning resource paywalls, and comprehensive administrative audit logging.

---

## 📁 Repository Structure

```
assessly/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI/CD pipeline
├── backend/                     # Express 5 + TypeScript + Prisma Backend API
│   ├── prisma/
│   │   ├── schema.prisma        # Complete relational schema (16 models/enums)
│   │   └── seed.ts              # Seeding departments, payment methods, packages, admin
│   ├── scripts/
│   │   └── create-admin.ts      # CLI script for creating custom Admin accounts
│   ├── src/
│   │   ├── app.ts               # Express application with Helmet & CORS
│   │   ├── server.ts            # HTTP server entrypoint
│   │   ├── common/              # Middlewares, storage adapters, utils, errors
│   │   └── modules/             # Auth, Depts, Questions, Exams, Payments, Resources, Admin
│   ├── tests/
│   │   └── unit/                # 14 test suites (48/48 unit tests passing)
│   └── uploads/                 # Local disk storage for receipts and study materials
├── frontend/                    # Next.js 16 Web Application UI
├── docs/                        # Comprehensive documentation
│   ├── TECHNICAL_DOCUMENTATION.md # Architecture, database schema, security & data flows
│   └── API_TESTING_GUIDE.md       # End-to-end lifecycle testing & cURL/Postman guide
└── postman/                     # Postman Collection & Environment
    ├── Assessly_API.postman_collection.json # Complete API collection (9 folders)
    ├── Assessly_Local.postman_environment.json # Local environment config
    └── README.md                # Postman quick-start guide
```

---

## ⚡ Quick Start (Backend)

### 1. Prerequisites
- **Node.js**: v20 or higher (v24 recommended)
- **Supabase Cloud Account** or local PostgreSQL instance

### 2. Environment Configuration
Navigate to `backend/` and copy `.env.example` to `.env`:
```bash
cd backend
cp .env.example .env
```
Ensure your `DATABASE_URL` is configured for your Supabase pooler:
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
JWT_SECRET=super_secret_jwt_key_change_in_production
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=30&pool_timeout=30"
FREE_TRIAL_QUOTA=5
STORAGE_DRIVER=local
```

### 3. Database Migration & Seeding
Push the Prisma schema to Supabase and seed initial departments and packages:
```bash
npx prisma db push
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
The API is now running at `http://localhost:3000/api/v1`!

---

## 🛡️ Default Super Admin Account

Running `npm run db:seed` or `npm run admin:create` provisions the default administrator:
- **Email**: `admin@assessly.com`
- **Password**: `AdminPassword@123`
- **Role**: `SUPER_ADMIN`

To create additional administrators via CLI:
```bash
npm run admin:create custom.admin@assessly.com MyPass@123 "Custom Admin" ADMIN
```

---

## 🧪 Testing & Verification

Run the automated test suite (14 suites, 48 tests):
```bash
npm test
```

Verify TypeScript compilation:
```bash
npm run build
```

---

## 📖 In-Depth Documentation

- 📘 **[Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)**: Layered architecture, data flows, security controls, and entity relationships.
- 🧪 **[End-to-End API Testing Guide](docs/API_TESTING_GUIDE.md)**: Complete 10-step lifecycle testing flow from admin creation to exam submission.
- 📮 **[Postman Collection Guide](postman/README.md)**: Importing the collection and utilizing environment variables.
