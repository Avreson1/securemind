from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime

# ==========================================
# USER & RBAC SCHEMAS
# ==========================================

class ProfileBase(BaseModel):
    name: str
    email: EmailStr
    department: str
    role: Optional[str] = "staff"  # "admin" (Cyber Team) or "staff" (Standard Staff)
    is_active: Optional[bool] = True

class ProfileCreate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class UserLoginRequest(BaseModel):
    email: EmailStr

class UserUpdateSchema(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None  # "admin" or "staff"
    is_active: Optional[bool] = None

class UserHistoryItem(BaseModel):
    id: int
    score: int
    total_questions: int
    percentage: float
    passed: bool
    category_scores: Dict[str, Any]
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

class UserDetailResponse(ProfileResponse):
    completed_trainings: int = 0
    average_score: float = 0.0
    pass_rate: float = 0.0
    last_activity: Optional[datetime] = None

# ==========================================
# QUESTION & SCENARIO SCHEMAS
# ==========================================

class QuestionBase(BaseModel):
    scenario_text: str
    category: str
    type: Optional[str] = "multiple_choice"
    difficulty: Optional[str] = "Intermediate"
    email_metadata: Optional[Dict[str, Any]] = None
    options: List[str]
    correct_index: int
    educational_feedback: str

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    scenario_text: Optional[str] = None
    category: Optional[str] = None
    type: Optional[str] = None
    difficulty: Optional[str] = None
    email_metadata: Optional[Dict[str, Any]] = None
    options: Optional[List[str]] = None
    correct_index: Optional[int] = None
    educational_feedback: Optional[str] = None

class QuestionResponse(BaseModel):
    id: int
    scenario_text: str
    category: str
    type: str
    difficulty: str
    email_metadata: Optional[Dict[str, Any]] = None
    options: List[str]
    correct_index: int
    educational_feedback: str
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# QUIZ TELEMETRY SCHEMAS
# ==========================================

class QuizSubmissionItem(BaseModel):
    question_id: int
    selected_index: int

class QuizSubmission(BaseModel):
    user_id: str
    answers: List[QuizSubmissionItem]

class AnswerEvaluation(BaseModel):
    question_id: int
    selected_index: int
    correct_index: int
    is_correct: bool
    scenario_text: str
    category: str
    educational_feedback: str

class QuizResultResponse(BaseModel):
    id: int
    user_id: str
    user_name: Optional[str] = None
    user_department: Optional[str] = None
    score: int
    total_questions: int
    percentage: float
    passed: bool
    category_scores: Dict[str, Dict[str, int]]
    evaluations: Optional[List[AnswerEvaluation]] = None
    timestamp: datetime
    model_config = ConfigDict(from_attributes=True)

# ==========================================
# ANALYTICS & SECURITY MATURITY SCHEMAS
# ==========================================

class DepartmentMaturity(BaseModel):
    department: str
    total_staff: int
    completed_count: int
    average_score: float
    risk_level: str  # Low, Moderate, Elevated Risk, Critical Vulnerability
    category_scores: Dict[str, float]

class AnalyticsOverview(BaseModel):
    security_maturity_index: float  # 0 to 100
    total_employees: int
    total_trainings_completed: int
    pass_rate: float
    high_risk_departments: List[str]
    department_benchmarks: List[DepartmentMaturity]
    category_weaknesses: Dict[str, float]
    recent_completions: List[Dict[str, Any]]
