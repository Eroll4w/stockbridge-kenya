# StockBridge Kenya

# StockBridge Kenya

**StockBridge Kenya** is a facility-level essential medicine inventory tracking and public availability lookup platform built to reduce medicine stockouts at local clinics and pharmacies across Kenya.

---

## The Problem

Even when national medical suppliers fulfill over 90% of facility orders, medicine availability at the patient level can drop as low as 51% in local clinics. Because roughly 75% of facilities still rely on manual stock tracking, shortages go unnoticed until shelves are empty—forcing patients to spend time and transport fare traveling from clinic to clinic in search of essential medication.

---

## Core User Roles

- **Pharmacists:** Log incoming and dispensed stock (stock-in / stock-out) and receive automated low-stock alerts before shelves run dry.
- **Facility Administrators:** Monitor stock levels across facilities and coordinate timely restocking when alerts trigger.
- **Patients:** Search for medicines by name, view nearby facilities reporting availability, and check **last-updated timestamps** before visiting.

---

## MVP 1.0 Scope

### Included Features

1. **Authentication:** Secure login for pharmacists and facility administrators.
2. **Medicine Catalog:** Standardized medicine records (name, strength, and unit of measure).
3. **Stock Logging:** Real-time stock-in and stock-out transaction tracking.
4. **Low-Stock Alerts:** Automated threshold notifications when inventory drops below safe levels.
5. **Public Medicine Search:** Patient-facing availability lookup with facility details and last-updated timestamps.
6. **Reports Dashboard:** Summary view of current stock levels, recent movements, and active alerts.

### Out of Scope (Version 1)

- Online payments or billing
- Medicine delivery logistics
- E-prescriptions or AI diagnosis
- Patient medical records or personal health data

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript / React
- **Backend:** Node.js + Express
- **Database:** PostgreSQL

---

## Getting Started (Team Setup)

### 1. Clone the Repository

```bash
git clone [https://github.com/Eroll4w/StockBridge-Kenya.git](https://github.com/Eroll4w/StockBridge-Kenya.git)
cd StockBridge-Kenya
```

### 2. Create Your Working Branch

Create a separate branch for your assigned task before editing files so teammates do not overwrite each other's work on `main`:

```bash
git checkout -b your-feature-name
```

_(Example branch names: `frontend-ui`, `backend-api`, `database-schema`, `auth`)_

### 3. Install Dependencies & Run Locally

```bash
npm install
npm run dev
```

---

## Team Roles

- **Research & Documentation:** Clinic workflow validation, user flows, and pitch documentation.
- **Frontend & UI/UX:** Pharmacist inventory screen, admin alert dashboard, and public medicine search page.
- **Backend & Database:** PostgreSQL schema, authentication, and REST API endpoints.
- **QA & Security:** Endpoint testing, input validation, and end-to-end demo verification.
