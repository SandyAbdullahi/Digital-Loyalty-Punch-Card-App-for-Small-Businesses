import math
import redis
from datetime import datetime, timedelta
import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from jose import jws
from pydantic import BaseModel
from sqlalchemy.orm import Session
from pydantic import BaseModel as PydanticBaseModel
from sqlalchemy import text

from ...core.config import settings
from ...core.limiter import limiter
from ...core.security import verify_jws_token
from ...db.session import get_db
from ...api.deps import get_current_user
from ...services.membership import get_membership_by_customer_and_program, earn_stamps
from ...api.v1.websocket import get_websocket_manager
from ...services.auth import get_user_by_email
from ...services.loyalty_program import get_loyalty_program
from sqlalchemy.orm import joinedload
from ...models.ledger_entry import LedgerEntry, LedgerEntryType
from ...models.loyalty_program import LoyaltyProgram
from ...models.merchant import Merchant

router = APIRouter()

redis_client = redis.from_url(settings.REDIS_URL)


class QRToken(BaseModel):
    token: str


class ScanRequest(BaseModel):
    token: str
    lat: float | None = None
    lng: float | None = None
    device_fingerprint: str | None = None


class IssueJoinRequest(PydanticBaseModel):
    program_id: UUID


class IssueStampRequest(PydanticBaseModel):
    program_id: UUID
    purchase_total: float | None = None


class IssueRedeemRequest(PydanticBaseModel):
    program_id: UUID
    amount: int


def verify_token(token: str) -> dict:
    try:
        payload = jws.verify(token, settings.SIGNING_KEY, algorithms=["HS256"])
        return payload
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid token")


