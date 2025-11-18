from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from ...api.deps import get_current_user, get_db
from ...models.user import UserRole
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


MOCK_MERCHANTS: List[MerchantOut] = [
    MerchantOut(
        id="m-1",
        name="Amber & Oak Café",
        owner_email="lena@amberoak.com",
        plan="growth",
        mrr=12900,
        status="active",
    ),
    MerchantOut(
        id="m-2",
        name="Atelier Beauty",
        owner_email="coo@atelier.com",
        plan="enterprise",
        mrr=28900,
        status="active",
    ),
    MerchantOut(
        id="m-3",
        name="Farm & Pantry",
        owner_email="hello@farmandpantry.com",
        plan="free",
        mrr=0,
        status="suspended",
    ),
]

MOCK_CUSTOMERS: List[CustomerOut] = [
    CustomerOut(id="c-1", name="Yazmin Obiero", email="yazmin@example.com", merchants=4, rewards=8),
    CustomerOut(id="c-2", name="Ken Mwangi", email="ken@example.com", merchants=2, rewards=3),
    CustomerOut(id="c-3", name="Fatma Abdalla", email="fatma@example.com", merchants=3, rewards=6),
]

MOCK_LEADS: List[LeadOut] = [
    LeadOut(id="l-1", company="Beanline Roasters", contact="hello@beanline.com", status="contacted", source="Landing"),
    LeadOut(id="l-2", company="Glow & Co. Spa", contact="ops@glowco.com", status="new", source="Sales form"),
    LeadOut(id="l-3", company="Crust Bakery", contact="hi@crust.bakery", status="qualified", source="Referral"),
]


@router.get("/overview", response_model=OverviewOut)
def get_overview(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    _require_developer(db, current_user)
    active_merchants = len([m for m in MOCK_MERCHANTS if m.status == "active"])
    suspended_merchants = len(MOCK_MERCHANTS) - active_merchants
    mrr = sum(m.mrr for m in MOCK_MERCHANTS)
    return OverviewOut(
        mrr=mrr,
        merchants=len(MOCK_MERCHANTS),
        active_merchants=active_merchants,
        suspended_merchants=suspended_merchants,
        customers=len(MOCK_CUSTOMERS),
        lead_pipeline=len(MOCK_LEADS),
    )


@router.get("/merchants", response_model=List[MerchantOut])
def list_merchants(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    _require_developer(db, current_user)
    return MOCK_MERCHANTS


@router.patch("/merchants/{merchant_id}/status", response_model=MerchantOut)
def update_merchant_status(merchant_id: str, status: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    _require_developer(db, current_user)
    normalized = status.lower()
    if normalized not in {"active", "suspended"}:
        raise HTTPException(status_code=400, detail="Status must be 'active' or 'suspended'")
    for idx, merchant in enumerate(MOCK_MERCHANTS):
        if merchant.id == merchant_id:
            merchant.status = normalized
            MOCK_MERCHANTS[idx] = merchant
            return merchant
    raise HTTPException(status_code=404, detail="Merchant not found")


@router.get("/customers", response_model=List[CustomerOut])
def list_customers(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    _require_developer(db, current_user)
    return MOCK_CUSTOMERS


@router.get("/leads", response_model=List[LeadOut])
def list_leads(db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    _require_developer(db, current_user)
    return MOCK_LEADS


@router.patch("/leads/{lead_id}", response_model=LeadOut)
def update_lead_status(lead_id: str, status: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    _require_developer(db, current_user)
    normalized = status.lower()
    if normalized not in {"new", "contacted", "qualified"}:
        raise HTTPException(status_code=400, detail="Status must be new/contacted/qualified")
    for idx, lead in enumerate(MOCK_LEADS):
        if lead.id == lead_id:
            lead.status = normalized
            MOCK_LEADS[idx] = lead
            return lead
    raise HTTPException(status_code=404, detail="Lead not found")


class ImpersonationOut(BaseModel):
    merchant_id: str
    token: str
    note: str


@router.post("/merchants/{merchant_id}/impersonate", response_model=ImpersonationOut)
def impersonate_merchant(merchant_id: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_user)):
    _require_developer(db, current_user)
    exists = any(m.id == merchant_id for m in MOCK_MERCHANTS)
    if not exists:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return ImpersonationOut(
        merchant_id=merchant_id,
        token="mock-impersonation-token",
        note="Replace with real impersonation JWT when backend available.",
    )
