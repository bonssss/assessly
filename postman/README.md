
# Assessly Postman Collection & Environment (v2.0)

This folder contains the complete, production-grade Postman API collection and environment files for the Assessly Higher Education Examination & Assessment Platform.

---

## 📁 Files

1. **`Assessly_API.postman_collection.json`**: Complete endpoint collection (51 requests organized into 9 modules).
2. **`Assessly_Local.postman_environment.json`**: Environment configuration with automated token, ID, and URL variables (`baseUrl: http://localhost:3000`).

---

## 🚀 How to Import into Postman

1. Open **Postman**.
2. Click **Import** (top left).
3. Drag and drop both JSON files from this directory (`postman/`).
4. Select **`Assessly Local Environment`** in the environment dropdown in the top right.
5. Verify `baseUrl` is set to `http://localhost:3000` (or `http://localhost:3000` when running Docker Compose).

---

## ⚡ Automated Token & ID Handling

The collection features built-in test scripts that automatically capture and propagate identifiers across calls:

* **Student Authentication**: Running `Auth & Profile -> Login Student` or `Register Student` automatically sets `{{authToken}}`.
* **Administrator Authentication**: Running `Auth & Profile -> Login Super Admin` automatically sets `{{adminToken}}`.
* **Dynamic ID Capture**:
  * `Departments -> List Active Departments` captures `{{departmentId}}`.
  * `Questions -> List Questions` or `Create Question` captures `{{questionId}}`.
  * `Timed Exams -> List Available Exams` captures `{{examId}}`.
  * `Timed Exams -> Start Timed Exam Attempt` captures `{{attemptId}}`.
  * `Payments -> Get Purchasable Packages` captures `{{packageId}}`.
  * `Payments -> Submit Payment Receipt` captures `{{paymentId}}`.
  * `Learning Resources -> List Learning Resources` captures `{{resourceId}}`.
  * `Admin & Analytics -> List Users` captures `{{userId}}`.

---

## 📦 Modules & Endpoints (51 Requests)

| Module | Endpoints Count | Key Capabilities |
| :--- | :---: | :--- |
| **1. Health & System** | 2 | Root info and `/api/v1/health` status checks. |
| **2. Auth & Profile** | 8 | Registration, login (student & admin), profile management, **forgot password**, **reset password** (SHA-256 tokens), and **change password**. |
| **3. Departments** | 2 | Public active department directory (`CS-101`, `BUS-101`, `ENG-101`, `LAW-101`, `MED-101`) and admin department creation. |
| **4. Questions & Practice** | 6 | Question bank listing (with answer sanitization for students), single & bulk creation, updates, deletes, and single-choice practice submission with quota decrement. |
| **5. Timed Exams** | 8 | Exam authoring, updates, deletes, server-side deadline countdown enforcement (`start`), answer submission grading, detailed attempt reviews, and student history. |
| **6. Entitlements & Quota** | 1 | Real-time free trial quota remaining (5 questions) and active departmental / platform-wide subscription validity. |
| **7. Payments & Verification** | 10 | Dynamic Telebirr & CBE instructions, purchasable packages, receipt upload (`multipart/form-data`), signed preview links, review queue, admin approval & rejection, and package creation. |
| **8. Learning Resources** | 6 | Resource directory, paywall enforcement (`FREE`, `TRIAL`, `PAID`), authenticated file streaming/download, and admin PDF/syllabus upload and deletion. |
| **9. Admin & Analytics** | 8 | System KPI overview (revenue, users, exam attempts), department pass rates and average scores, security audit trail (`AuditLog`), user role/status management, and global platform settings. |

---

## 🧪 Testing Credentials

Default pre-seeded accounts:
- **Super Admin**: `admin@assessly.com` / `AdminPassword@123`
- **Student**: Register via `POST /api/v1/auth/register` or use existing account
