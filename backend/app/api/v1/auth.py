from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...core.security import create_access_token, create_refresh_token
from ...db.session import get_db
from ...schemas.auth import AuthRequest, Token
from ...services.auth import authenticate_user, create_user, get_user_by_email

router = APIRouter()


@router.post("/login-or-register", response_model=Token)
def login_or_register(auth_data: AuthRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, auth_data.email)
    if user:
        # Login
        if not authenticate_user(db, auth_data.email, auth_data.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect password",
            )
    else:
        # Register
        user_create = UserCreate(
            email=auth_data.email,
            password=auth_data.password,
            role="customer",  # Default role
        )
        user = create_user(db, user_create)

    # Update last login
    from ....services.auth import update_last_login
    update_last_login(db, user)

    # Create tokens
    access_token = create_access_token(subject=user.email)
    refresh_token = create_refresh_token(subject=user.email)

    return Token(access_token=access_token, refresh_token=refresh_token)