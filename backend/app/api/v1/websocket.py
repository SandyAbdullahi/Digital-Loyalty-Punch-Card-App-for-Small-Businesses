from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List
import json
import logging
import asyncio
from sqlalchemy.orm import Session

from ...db.session import get_db
from ...api.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections[user_id])}")

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected. Remaining connections: {len(self.active_connections.get(user_id, []))}")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Failed to send message to user {user_id}: {e}")
                    # Remove broken connection
                    self.active_connections[user_id].remove(connection)

    async def broadcast_to_user(self, message: dict, user_id: str):
        await self.send_personal_message(message, user_id)

    async def broadcast_stamp_update(self, user_id: str, program_id: str, new_balance: int):
        message = {
            "type": "stamp_update",
            "program_id": program_id,
            "new_balance": new_balance,
            "timestamp": "now"
        }
        await self.broadcast_to_user(message, user_id)

    def broadcast_stamp_update_sync(self, user_id: str, program_id: str, new_balance: int):
        """Synchronous wrapper for broadcasting stamp updates"""
        # Create a new event loop if one doesn't exist, or use the current one
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # If loop is already running, we need to schedule the coroutine
                asyncio.create_task(self.broadcast_stamp_update(user_id, program_id, new_balance))
            else:
                loop.run_until_complete(self.broadcast_stamp_update(user_id, program_id, new_balance))
        except RuntimeError:
            # No event loop, create a new one
            asyncio.run(self.broadcast_stamp_update(user_id, program_id, new_balance))

    async def broadcast_redeem_notification(self, merchant_user_id: str, customer_name: str, program_name: str, stamps_redeemed: int, code: str):
        message = {
            "type": "redeem_request",
            "customer_name": customer_name,
            "program_name": program_name,
            "stamps_redeemed": stamps_redeemed,
            "code": code,
            "timestamp": "now"
        }
        await self.broadcast_to_user(message, f"merchant_{merchant_user_id}")

    def broadcast_redeem_notification_sync(self, merchant_user_id: str, customer_name: str, program_name: str, stamps_redeemed: int, code: str):
        """Synchronous wrapper for broadcasting redeem notifications"""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.create_task(self.broadcast_redeem_notification(merchant_user_id, customer_name, program_name, stamps_redeemed, code))
            else:
                loop.run_until_complete(self.broadcast_redeem_notification(merchant_user_id, customer_name, program_name, stamps_redeemed, code))
        except RuntimeError:
            asyncio.run(self.broadcast_redeem_notification(merchant_user_id, customer_name, program_name, stamps_redeemed, code))

    async def broadcast_notification(self, user_id: str, notification_data: dict):
        message = {
            "type": "notification",
            "data": notification_data
        }
        await self.broadcast_to_user(message, user_id)

manager = ConnectionManager()

# Export the manager for use in other modules
def get_websocket_manager():
    return manager

@router.websocket("/customer/{user_id}")
async def customer_websocket(
    websocket: WebSocket,
    user_id: str,
    db: Session = Depends(get_db)
):
    # Note: In a production app, you'd want to validate the user_id
    # and possibly use JWT tokens for authentication
    await manager.connect(f"customer_{user_id}", websocket)
    try:
        while True:
            # Keep the connection alive and listen for client messages
            data = await websocket.receive_text()
            # You can handle client messages here if needed
            logger.debug(f"Received message from customer {user_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(f"customer_{user_id}", websocket)
    except Exception as e:
        logger.error(f"WebSocket error for customer {user_id}: {e}")
        manager.disconnect(f"customer_{user_id}", websocket)

@router.websocket("/merchant/{user_id}")
async def merchant_websocket(
    websocket: WebSocket,
    user_id: str,
    db: Session = Depends(get_db)
):
    # Note: In a production app, you'd want to validate the user_id
    # and possibly use JWT tokens for authentication
    await manager.connect(f"merchant_{user_id}", websocket)
    try:
        while True:
            # Keep the connection alive and listen for client messages
            data = await websocket.receive_text()
            # You can handle client messages here if needed
            logger.debug(f"Received message from merchant {user_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(f"merchant_{user_id}", websocket)
    except Exception as e:
        logger.error(f"WebSocket error for merchant {user_id}: {e}")
        manager.disconnect(f"merchant_{user_id}", websocket)