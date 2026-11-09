#!/usr/bin/env python3
"""
MongoDB Database Indexes Setup Script
Smart Technical Support University Management System

Sets up compound, unique, and TTL indexes for high-throughput university operations.
"""

import os
import sys

def print_index_plan():
    print("=" * 65)
    print(" SMART TECHNICAL SUPPORT UNIVERSITY - DATABASE INDEX ARCHITECTURE")
    print("=" * 65)
    indexes = [
        ("users", [("email", 1, True), ("studentId", 1, True), ("createdAt", -1, False)]),
        ("faculty", [("officialEmail", 1, True), ("facultyId", 1, True), ("department", 1, False)]),
        ("admin", [("email", 1, True)]),
        ("tickets", [("ticketId", 1, True), ("status", 1, False), ("priority", 1, False), ("assignedFacultyId", 1, False), ("createdByUserId", 1, False), ("createdAt", -1, False)]),
        ("ticket_messages", [("ticketId", 1, False), ("createdAt", 1, False)]),
        ("notifications", [("recipientEmail", 1, False), ("isRead", 1, False), ("createdAt", -1, False)]),
        ("otp_verifications", [("email", 1, False), ("expiresAt", 1, False)]), # TTL index expiresAt
        ("assets", [("assetTag", 1, True), ("department", 1, False), ("status", 1, False)]),
        ("laboratories", [("labCode", 1, True), ("department", 1, False)]),
        ("audit_logs", [("createdAt", -1, False), ("userId", 1, False), ("action", 1, False)]),
        ("knowledge_base", [("category", 1, False), ("views", -1, False)])
    ]

    for collection, keys in indexes:
        print(f"\n📦 Collection: {collection}")
        for idx in keys:
            unique_str = " (UNIQUE)" if idx[2] else ""
            print(f"   • Index on: {idx[0]} ({'ASC' if idx[1] == 1 else 'DESC'}){unique_str}")

if __name__ == "__main__":
    print_index_plan()
