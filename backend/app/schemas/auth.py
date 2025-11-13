from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class TokenData(BaseModel):
    email: str | None = None


class AuthRequest(BaseModel):
    email: str
    password: str
    confirm_password: str | None = None
    role: str = "customer"
    average_spend_per_visit: float | None = None
    baseline_visits_per_period: int | None = None
    reward_cost_estimate: float | None = None
