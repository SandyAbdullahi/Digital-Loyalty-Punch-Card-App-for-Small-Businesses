from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...core.security import create_access_token, create_refresh_token
from ...db.session import get_db
from ...schemas.auth import AuthRequest, Token
from ...schemas.user import UserCreate
from ...schemas.merchant import MerchantCreate
from ...services.auth import authenticate_user, create_user, get_user_by_email, _normalize_role  # type: ignore
from ...services.merchant import create_merchant, get_merchants_by_owner
from ...models.user import UserRole

router = APIRouter()


@router.post("/login", response_model=Token)
def login(auth_data: AuthRequest, db: Session = Depends(get_db)):
    # First check if user exists
    user = get_user_by_email(db, auth_data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Login failed: Account does not exist",
        )

    # User exists, now check password
    if not authenticate_user(db, auth_data.email, auth_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Wrong password",
        )

    requested_role = _normalize_role(auth_data.role) if auth_data.role is not None else None
    user_role_value = getattr(user.role, "value", user.role)
    if requested_role and user_role_value != requested_role.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account type is not permitted in this application.",
        )

    if user_role_value == UserRole.MERCHANT.value:
        merchants = get_merchants_by_owner(db, user.id)
        if not merchants:
            fallback_name = (user.name or auth_data.email.split("@")[0]).title()
            merchant_payload = MerchantCreate(
                display_name=fallback_name,
                legal_name=fallback_name,
            )
            create_merchant(db, merchant_payload, user.id)

    # Update last login
    from ...services.auth import update_last_login
    update_last_login(db, user)

    # Create tokens
    access_token = create_access_token(subject=user.email)
    refresh_token = create_refresh_token(subject=user.email)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "role": user_role_value,
            "name": user.name,
            "avatar_url": getattr(user, "avatar_url", None),
        }
    )


@router.post("/register", response_model=Token)
def register(auth_data: AuthRequest, db: Session = Depends(get_db)):
    if auth_data.confirm_password is not None and auth_data.password != auth_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )
    # Check if user already exists
    existing_user = get_user_by_email(db, auth_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account already exists with this email",
        )

    # Create new user
    requested_role = _normalize_role(auth_data.role)
    user_create = UserCreate(
        email=auth_data.email,
        password=auth_data.password,
        role=requested_role,
    )
    user = create_user(db, user_create)

    # Ensure merchant profile exists for merchant users
    user_role_value = getattr(user.role, "value", user.role)
    if user_role_value == UserRole.MERCHANT.value:
        merchants = get_merchants_by_owner(db, user.id)
        if not merchants:
            fallback_name = (user.name or auth_data.email.split("@")[0]).title()
            merchant_payload = MerchantCreate(
                display_name=fallback_name,
                legal_name=fallback_name,
                average_spend_per_visit=auth_data.average_spend_per_visit,
                baseline_visits_per_period=auth_data.baseline_visits_per_period,
                reward_cost_estimate=auth_data.reward_cost_estimate,
            )
            create_merchant(db, merchant_payload, user.id)

    # Update last login
    from ...services.auth import update_last_login
    update_last_login(db, user)

    # Create tokens
    access_token = create_access_token(subject=user.email)
    refresh_token = create_refresh_token(subject=user.email)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "role": user_role_value,
            "name": user.name,
            "avatar_url": getattr(user, "avatar_url", None),
        }
    )


# Keep the old endpoint for backward compatibility (but mark as deprecated)
@router.post("/login-or-register", response_model=Token, deprecated=True)
def login_or_register(auth_data: AuthRequest, db: Session = Depends(get_db)):
    """
    Deprecated: Use /login for existing users and /register for new users.
    This endpoint will be removed in a future version.
    """
    user = get_user_by_email(db, auth_data.email)
    requested_role = _normalize_role(auth_data.role) if auth_data.role is not None else None

    if user:
        # Login
        if not authenticate_user(db, auth_data.email, auth_data.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect password",
            )
        stored_role = getattr(user.role, "value", user.role)
        if requested_role and stored_role != requested_role.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account type is not permitted in this application.",
            )
    else:
        # Register
        if auth_data.confirm_password is not None and auth_data.password != auth_data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match",
            )

        user_create = UserCreate(
            email=auth_data.email,
            password=auth_data.password,
            role=requested_role or UserRole.CUSTOMER,
        )
        user = create_user(db, user_create)

    # Ensure merchant profile exists for merchant users
    user_role_value = getattr(user.role, "value", user.role)
    if user_role_value == UserRole.MERCHANT.value:
        merchants = get_merchants_by_owner(db, user.id)
        if not merchants:
            fallback_name = (user.name or auth_data.email.split("@")[0]).title()
            merchant_payload = MerchantCreate(
                display_name=fallback_name,
                legal_name=fallback_name,
            )
            create_merchant(db, merchant_payload, user.id)

    # Update last login
    from ...services.auth import update_last_login
    update_last_login(db, user)

    # Create tokens
    access_token = create_access_token(subject=user.email)
    refresh_token = create_refresh_token(subject=user.email)

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email,
            "role": user_role_value,
            "name": user.name,
            "avatar_url": getattr(user, "avatar_url", None),
        }
    )
