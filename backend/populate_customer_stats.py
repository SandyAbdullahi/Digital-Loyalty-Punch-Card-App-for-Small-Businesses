#!/usr/bin/env python3
"""
Script to populate CustomerStats for existing customers based on ledger entries.
"""

import sys
import os
from decimal import Decimal
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.customer_stats import CustomerStats
from app.models.ledger_entry import LedgerEntry, LedgerEntryType
from app.models.reward import Reward, RewardStatus
from sqlalchemy import func


def populate_customer_stats():
    db: Session = SessionLocal()
    try:
        # Get all customers who have ledger entries
        customers_with_entries = db.query(LedgerEntry.customer_id).distinct().all()
        customer_ids = [row[0] for row in customers_with_entries]

        print(f"Found {len(customer_ids)} customers with ledger entries")

        for customer_id in customer_ids:
            # Check if stats already exist
            existing_stats = db.query(CustomerStats).filter(CustomerStats.customer_id == customer_id).first()
            if existing_stats:
                print(f"Stats already exist for customer {customer_id}")
                continue

            # Count total visits (EARN entries)
            total_visits = db.query(func.count(LedgerEntry.id)).filter(
                LedgerEntry.customer_id == customer_id,
                LedgerEntry.entry_type == LedgerEntryType.EARN
            ).scalar() or 0

            # Sum revenue (currently 0.0 as placeholder)
            total_revenue = Decimal('0.0')

            # Count redeemed rewards
            total_rewards_redeemed = db.query(func.count(Reward.id)).filter(
                Reward.customer_id == customer_id,
                Reward.status == RewardStatus.REDEEMED
            ).scalar() or 0

            # Get last visit
            last_visit_entry = db.query(LedgerEntry.created_at).filter(
                LedgerEntry.customer_id == customer_id,
                LedgerEntry.entry_type == LedgerEntryType.EARN
            ).order_by(LedgerEntry.created_at.desc()).first()

            last_visit_at = last_visit_entry[0] if last_visit_entry else None

            # Create stats
            stats = CustomerStats(
                customer_id=customer_id,
                total_visits=total_visits,
                total_revenue=total_revenue,
                rewards_redeemed=total_rewards_redeemed,
                last_visit_at=last_visit_at
            )
            db.add(stats)
            print(f"Created stats for customer {customer_id}: visits={total_visits}, rewards={total_rewards_redeemed}")

        db.commit()
        print("Customer stats populated successfully")

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    populate_customer_stats()