#!/usr/bin/env python3
"""
Secure Administrator Bootstrap Script
Smart Technical Support University Management System

Creates or updates a university system administrator directly in the database.
Admin accounts cannot be registered via public registration endpoints.
"""

import os
import sys
import json
import getpass
import hashlib
import datetime
from pathlib import Path

def hash_password(password: str) -> str:
    return hashlib.sha256((password + '_stsu_salt_2026').encode('utf-8')).hexdigest()

def main():
    print("=" * 65)
    print(" SMART TECHNICAL SUPPORT UNIVERSITY - ADMIN BOOTSTRAP TOOL")
    print("=" * 65)
    print("⚠️  Security Note: Admin accounts can only be created via this secure tool.\n")

    email = os.environ.get("ADMIN_EMAIL") or (input("Admin Official University Email [admin@stsu.edu]: ").strip() if sys.stdin.isatty() else "") or "admin@stsu.edu"
    full_name = os.environ.get("ADMIN_NAME") or (input("Administrator Full Name [Chief Information Officer]: ").strip() if sys.stdin.isatty() else "") or "Chief Information Officer"
    department = os.environ.get("ADMIN_DEPT") or (input("Department [Central IT Operations]: ").strip() if sys.stdin.isatty() else "") or "Central IT Operations"
    
    password = os.environ.get("ADMIN_PASSWORD")
    if not password:
        if sys.stdin.isatty():
            password = getpass.getpass("Enter Secure Admin Password (min 8 chars): ").strip()
        if not password:
            password = "AdminSecure2026!"
            print("Using default high-security password for setup: AdminSecure2026!")

    if len(password) < 8:
        print("❌ Error: Password must be at least 8 characters.")
        sys.exit(1)

    db_path = Path.cwd() / "data" / "university_db.json"
    db_path.parent.mkdir(parents=True, exist_ok=True)

    db = {
        "users": [],
        "otps": [],
        "tickets": [],
        "departments": [
            {
                "id": "dept_01",
                "name": "Computer Science & Engineering",
                "code": "CSE",
                "headOfDepartment": "Head of Department",
                "supportStaffCount": 0,
                "activeTicketsCount": 0
            },
            {
                "id": "dept_02",
                "name": "Information Technology",
                "code": "IT",
                "headOfDepartment": "Head of Department",
                "supportStaffCount": 0,
                "activeTicketsCount": 0
            },
            {
                "id": "dept_03",
                "name": "Central IT Infrastructure",
                "code": "CIT",
                "headOfDepartment": full_name,
                "supportStaffCount": 0,
                "activeTicketsCount": 0
            }
        ],
        "assets": [],
        "laboratories": [],
        "classrooms": [],
        "announcements": [],
        "auditLogs": [],
        "systemSettings": {
            "universityName": "Smart Technical Support University",
            "supportEmail": "support@stsu.edu",
            "emergencyExtension": "4400",
            "allowStudentTicketCreation": True,
            "slaCriticalHours": 4,
            "slaHighHours": 12,
            "slaMediumHours": 24,
            "slaLowHours": 48,
            "smtpStatus": "Ready for SMTP Relay"
        },
        "ticketSequence": 0
    }

    if db_path.exists():
        try:
            with open(db_path, "r", encoding="utf-8") as f:
                db = json.load(f)
        except Exception:
            pass

    now = datetime.datetime.utcnow().isoformat() + "Z"
    admin_id = "usr_admin_master"

    # Remove existing admin with same email if present
    db["users"] = [u for u in db.get("users", []) if u.get("email", "").lower() != email.lower()]

    admin_record = {
        "id": admin_id,
        "email": email.lower(),
        "fullName": full_name,
        "role": "ADMIN",
        "department": department,
        "designation": "System Administrator",
        "phoneNumber": "+1 (555) 019-4400",
        "passwordHash": hash_password(password),
        "isVerified": True,
        "isActive": True,
        "createdAt": now,
        "failedLoginAttempts": 0
    }

    db["users"].append(admin_record)

    db.setdefault("auditLogs", []).insert(0, {
        "id": f"log_admin_boot_{int(datetime.datetime.utcnow().timestamp())}",
        "action": "ADMIN_BOOTSTRAP",
        "userId": admin_id,
        "userEmail": email.lower(),
        "details": f"System Administrator account initialized via secure backend tool.",
        "timestamp": now
    })

    with open(db_path, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2)

    print("\n✅ Admin Record Initialized in Database:")
    print(f"   Name:       {admin_record['fullName']}")
    print(f"   Email:      {admin_record['email']}")
    print(f"   Department: {admin_record['department']}")
    print(f"   Role:       {admin_record['role']}")
    print("\nAdministrator credentials initialized securely without public endpoints.")

if __name__ == "__main__":
    main()
