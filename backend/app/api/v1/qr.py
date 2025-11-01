import math
import redis
from datetime import datetime, timedelta
import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jws
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ...core.config import settings
from ...core.limiter import limiter
from ...core.security import verify_jws_token
from ...db.session import get_db
from ...api.deps import get_current_user
from ...services.membership import get_membership_by_customer_and_program, earn_stamps
from ...services.auth import get_user_by_email
from ...services.merchant import get_location

router = APIRouter()

redis_client = redis.from_url(settings.REDIS_URL)


class QRToken(BaseModel):
    token: str


class ScanRequest(BaseModel):
    token: str
    lat: float | None = None
    lng: float | None = None
    device_fingerprint: str | None = None


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


@router.post("/issue-join", response_model=QRToken)
def issue_join_qr(location_id: UUID, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user = get_user_by_email(db, current_user)
    if not user or user.role != "merchant":
        raise HTTPException(status_code=403, detail="Not authorized")
    location = get_location(db, location_id)
    if not location or location.merchant.owner_user_id != user.id:
        raise HTTPException(status_code=404, detail="Location not found")
    
    payload = {
        "type": "join",
        "location_id": str(location_id),
        "exp": (datetime.utcnow() + timedelta(seconds=90)).timestamp(),
        "nonce": str(uuid.uuid4()),  # Simple nonce
    }
    token = jws.sign(payload, settings.SIGNING_KEY, algorithm="HS256")
    return QRToken(token=token)


@router.post("/issue-stamp", response_model=QRToken)
def issue_stamp_qr(location_id: UUID, purchase_total: float | None = None, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user = get_user_by_email(db, current_user)
    if not user or user.role != "merchant":
        raise HTTPException(status_code=403, detail="Not authorized")
    location = get_location(db, location_id)
    if not location or location.merchant.owner_user_id != user.id:
        raise HTTPException(status_code=404, detail="Location not found")
    
    payload = {
        "type": "stamp",
        "location_id": str(location_id),
        "purchase_total": purchase_total,
        "exp": (datetime.utcnow() + timedelta(seconds=90)).timestamp(),
        "nonce": str(uuid.uuid4()),
    }
    token = jws.sign(payload, settings.SIGNING_KEY, algorithm="HS256")
    return QRToken(token=token)


@router.post("/scan-join")
def scan_join(request: ScanRequest, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    payload = verify_jws_token(request.token)
    if payload.get("type") != "join":
        raise HTTPException(status_code=400, detail="Invalid token type")

    nonce = payload["nonce"]
    # if redis_client.exists(nonce):
    #     raise HTTPException(status_code=400, detail="Token already used")

    # Check expiration
    if datetime.utcnow().timestamp() > payload["exp"]:
        raise HTTPException(status_code=400, detail="Token expired")

    location_id = UUID(payload["location_id"])
    location = get_location(db, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    # Geofence check
    if request.lat is not None and request.lng is not None:
        if not check_geofence(request.lat, request.lng, location.lat, location.lng):
            raise HTTPException(status_code=400, detail="Not near location")

    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create membership if not exists
    membership = get_membership_by_customer_and_program(db, user.id, location.merchant.programs[0].id)  # Assume first program
    if not membership:
        from ...services.membership import create_membership
        from ...schemas.customer_program_membership import CustomerProgramMembershipCreate
        membership = create_membership(db, CustomerProgramMembershipCreate(
            customer_user_id=user.id,
            program_id=location.merchant.programs[0].id,
        ))

    # Mark nonce as used
    # redis_client.setex(nonce, 300, "used")

    return {"message": "Joined program", "membership_id": membership.id}


@router.post("/scan-stamp")
def scan_stamp(request: ScanRequest, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    payload = verify_jws_token(request.token)
    if payload.get("type") != "stamp":
        raise HTTPException(status_code=400, detail="Invalid token type")

    nonce = payload["nonce"]
    # if redis_client.exists(nonce):
    #     raise HTTPException(status_code=400, detail="Token already used")

    if datetime.utcnow().timestamp() > payload["exp"]:
        raise HTTPException(status_code=400, detail="Token expired")

    location_id = UUID(payload["location_id"])
    location = get_location(db, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    if request.lat is not None and request.lng is not None:
        if not check_geofence(request.lat, request.lng, location.lat, location.lng):
            raise HTTPException(status_code=400, detail="Not near location")

    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    membership = get_membership_by_customer_and_program(db, user.id, location.merchant.programs[0].id)
    if not membership:
        raise HTTPException(status_code=404, detail="Not a member")

    # Earn stamps
    earn_stamps(db, membership.id, 1, tx_ref=nonce, device_fingerprint=request.device_fingerprint)

    # Mark nonce as used
    # redis_client.setex(nonce, 300, "used")

    return {"message": "Stamp earned", "new_balance": membership.current_balance}


@router.post("/issue-redeem", response_model=QRToken)
def issue_redeem_qr(location_id: UUID, amount: int, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    user = get_user_by_email(db, current_user)
    if not user or user.role != "merchant":
        raise HTTPException(status_code=403, detail="Not authorized")
    location = get_location(db, location_id)
    if not location or location.merchant.owner_user_id != user.id:
        raise HTTPException(status_code=404, detail="Location not found")

    payload = {
        "type": "redeem",
        "location_id": str(location_id),
        "amount": amount,
        "exp": (datetime.utcnow() + timedelta(seconds=120)).timestamp(),
        "nonce": str(uuid.uuid4()),
    }
    token = jws.sign(payload, settings.SIGNING_KEY, algorithm="HS256")
    return QRToken(token=token)


@router.post("/scan-redeem")
def scan_redeem(request: ScanRequest, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    payload = verify_jws_token(request.token)
    if payload.get("type") != "redeem":
        raise HTTPException(status_code=400, detail="Invalid token type")

    nonce = payload["nonce"]
    # if redis_client.exists(nonce):
    #     raise HTTPException(status_code=400, detail="Token already used")

    if datetime.utcnow().timestamp() > payload["exp"]:
        raise HTTPException(status_code=400, detail="Token expired")

    location_id = UUID(payload["location_id"])
    location = get_location(db, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    if request.lat is not None and request.lng is not None:
        if not check_geofence(request.lat, request.lng, location.lat, location.lng):
            raise HTTPException(status_code=400, detail="Not near location")

    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    membership = get_membership_by_customer_and_program(db, user.id, location.merchant.programs[0].id)
    if not membership:
        raise HTTPException(status_code=404, detail="Not a member")

    amount = payload["amount"]
    if membership.current_balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # Redeem stamps
    from ...services.membership import redeem_stamps
    updated_membership = redeem_stamps(db, membership.id, amount, tx_ref=nonce, device_fingerprint=request.device_fingerprint)
    if not updated_membership:
        raise HTTPException(status_code=400, detail="Redeem failed")

    # Mark nonce as used
    # redis_client.setex(nonce, 300, "used")

    return {"message": "Stamps redeemed", "new_balance": updated_membership.current_balance}