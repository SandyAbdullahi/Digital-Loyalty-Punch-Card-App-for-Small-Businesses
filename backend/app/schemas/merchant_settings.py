from pydantic import BaseModel, Field, field_serializer
from typing import Optional
from datetime import datetime
from uuid import UUID


class MerchantSettingsBase(BaseModel):
    avg_spend_per_visit_kes: float = Field(default=500.0, ge=0, description="Average spend per visit in KES")
    baseline_visits_per_customer_per_period: float = Field(default=1.0, ge=0, description="Baseline visits per customer per period")
    avg_reward_cost_kes: float = Field(default=100.0, ge=0, description="Average reward cost in KES")
    default_period: str = Field(default="month", description="Default period: month or quarter")
    monthly_subscription_kes: Optional[float] = Field(default=None, ge=0, description="Monthly subscription cost in KES")
    theme_primary_color: str = Field(default="#00C896", description="Hex primary color for mission control UI")
    theme_secondary_color: str = Field(default="#2196F3", description="Hex secondary color")
    theme_accent_color: str = Field(default="#FF5252", description="Hex accent color")
    theme_background_color: str = Field(default="#F5F5F5", description="Background color for UI")
    theme_mode: str = Field(default="light", description="Theme mode: light or dark")


class MerchantSettingsCreate(MerchantSettingsBase):
    pass


class MerchantSettingsUpdate(BaseModel):
    avg_spend_per_visit_kes: Optional[float] = Field(None, ge=0)
    baseline_visits_per_customer_per_period: Optional[float] = Field(None, ge=0)
    avg_reward_cost_kes: Optional[float] = Field(None, ge=0)
    default_period: Optional[str] = None
    monthly_subscription_kes: Optional[float] = Field(None, ge=0)
    theme_primary_color: Optional[str] = None
    theme_secondary_color: Optional[str] = None
    theme_accent_color: Optional[str] = None
    theme_background_color: Optional[str] = None
    theme_mode: Optional[str] = None


class MerchantSettings(MerchantSettingsBase):
    merchant_id: UUID
    updated_at: datetime

    @field_serializer('merchant_id')
    def serialize_merchant_id(self, value) -> str:
        return str(value)

    model_config = {"from_attributes": True}
