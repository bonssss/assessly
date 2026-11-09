# Assessly — Vercel Deployment Guide

This guide walks you through deploying **Assessly** to Vercel.

Assessly consists of two components:
1. **Frontend**: TanStack Start / Vite / Nitro / Tailwind CSS v4.
2. **Backend**: Express + TypeScript + Prisma + Supabase PostgreSQL.

---

## Architecture Choices on Vercel

You have two recommended options:

### **Option 1: Frontend on Vercel + Backend on Vercel (All-Vercel)**
Both the client and the Express API run on Vercel.
- **Frontend**: Runs on Vercel Edge/SSR via Nitro Build Output API v3.
- **Backend**: Runs on Vercel Serverless Functions (`/api/index.ts` handler).
- **Storage Requirement**: Because Vercel Serverless has an ephemeral filesystem (local `/uploads` is wiped on container recycle), set `STORAGE_DRIVER=s3` using Cloudflare R2, Supabase Storage, or AWS S3.

---

### **Option 2: Frontend on Vercel + Backend on Container/VPS (Recommended for Heavy Workloads)**
- **Frontend on Vercel**: Blazing-fast edge caching, global CDN, instant rollbacks.
- **Backend on Railway / Render / VPS**: Runs standard Docker container (`docker-compose.yml`), supports local disk uploads (`STORAGE_DRIVER=local`), and keeps the 60s background auto-timeout exam worker running 24/7 without cold starts.

---

## Part 1: Deploying the Frontend to Vercel

### Step 1: Import Repository to Vercel
1. Go to [vercel.com](https://vercel.com) and log into your account.
2. Click **Add New...** > **Project**.
3. Select your GitHub repository: `bonssss/assessly`.

### Step 2: Configure Project Settings
In the **Configure Project** screen:
- **Project Name**: `assessly` (or `assessly-frontend`)
- **Framework Preset**: Select **Vite** or **Other**.
- **Root Directory**: Click **Edit** and select **`frontend`**.
- **Build and Output Settings**:
  - **Build Command**: `npm run build` *(auto-detects Vercel and outputs to `.vercel/output`)*
  - **Output Directory**: Leave empty or `.vercel/output`

### Step 3: Set Environment Variables
Add the following under **Environment Variables**:
| Variable | Value | Description |
|---|---|---|
| `VITE_API_URL` | `https://your-backend-domain.com/api/v1` | URL of your deployed Express API |
| `NODE_VERSION` | `22` | Node.js 22 runtime |

Click **Deploy**. Vercel will build and launch your frontend at `https://assessly.vercel.app`!

---

## Part 2: Deploying the Backend to Vercel (Serverless Function)

The repository includes pre-configured `backend/vercel.json` and `backend/api/index.ts` for zero-config Vercel Serverless deployment.

### Step 1: Import Backend as a New Vercel Project
1. In Vercel, click **Add New...** > **Project**.
2. Select the same GitHub repository: `bonssss/assessly`.

### Step 2: Configure Backend Project Settings
- **Project Name**: `assessly-api`
- **Framework Preset**: Select **Other**.
- **Root Directory**: Click **Edit** and select **`backend`**.
- **Build Command**: `npm run vercel-build` *(or leave blank; automatically runs `npx prisma generate && npx tsc`)*

### Step 3: Add Backend Environment Variables
Under **Environment Variables**, add:
| Variable | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | Fallback port |
| `DATABASE_URL` | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` | Supabase Transaction Pooler connection string |
| `DIRECT_URL` | `postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres` | Supabase direct connection string |
| `JWT_SECRET` | *Your 256-bit secret string* | Run `openssl rand -base64 32` to generate |
| `CORS_ORIGIN` | `https://assessly.vercel.app` | Your Vercel frontend URL |
| `STORAGE_DRIVER` | `s3` *(or `local` if persistent disk)* | Cloud storage for receipts & resources |
| `AWS_S3_BUCKET` | `your-bucket-name` | S3 / Cloudflare R2 bucket name |
| `AWS_S3_REGION` | `auto` (or `us-east-1`) | Cloud storage region |
| `AWS_S3_ACCESS_KEY_ID` | `...` | S3 Access Key |
| `AWS_S3_SECRET_ACCESS_KEY` | `...` | S3 Secret Key |
| `AWS_S3_ENDPOINT` | `https://<id>.r2.cloudflarestorage.com` | R2/S3 endpoint URL |
| `SMTP_HOST` | `smtp.gmail.com` | Gmail SMTP host |
| `SMTP_PORT` | `465` | SSL Port |
| `SMTP_USER` | `your-email@gmail.com` | Gmail address |
| `SMTP_PASS` | `your-app-password` | Gmail 16-character App Password |
| `SMTP_FROM` | `"Assessly Support" <your-email@gmail.com>` | Sender name |

Click **Deploy**. Your API will be live at `https://assessly-api.vercel.app/api/v1`!

---

## Part 3: Connecting Frontend and Backend

Once both are deployed:
1. Update `VITE_API_URL` in the frontend Vercel project to `https://assessly-api.vercel.app/api/v1`.
2. Update `CORS_ORIGIN` in the backend Vercel project to `https://assessly.vercel.app`.
3. In both projects, trigger a **Redeploy** (Deployments > ... > Redeploy) to apply the updated environment variables.

---

## Part 4: Verification

Test your live deployment:
1. **Health Check**: Visit `https://assessly-api.vercel.app/api/v1/health` — should return `200 OK` with database connection verified.
2. **Frontend UI**: Visit `https://assessly.vercel.app` — check that the landing page renders with animations and curriculum exploration.
3. **Practice Arena**: Log in as a student and test the **Practice Arena (5 dynamic questions)**.
4. **Admin Console**: Log in as admin and verify dashboards and question bank.

