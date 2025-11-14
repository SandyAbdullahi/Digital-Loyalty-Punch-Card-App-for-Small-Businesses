from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class CustomerProgram(BaseModel):
    id: str
    name: str
    progress: int
    threshold: int
    current_cycle: Optional[int] = None
    joined_at: Optional[str] = None


class CustomerReward(BaseModel):
    id: str
    program_id: str
    program_name: str
    status: str
    reached_at: Optional[str] = None
    redeemed_at: Optional[str] = None
    voucher_code: Optional[str] = None
    cycle: Optional[int] = None


class CustomerActivity(BaseModel):
    id: str
    program_id: str
    program_name: Optional[str] = None
    entry_type: str
    change: int
    timestamp: str
    notes: Optional[str] = None


class CustomerRewardSummary(BaseModel):
    redeemed: int
    redeemable: int
    expired: int


class CustomerInsights(BaseModel):
    total_programs: int
    lifetime_visits: int
    visits_last_30_days: int
    rewards_redeemed: int
    rewards_pending: int
    rewards_expired: int
    average_stamps_per_program: float


class CustomerDetail(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None
    total_stamps: int
    last_visit: Optional[str] = None
    last_visit_display: Optional[str] = None
    programs: List[CustomerProgram]
    redemption_history: List[CustomerReward]
    recent_activity: List[CustomerActivity]
    reward_summary: CustomerRewardSummary
    insights: CustomerInsights
    lifetime_total_visits: int
    lifetime_total_revenue: float
    lifetime_rewards_redeemed: int
    lifetime_avg_basket_size: float