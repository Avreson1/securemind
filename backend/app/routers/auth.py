from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import Profile, QuizResult
from ..schemas import (
    ProfileCreate, 
    ProfileResponse, 
    UserLoginRequest, 
    UserUpdateSchema, 
    UserDetailResponse, 
    UserHistoryItem
)

router = APIRouter(prefix="/api/auth", tags=["Two-Tier Authentication & RBAC User Management"])

@router.post("/register", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def register_profile(profile_in: ProfileCreate, db: Session = Depends(get_db)):
    """Register a new staff member or cyber administrator account into the database."""
    email_clean = profile_in.email.lower().strip()
    existing = db.query(Profile).filter(Profile.email == email_clean).first()
    if existing:
        # Update existing profile
        existing.name = profile_in.name
        existing.department = profile_in.department
        if profile_in.role:
            existing.role = profile_in.role
        if profile_in.is_active is not None:
            existing.is_active = profile_in.is_active
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    new_profile = Profile(
        name=profile_in.name.strip(),
        email=email_clean,
        department=profile_in.department.strip(),
        role=profile_in.role or "staff",
        is_active=True if profile_in.is_active is None else profile_in.is_active
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

@router.post("/login", response_model=ProfileResponse)
def login_profile(login_in: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticate an existing staff member or cyber administrator account by email."""
    email_clean = login_in.email.lower().strip()
    profile = db.query(Profile).filter(Profile.email == email_clean).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"No account registered with email: {email_clean}. Please enroll first."
        )
    if not profile.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="This account has been deactivated by the Cyber Security Team."
        )
    return profile

@router.get("/users", response_model=List[UserDetailResponse])
def list_users(
    department: Optional[str] = Query(None, description="Filter by department"),
    role: Optional[str] = Query(None, description="Filter by role (admin or staff)"),
    db: Session = Depends(get_db)
):
    """
    Cyber Team Oversight: Retrieve all employee accounts from the database 
    along with their real-time training telemetry, average score, and pass rate.
    """
    query = db.query(Profile)
    if department:
        query = query.filter(Profile.department.ilike(department))
    if role:
        query = query.filter(Profile.role == role.lower())
    
    profiles = query.order_by(Profile.created_at.desc()).all()
    results = []

    for p in profiles:
        user_results = p.results or []
        completed_count = len(user_results)
        if completed_count > 0:
            avg_score = round(sum(r.percentage for r in user_results) / completed_count, 1)
            passed_count = sum(1 for r in user_results if r.passed)
            pass_rate = round((passed_count / completed_count) * 100, 1)
            last_activity = max(r.timestamp for r in user_results)
        else:
            avg_score = 0.0
            pass_rate = 0.0
            last_activity = None

        results.append(UserDetailResponse(
            id=p.id,
            name=p.name,
            email=p.email,
            department=p.department,
            role=p.role,
            is_active=p.is_active,
            created_at=p.created_at,
            updated_at=p.updated_at,
            completed_trainings=completed_count,
            average_score=avg_score,
            pass_rate=pass_rate,
            last_activity=last_activity
        ))

    return results

@router.get("/users/{user_id}", response_model=ProfileResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    """Retrieve a specific user profile by ID."""
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User account not found")
    return profile

@router.put("/users/{user_id}", response_model=ProfileResponse)
def update_user(user_id: str, update_in: UserUpdateSchema, db: Session = Depends(get_db)):
    """
    Cyber Team Management: Update an employee's role (promote/demote between Cyber Team and Staff),
    reassign department, or update active status.
    """
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User account not found")

    if update_in.name is not None:
        profile.name = update_in.name.strip()
    if update_in.department is not None:
        profile.department = update_in.department.strip()
    if update_in.role is not None:
        if update_in.role not in ["admin", "staff"]:
            raise HTTPException(status_code=400, detail="Invalid role. Must be 'admin' or 'staff'")
        profile.role = update_in.role
    if update_in.is_active is not None:
        profile.is_active = update_in.is_active

    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    return profile

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: str, db: Session = Depends(get_db)):
    """
    Cyber Team Decommissioning: Permanently remove an employee account and their associated quiz telemetry.
    """
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User account not found")

    db.delete(profile)
    db.commit()
    return None

@router.get("/users/{user_id}/history", response_model=List[UserHistoryItem])
def get_user_history(user_id: str, db: Session = Depends(get_db)):
    """
    Audit Telemetry: Retrieve the complete historical training log for a specific employee.
    """
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User account not found")

    results = db.query(QuizResult).filter(QuizResult.user_id == user_id).order_by(QuizResult.timestamp.desc()).all()
    history = []
    for r in results:
        history.append(UserHistoryItem(
            id=r.id,
            score=r.score,
            total_questions=r.total_questions,
            percentage=r.percentage,
            passed=r.passed,
            category_scores=r.parsed_category_scores,
            timestamp=r.timestamp
        ))
    return history
