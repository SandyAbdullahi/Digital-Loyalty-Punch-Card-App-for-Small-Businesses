from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from ...api.deps import get_current_user, get_db
from ...models.user import UserRole, User
from ...models.merchant import Merchant
from ...models.customer_program_membership import CustomerProgramMembership
from ...services.auth import get_user_by_email

router = APIRouter()


class MerchantOut(BaseModel):
    id: str
    name: str
    owner_email: EmailStr
    plan: str
    mrr: int
    status: str


class CustomerOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    merchants: int
    rewards: int


class LeadOut(BaseModel):
    id: str
    company: str
    contact: EmailStr
    status: str
    source: str


class OverviewOut(BaseModel):
    mrr: int
    merchants: int
    active_merchants: int
    suspended_merchants: int
    customers: int
    lead_pipeline: int


def _require_developer(db: Session, current_user_email: str):
    user = get_user_by_email(db, current_user_email)
    role = getattr(user.role, "value", getattr(user, "role", None)) if user else None
    if not user or role != UserRole.DEVELOPER.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only developers can access this endpoint.",
        )
    return user


@router.get("/overview", response_model=OverviewOut)
def get_overview(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    _require_developer(db, current_user)
    merchant_rows: List[Merchant] = db.query(Merchant).all()
    customer_rows: List[User] = db.query(User).filter_by(role=UserRole.CUSTOMER).all()
    active_merchants = len([m for m in merchant_rows if m.is_active])
    suspended_merchants = len(merchant_rows) - active_merchants
    mrr = 0  # TODO: replace with real subscription MRR once billing is wired
    return OverviewOut(
        mrr=mrr,
        merchants=len(merchant_rows),
        active_merchants=active_merchants,
        suspended_merchants=suspended_merchants,
        customers=len(customer_rows),
        lead_pipeline=0,
    )


@router.get("/merchants", response_model=List[MerchantOut])
def list_merchants(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    _require_developer(db, current_user)
    rows: List[Merchant] = db.query(Merchant).all()
    return [
        MerchantOut(
            id=str(row.id),
            name=row.display_name,
            owner_email=row.owner.email if row.owner else "",
            plan="",  # TODO: replace with real plan once billing is wired
            mrr=0,
            status="active" if row.is_active else "suspended",
        )
        for row in rows
    ]


@router.patch("/merchants/{merchant_id}/status", response_model=MerchantOut)
def update_merchant_status(merchant_id: str, status: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    _require_developer(db, current_user)
    normalized = status.lower()
    if normalized not in {"active", "suspended"}:
        raise HTTPException(status_code=400, detail="Status must be 'active' or 'suspended'")
    merchant = db.query(Merchant).filter_by(id=merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    merchant.is_active = normalized == "active"
    db.commit()
    db.refresh(merchant)
    return MerchantOut(
        id=str(merchant.id),
        name=merchant.display_name,
        owner_email=merchant.owner.email if merchant.owner else "",
        plan="",
        mrr=0,
        status="active" if merchant.is_active else "suspended",
    )


@router.get("/customers", response_model=List[CustomerOut])
def list_customers(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    _require_developer(db, current_user)
    rows: List[User] = db.query(User).filter_by(role=UserRole.CUSTOMER).all()
    counts = (
        db.query(CustomerProgramMembership.customer_user_id, CustomerProgramMembership.merchant_id)
        .distinct()
        .all()
    )
    merchant_counts = {}
    for customer_id, merchant_id in counts:
        merchant_counts.setdefault(customer_id, set()).add(merchant_id)
    return [
        CustomerOut(
            id=str(row.id),
            name=row.name or row.email.split("@")[0],
            email=row.email,
            merchants=len(merchant_counts.get(row.id, set())),
            rewards=0,  # TODO: replace with real rewards once available
        )
        for row in rows
    ]


@router.get("/leads", response_model=List[LeadOut])
def list_leads(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    _require_developer(db, current_user)
    return []


@router.patch("/leads/{lead_id}", response_model=LeadOut)
def update_lead_status(lead_id: str, status: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    _require_developer(db, current_user)
    raise HTTPException(status_code=400, detail="Lead management not yet implemented")


class ImpersonationOut(BaseModel):
    merchant_id: str
    token: str
    note: str


@router.post("/merchants/{merchant_id}/impersonate", response_model=ImpersonationOut)
def impersonate_merchant(merchant_id: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    _require_developer(db, current_user)
    exists = db.query(Merchant).filter_by(id=merchant_id).first()
    if not exists:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return ImpersonationOut(
        merchant_id=merchant_id,
        token="mock-impersonation-token",
        note="Replace with real impersonation JWT when backend available.",
    )
