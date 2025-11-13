"""
Compatibility wrapper for legacy imports.

The old code referenced ``app.models.redeem_code.RedeemCode`` but the new reward
logic stores everything in ``app.models.reward.Reward``. We re-export the new
model here so existing import paths continue to work without touching callers.
"""

from .reward import Reward as RedeemCode, RewardStatus

__all__ = ["RedeemCode", "RewardStatus"]
