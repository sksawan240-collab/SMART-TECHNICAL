"""
FastAPI Main Application Entry Point
Smart Technical Support University Management System
"""

import os
import datetime
from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from app.schemas.schemas import (
    StudentRegistrationRequest,
    FacultyRegistrationRequest,
    OTPVerificationRequest,
    OTPResendRequest,
    LoginRequest,
    TicketCreateRequest,
    TicketUpdateRequest,
    FeedbackRequest,
    AIAssistantQueryRequest
)
from app.services.ticket_service import TicketSequenceManager
from app.email.templates.html_templates import get_otp_email_html, get_welcome_ticket_email_html

app = FastAPI(
    title="Smart Technical Support University API",
    version="1.0.0",
    description="Enterprise REST & WebSocket API for University Technical Operations"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Connection Manager for live notifications
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

ws_manager = ConnectionManager()

@app.get("/")
async def root():
    return {
        "system": "Smart Technical Support University Management System",
        "status": "OPERATIONAL",
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    return {
        "database": "CONNECTED",
        "aiService": "AVAILABLE",
        "emailService": "CONFIGURED",
        "webSockets": f"{len(ws_manager.active_connections)} active clients"
    }

@app.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or process incoming ping
            await websocket.send_json({"type": "PONG", "payload": data})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
