from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ...api.deps import get_current_user
from ...db.session import get_db
from ...services.analytics import get_merchant_analytics, get_top_customers, Period
from ...services.auth import get_user_by_email
from ...models.merchant import Merchant as MerchantModel


router = APIRouter(tags=["analytics"])


def _require_merchant_owner(db: Session, current_user: str, merchant_id: UUID) -> MerchantModel:
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    merchant = (
        db.query(MerchantModel)
        .filter(
            MerchantModel.id == merchant_id,
            MerchantModel.owner_user_id == user.id,
        )
        .first()
    )
    if not merchant:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to access this merchant's analytics",
        )
    return merchant


@router.get("/merchants/{merchant_id}/analytics")
def get_merchant_analytics_endpoint(
    merchant_id: UUID,
    period: str = Query(Period.THIS_MONTH, enum=[p.value for p in Period]),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    _require_merchant_owner(db, current_user, merchant_id)
    try:
        analytics = get_merchant_analytics(db, merchant_id, period)
        return analytics
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/merchants/{merchant_id}/analytics/customers")
def get_top_customers_endpoint(
    merchant_id: UUID,
    period: str = Query(Period.THIS_MONTH, enum=[p.value for p in Period]),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    _require_merchant_owner(db, current_user, merchant_id)
    try:
        customers = get_top_customers(db, merchant_id, period, limit)
        return {"customers": customers}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
