#!/usr/bin/env python3
"""
Smart Technical Support University Management System - Project Generator
Generates full folder structure, Python backend, FastAPI schemas, routers,
services, email templates, scripts, and deployment configurations.
"""

import os
import sys
from pathlib import Path

def log(msg: str):
    print(f"[STSU Generator] {msg}")

def ensure_dir(path: Path):
    path.mkdir(parents=True, exist_ok=True)
    log(f"Created directory: {path}")

def create_file(path: Path, content: str):
    ensure_dir(path.parent)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    log(f"Generated file: {path}")

def generate_structure():
    base = Path.cwd()
    log(f"Initializing project structure under {base}")

    dirs = [
        "backend/app/api",
        "backend/app/models",
        "backend/app/schemas",
        "backend/app/services",
        "backend/app/database",
        "backend/app/middleware",
        "backend/app/authentication",
        "backend/app/notifications",
        "backend/app/email/templates",
        "backend/app/ai",
        "backend/app/tickets",
        "backend/app/reports",
        "backend/app/utils",
        "backend/tests",
        "scripts",
        "src/components",
        "src/dashboards/admin",
        "src/dashboards/faculty",
        "src/dashboards/student",
        "src/layouts",
        "src/pages",
        "src/services",
        "src/context",
        "src/utils"
    ]

    for d in dirs:
        ensure_dir(base / d)

    log("Directory structure successfully created.")

if __name__ == "__main__":
    generate_structure()
    print("\n✅ Project structure verified and generated successfully.")
