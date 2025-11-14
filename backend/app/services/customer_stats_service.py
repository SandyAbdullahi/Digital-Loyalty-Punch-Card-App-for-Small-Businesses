from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from uuid import UUID
from decimal import Decimal

from ..models.customer_stats import CustomerStats
from ..models.user import User


def get_or_create_customer_stats(db: Session, customer_id: UUID) -> CustomerStats:
    stats = db.query(CustomerStats).filter(CustomerStats.customer_id == customer_id).first()
    if not stats:
        stats = CustomerStats(customer_id=customer_id)
        db.add(stats)
        db.flush()  # Get the ID
    return stats


def update_visit_stats(db: Session, customer_id: UUID, revenue: float = 0.0):
    stats = get_or_create_customer_stats(db, customer_id)
    stats.total_visits += 1
    stats.total_revenue += Decimal(str(revenue))
    stats.last_visit_at = datetime.utcnow()
    stats.updated_at = datetime.utcnow()
    db.commit()


def update_reward_redeemed(db: Session, customer_id: UUID):
    stats = get_or_create_customer_stats(db, customer_id)
    stats.rewards_redeemed += 1
    stats.updated_at = datetime.utcnow()
    db.commit()


def get_customer_stats(db: Session, customer_id: UUID) -> CustomerStats | None:
    return db.query(CustomerStats).filter(CustomerStats.customer_id == customer_id).first()