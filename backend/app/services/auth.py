from datetime import datetime
from uuid import uuid4
from sqlalchemy.orm import Session

from ..core.security import get_password_hash, verify_password
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user: UserCreate) -> User:
    hashed_password = get_password_hash(user.password)
    db_user = User(
        id=uuid4(),
        email=user.email,
        name=user.name,
        phone=user.phone,
        role=user.role,
        password_hash=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def update_last_login(db: Session, user: User) -> None:
    user.last_login_at = datetime.utcnow()
    db.commit()


def update_user(db: Session, user: User, updates: UserUpdate) -> User:
    for key, value in updates.model_dump(exclude_unset=True).items():
        if key == "password" and value:
            setattr(user, "password_hash", get_password_hash(value))
        elif key != "password":
            setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user