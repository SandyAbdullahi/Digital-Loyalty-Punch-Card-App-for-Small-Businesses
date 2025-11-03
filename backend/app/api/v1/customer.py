from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import shutil
from pathlib import Path

from ...db.session import get_db
from ...api.deps import get_current_user
from ...services.auth import get_user_by_email, update_user
from ...services.membership import get_memberships_by_customer
from ...schemas.customer_program_membership import CustomerProgramMembership
from ...schemas.user import UserUpdate

router = APIRouter()

@router.get("/memberships", response_model=List[CustomerProgramMembership])
def get_my_memberships(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return get_memberships_by_customer(db, user.id)


@router.put("/profile")
def update_profile(
    name: str = Form(None),
    email: str = Form(...),
    avatar: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    user = get_user_by_email(db, current_user)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = {"name": name, "email": email}

    if avatar:
        # Create uploads directory if it doesn't exist
        upload_dir = Path("uploads/avatars")
        upload_dir.mkdir(parents=True, exist_ok=True)

        # Generate unique filename
        file_extension = Path(avatar.filename).suffix
        filename = f"{user.id}{file_extension}"
        file_path = upload_dir / filename

        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(avatar.file, buffer)

        update_data["avatar_url"] = f"/uploads/avatars/{filename}"

    profile = UserUpdate(**update_data)
    return update_user(db, user, profile)