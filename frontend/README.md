# Assessly — Frontend Client Application

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB.svg)](https://react.dev/)
[![TanStack Router](https://img.shields.io/badge/Router-TanStack%20Router-FF4154.svg)](https://tanstack.com/router)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.2-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%208-646CFF.svg)](https://vitejs.dev/)

The modern, responsive web application client for **Assessly** — a higher education exit examination, practice testing, and academic assessment platform. Built with React 19, TanStack Start/Router, Tailwind CSS v4, Lucide Icons, and Recharts.

---

## 🚀 Key Features & Modules

### 🎓 1. Student Portal
* **Landing Page & Curriculum Showcase**:
  * Animated hero section with interactive callouts.
  * Curriculum & department overview with smooth scroll-reveal effects.
  * Direct access to registration, login, and sample practice questions.
* **Timed Exit Examination Engine (`/exams`, `/exam`)**:
  * Real-time countdown timer with server-side synchronization and grace periods.
  * Auto-recovery via `localStorage` (protects against browser refreshes and accidental tab closures).
  * Dynamic question palette with answered/unanswered indicators and direct question jumping.
  * Post-exam instant scoring, performance badges, and review answer key breakdown (subject to feedback policy).
* **Practice Question Arena (`/practice`)**:
  * Filter questions by academic department, topic, and difficulty (Easy, Medium, Hard).
  * Instant feedback with comprehensive question explanations.
  * Automatic tracking of the 5-question free trial quota before unlocking full access.
* **Learning Resources Library (`/resources`)**:
  * Access study guides, reference books, past papers, and lecture slides.
  * Filter by department and access tier (Free, Trial, Paid).
  * In-browser preview and authenticated file downloads.
* **Monetization & Payment Verification (`/payments`)**:
  * Tiered package selection (Department Semester Pass, All-Access Annual Pass).
  * Dynamic payment channels (Telebirr and Commercial Bank of Ethiopia - CBE).
  * 1-click clipboard account/phone copying with toast feedback.
  * Receipt image (JPG, PNG) and PDF upload form with real-time status tracking (Pending, Approved, Rejected).
* **Candidate Profile & Security (`/profile`)**:
  * Personal information and active department enrollments.
  * Secure authenticated **Change Password** interface with password confirmation and live validation.

---

### 🛡️ 2. Authentication & Credential Management
* **Registration & Sign In (`/register`, `/login`)**:
  * Clean, accessible card layouts with custom vector illustrations.
  * Multi-department selection during candidate enrollment.
  * Role-based post-login redirection (Admins → `/admin`, Candidates → `/dashboard`).
* **Self-Service Password Recovery (`/forgot-password`, `/reset-password`)**:
  * Branded email dispatch via Gmail SMTP (`nodemailer`).
  * Cryptographically secure 1-hour expiration reset tokens.
  * One-click password reset interface with show/hide password toggles and validation.

---

### 🛠️ 3. Administrator Console (`/admin`, `/admin/$section`)
* **Interactive Telemetry Dashboard (`/admin`)**:
  * Real-time KPI summaries: Total Candidates, Pending Verifications, Total ETB Revenue, Question Counts.
  * **Department Exit Exam Readiness & Benchmark Chart**: Visualizes average score vs. 50% pass benchmark without confusing hover pillars.
  * **Platform Activity Trend**: 7-day visual area chart comparing exam starts and completions.
  * **Payment Breakdown**: Donut chart of Approved, Pending, and Rejected payments.
* **Question Bank Management (`/admin/questions`)**:
  * Create, edit, and publish single-choice MCQs with explanation keys and mark weightings.
  * **Bulk Import Modal**: Upload CSV or JSON files with sample template download.
* **Curriculum & Department Management (`/admin/departments`)**:
  * Create and archive academic faculties and departments.
  * Live metrics: enrolled student count, question pool, and exam inventory.
* **Examination Management (`/admin/exams`)**:
  * Configure exam duration, attempt policies, and feedback release rules.
  * View true department question bank pool and linked questions.
  * "Select All" toggle in the exam creator for 1-click question linking.
* **Payment Review Queue (`/admin/payments`)**:
  * Pending payments verification queue.
  * Receipt preview link generation.
  * One-click Approve (activates entitlement immediately) or Reject (with required reason).
* **Learning Materials Upload (`/admin/resources`)**:
  * Upload PDF, DOCX, PPTX files up to 50 MB with access tier controls (Free, Trial, Paid).
* **Candidate Governance (`/admin/students`)**:
  * Filter candidates by role and account status.
  * Suspend, activate, or promote candidate roles.
* **Platform Configurations (`/admin/settings`)**:
  * Update Telebirr phone number, CBE bank account, and transfer instructions (auto-propagates dynamically).
  * Configure free trial quota and exam pass marks.
  * Update administrator account password securely.

---

## 📂 Project Architecture

```
frontend/
├── src/
│   ├── components/            # Reusable UI & Shell Components
│   │   ├── ui/                # Radix UI primitives (dialog, button, select, tabs, etc.)
│   │   ├── AdminAnalyticsChart.tsx   # Recharts charts for Admin overview
│   │   ├── StudentAnalyticsChart.tsx # Recharts charts for Candidate dashboard
│   │   ├── AdminShell.tsx     # Admin responsive sidebar and top navigation
│   │   ├── StudentShell.tsx   # Student navbar, progress indicators, and shell
│   │   ├── AuthCard.tsx       # Standard card wrapper for authentication flows
│   │   ├── EducationVectors.tsx # Custom SVG vectors & educational artwork
│   │   ├── ScrollReveal.tsx   # Viewport scroll animation wrappers
│   │   └── ui-kit.tsx         # Unified design tokens (badges, tables, buttons, inputs)
│   ├── lib/                   # Utilities, Contexts, & Centralized API
│   │   ├── api.ts             # Centralized Typed API client (Auth, Payments, Exams, Admin)
│   │   ├── auth-context.tsx   # Global authentication state, user session, and token handling
│   │   └── utils.ts           # CSS class merging (clsx + tailwind-merge)
│   ├── routes/                # TanStack File-Based Route Tree
│   │   ├── __root.tsx         # Root layout with Toaster and QueryProvider
│   │   ├── index.tsx          # Public Landing & Discovery Page
│   │   ├── login.tsx          # Candidate & Admin Log In
│   │   ├── register.tsx       # Student Registration
│   │   ├── forgot-password.tsx# Self-service Password Reset Request
│   │   ├── reset-password.tsx # Secure Set New Password Screen
│   │   ├── dashboard.tsx      # Student Home Dashboard & KPI Overview
│   │   ├── exams.tsx          # Available & Enrolled Timed Examinations
│   │   ├── exam.tsx           # Active Examination Interface (Full Timer & Local Recovery)
│   │   ├── practice.tsx       # Self-paced MCQ Practice Arena
│   │   ├── resources.tsx      # Learning Resources & Download Library
│   │   ├── payments.tsx       # Telebirr & CBE Payment Submission
│   │   ├── profile.tsx        # Candidate Profile & Change Password
│   │   ├── admin.index.tsx    # Admin Dashboard & Analytics
│   │   └── admin.$section.tsx # Dynamic Admin Management Sections
│   ├── routeTree.gen.ts       # Auto-generated TanStack router tree
│   └── main.tsx               # Client bootstrap entrypoint
├── public/                    # Static assets & favicon
├── package.json               # Dependencies & build scripts
├── vite.config.ts             # Vite configuration with TanStack Start integration
└── tailwind.config.js         # Tailwind styling tokens & theme
```

---

## ⚙️ Development & Setup

### 1. Prerequisites
- **Node.js**: v20 or higher (v22/v24 recommended)
- **Backend API**: The Assessly backend server running on `http://localhost:3000`

### 2. Installation
From the repository root or `frontend` directory:

```bash
cd frontend
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `frontend` root (optional for defaults):

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 4. Running the Development Server
```bash
npm run dev
```
The application will launch on **`http://localhost:8080/`**.

---

## 🧪 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts Vite dev server with hot module replacement (HMR) on port `8080` |
| `npm run build` | Compiles TypeScript and creates optimized production assets |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint across all TypeScript and React files |
| `npm test` | Runs frontend unit and component tests with Vitest |

---

## 🎨 Design System & UI Principles
* **Color Palette**: Emerald & Forest Brand Greens (`#10b981`, `#059669`), Slate Neutrals (`#f8fafc` to `#0f172a`), Amber Accents (`#f59e0b`).
* **Typography**: Clean, readable sans-serif system stack with mono font for references and account details.
* **Responsiveness**: Fluid layout designed from mobile screens up to 4K displays.
* **Accessibility**: Screen-reader friendly buttons, high-contrast labels, and clear error alerts.
