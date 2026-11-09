# SMART TECHNICAL SUPPORT UNIVERSITY (STSU)
### Intelligent Enterprise University Technical Support & IT Management Platform

A modern, production-grade university technical support system featuring role-based dashboards for **Administrators**, **Faculty Members**, and **Students/Users**.

---

## 🌟 Key Features

1. **Role-Based Portals & Dashboards**:
   - **Admin Portal**: Enterprise-grade management of users, faculty verification, ticket routing, department workloads, SLA analytics, audit logs, and PDF/Excel export.
   - **Faculty Portal**: Assigned ticket triage, internal technical notes, resolution submission, SLA tracking, and technical knowledge base authoring.
   - **Student / User Portal**: Clean issue submission, live timeline tracking, real-time messaging with assigned faculty, PDF ticket export, and satisfaction rating.

2. **Secure Authentication & OTP Verification**:
   - Separate Student and Faculty registration flows.
   - **No public Admin registration** (Admin accounts are created strictly via backend bootstrap `python3 scripts/create_admin.py`).
   - Real 6-digit cryptographic Email OTP verification with 5-minute expiry and attempt limiting.
   - Automatic Welcome Ticket generation (`STSU-2026-XXXXXX`) upon account activation.
   - Personalized HTML welcome email with onboarding ticket details.

3. **Advanced AI Technical Support Assistant**:
   - Powered by Google Gemini (`@google/genai`).
   - Natural language troubleshooting for campus Wi-Fi, LMS, smart classrooms, VPN, and lab equipment.
   - Automatic category and priority recommendations based on problem description.

4. **University IT Resource Modules**:
   - IT Asset Management (hardware specs, licenses, allocation).
   - Smart Classroom & Projector troubleshooting.
   - Laboratory equipment fault reporting.
   - Campus Network status and maintenance announcements.
   - Knowledge Base with searchable technical guides.

5. **Real-Time Notification & Live Tracking**:
   - Live toast notification system with sound and history.
   - Server-Sent Events / WebSockets for live status changes.

---

## 🚀 Quick Start Guide

### 1. Run Development Server
```bash
npm install
npm run dev
```
Dev server runs on `http://localhost:3000`.

### 2. Administrator Account Initialization
Run the secure admin bootstrap script:
```bash
python3 scripts/create_admin.py
```
Default bootstrap credentials:
- **Email**: `admin@stsu.edu`
- **Password**: `AdminSecure2026!`

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti, JetBrains Mono & Plus Jakarta Sans typography.
- **Backend**: Express + Vite full-stack dev server & Python FastAPI specification in `backend/`.
- **Database**: MongoDB Atlas compatible schemas with indexed collections.
- **AI Engine**: Google Gemini API via `@google/genai`.
- **Export Engine**: Client & Server PDF summary generation, Excel reporting.