def check_geofence(user_lat: float, user_lng: float, location_lat: float, location_lng: float, max_distance_m: int = 100) -> bool:
    # Haversine formula for distance in meters
    R = 6371000  # Earth radius in meters
    dlat = math.radians(location_lat - user_lat)
    dlon = math.radians(location_lng - user_lng)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(user_lat)) * math.cos(math.radians(location_lat)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance <= max_distance_m


def _claim_nonce_or_raise(db: Session, raw_nonce: str):
    try:
        nonce_uuid = uuid.UUID(raw_nonce)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid QR code nonce")

    try:
        db.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS qr_token_usage (
                    nonce TEXT PRIMARY KEY,
                    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )
        result = db.execute(
            text(
                """
                INSERT INTO qr_token_usage (nonce)
                VALUES (:nonce)
                ON CONFLICT (nonce) DO NOTHING
                """
            ),
            {"nonce": str(nonce_uuid)},
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=400, detail="QR code has already been used. Please request a new one.")
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise


@router.post("/issue-join", response_model=QRToken)
def issue_join_qr(request: IssueJoinRequest, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user = get_user_by_email(db, current_user)
    if not user or user.role != "merchant":
        raise HTTPException(status_code=403, detail="Not authorized")
    program = get_loyalty_program(db, request.program_id)
    if not program or program.merchant.owner_user_id != user.id:
        raise HTTPException(status_code=404, detail="Program not found")

    payload = {
        "type": "join",
        "program_id": str(request.program_id),
        "exp": (datetime.utcnow() + timedelta(seconds=60)).timestamp(),
        "nonce": str(uuid.uuid4()),  # Simple nonce
    }
    token = jws.sign(payload, settings.SIGNING_KEY, algorithm="HS256")
    return QRToken(token=token)


@router.post("/issue-stamp", response_model=QRToken)
def issue_stamp_qr(request: IssueStampRequest, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user = get_user_by_email(db, current_user)
    if not user or user.role != "merchant":
        raise HTTPException(status_code=403, detail="Not authorized")
    program = get_loyalty_program(db, request.program_id)
    if not program or program.merchant.owner_user_id != user.id:
        raise HTTPException(status_code=404, detail="Program not found")

    payload = {
        "type": "stamp",
        "program_id": str(request.program_id),
        "purchase_total": request.purchase_total,
        "exp": (datetime.utcnow() + timedelta(seconds=60)).timestamp(),
        "nonce": str(uuid.uuid4()),
    }
    token = jws.sign(payload, settings.SIGNING_KEY, algorithm="HS256")
    return QRToken(token=token)


def _scan_join_logic(request: ScanRequest, db: Session, user):
    payload = verify_jws_token(request.token)
    if payload.get("type") != "join":
        raise HTTPException(status_code=400, detail="Invalid token type")

    nonce = payload["nonce"]

    _claim_nonce_or_raise(db, nonce)

    try:
        if redis_client.exists(nonce):
            raise HTTPException(status_code=400, detail="QR code has already been used. Please request a new one.")
    except Exception:
        pass  # Skip nonce check if Redis unavailable

    # Check expiration
    if datetime.utcnow().timestamp() > payload["exp"]:
        raise HTTPException(status_code=400, detail="QR code has expired. Please request a new one from the merchant.")

    program_id_str = payload.get("program_id") or payload.get("location_id")
    if not program_id_str:
        raise HTTPException(status_code=400, detail="Invalid token")
    program_id = UUID(program_id_str)
    program = db.query(LoyaltyProgram).options(joinedload(LoyaltyProgram.merchant).joinedload(Merchant.locations)).filter(LoyaltyProgram.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    # Check geofence
    if request.lat is not None and request.lng is not None:
        # Get merchant's first location
        location = program.merchant.locations[0] if program.merchant.locations else None
        if location:
            if not check_geofence(request.lat, request.lng, location.lat, location.lng):
                raise HTTPException(status_code=400, detail="You are not near the merchant location. Please move closer to scan.")

    # Create membership if not exists
    membership = get_membership_by_customer_and_program(db, user.id, program_id)
    if not membership:
        from ...services.membership import create_membership
        from ...schemas.customer_program_membership import CustomerProgramMembershipCreate
        membership = create_membership(db, CustomerProgramMembershipCreate(
            customer_user_id=user.id,
            program_id=program_id,
        ))

    # Mark nonce as used
    try:
        redis_client.setex(nonce, 60, "used")
    except Exception:
        pass  # Skip if Redis unavailable

    return {"message": "Joined program", "membership_id": membership.id}


@router.post("/scan-join")
def scan_join(request: ScanRequest, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _scan_join_logic(request, db, user)


def _scan_stamp_logic(request: ScanRequest, db: Session, user):
    payload = verify_jws_token(request.token)
    if payload.get("type") != "stamp":
        raise HTTPException(status_code=400, detail="Invalid token type")

    nonce = payload["nonce"]

    _claim_nonce_or_raise(db, nonce)

    try:
        if redis_client.exists(nonce):
            raise HTTPException(status_code=400, detail="QR code has already been used. Please request a new one.")
    except Exception:
        pass  # Skip nonce check if Redis unavailable

    if datetime.utcnow().timestamp() > payload["exp"]:
        raise HTTPException(status_code=400, detail="QR code has expired. Please request a new one from the merchant.")

    program_id_str = payload.get("program_id") or payload.get("location_id")
    if not program_id_str:
        raise HTTPException(status_code=400, detail="Invalid token")
    program_id = UUID(program_id_str)
    program = db.query(LoyaltyProgram).options(joinedload(LoyaltyProgram.merchant).joinedload(Merchant.locations)).filter(LoyaltyProgram.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    # Check geofence
    if request.lat is not None and request.lng is not None:
        # Get merchant's first location
        location = program.merchant.locations[0] if program.merchant.locations else None
        if location:
            if not check_geofence(request.lat, request.lng, location.lat, location.lng):
                raise HTTPException(status_code=400, detail="You are not near the merchant location. Please move closer to scan.")

    membership = get_membership_by_customer_and_program(db, user.id, program_id)
    if not membership:
        raise HTTPException(status_code=400, detail="You are not a member of this program. Please join first.")

    # Earn stamps with scan prefix for notification detection
    updated_membership = earn_stamps(db, membership.id, 1, tx_ref=f"scan_{nonce}", device_fingerprint=request.device_fingerprint)

    # Broadcast the update to the customer via WebSocket
    if updated_membership:
        ws_manager = get_websocket_manager()
        ws_manager.broadcast_stamp_update_sync(str(user.id), str(updated_membership.program_id), updated_membership.current_balance)

    # Mark nonce as used
    try:
        redis_client.setex(nonce, 60, "used")
    except Exception:
        pass  # Skip if Redis unavailable

    return {"message": "Stamp earned from scan! Congratulations!", "new_balance": updated_membership.current_balance if updated_membership else membership.current_balance + 1}


@router.post("/scan-stamp")
def scan_stamp(request: ScanRequest, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _scan_stamp_logic(request, db, user)


@router.post("/issue-redeem", response_model=QRToken)
def issue_redeem_qr(request: IssueRedeemRequest, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user = get_user_by_email(db, current_user)
    if not user or user.role != "merchant":
        raise HTTPException(status_code=403, detail="Not authorized")
    program = get_loyalty_program(db, request.program_id)
    if not program or program.merchant.owner_user_id != user.id:
        raise HTTPException(status_code=404, detail="Program not found")

    payload = {
        "type": "redeem",
        "program_id": str(request.program_id),
        "amount": request.amount,
        "exp": (datetime.utcnow() + timedelta(seconds=60)).timestamp(),
        "nonce": str(uuid.uuid4()),
    }
    token = jws.sign(payload, settings.SIGNING_KEY, algorithm="HS256")
    return QRToken(token=token)


def _scan_redeem_logic(request: ScanRequest, db: Session, user):
    payload = verify_jws_token(request.token)
    if payload.get("type") != "redeem":
        raise HTTPException(status_code=400, detail="Invalid token type")

    nonce = payload["nonce"]

    _claim_nonce_or_raise(db, nonce)

    try:
        if redis_client.exists(nonce):
            raise HTTPException(status_code=400, detail="QR code has already been used. Please request a new one.")
    except Exception:
        pass  # Skip nonce check if Redis unavailable

    if datetime.utcnow().timestamp() > payload["exp"]:
        raise HTTPException(status_code=400, detail="QR code has expired. Please request a new one from the merchant.")

    program_id_str = payload.get("program_id") or payload.get("location_id")
    if not program_id_str:
        raise HTTPException(status_code=400, detail="Invalid token")
    program_id = UUID(program_id_str)
    program = db.query(LoyaltyProgram).options(joinedload(LoyaltyProgram.merchant).joinedload(Merchant.locations)).filter(LoyaltyProgram.id == program_id).first()
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    # Check geofence
    if request.lat is not None and request.lng is not None:
        # Get merchant's first location
        location = program.merchant.locations[0] if program.merchant.locations else None
        if location:
            if not check_geofence(request.lat, request.lng, location.lat, location.lng):
                raise HTTPException(status_code=400, detail="You are not near the merchant location. Please move closer to scan.")

    membership = get_membership_by_customer_and_program(db, user.id, program_id)
    if not membership:
        raise HTTPException(status_code=400, detail="You are not a member of this program. Please join first.")

    amount = payload["amount"]
    if membership.current_balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # Redeem stamps
    from ...services.membership import redeem_stamps
    updated_membership = redeem_stamps(db, membership.id, amount, tx_ref=nonce, device_fingerprint=request.device_fingerprint)
    if not updated_membership:
        raise HTTPException(status_code=400, detail="Redeem failed")

    # Mark nonce as used
    try:
        redis_client.setex(nonce, 60, "used")
    except Exception:
        pass  # Skip if Redis unavailable

    return {"message": "Stamps redeemed", "new_balance": updated_membership.current_balance}


@router.post("/scan-redeem")
def scan_redeem(request: ScanRequest, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _scan_redeem_logic(request, db, user)


@router.post("/scan")
def scan_qr(request: ScanRequest, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    """Universal scan endpoint that determines the action based on token type"""
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        payload = verify_jws_token(request.token)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid token")

    token_type = payload.get("type")
    if token_type == "join":
        return _scan_join_logic(request, db, user)
    elif token_type == "stamp":
        return _scan_stamp_logic(request, db, user)
    elif token_type == "redeem":
        return _scan_redeem_logic(request, db, user)
    else:
        raise HTTPException(status_code=400, detail="Unknown token type")
