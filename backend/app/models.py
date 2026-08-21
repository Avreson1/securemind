import json
from datetime import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False)  # e.g., Finance, HR, Engineering, Sales, Legal, Operations, Cybersecurity & IT
    role = Column(String, default="staff", nullable=False)  # "admin" (Cyber Team) or "staff" (Standard Staff)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    results = relationship("QuizResult", back_populates="user", cascade="all, delete-orphan", lazy="joined")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scenario_text = Column(Text, nullable=False)
    category = Column(String, index=True, nullable=False)  # Phishing, Social Engineering, Credential Hygiene, Physical Security, Ransomware
    type = Column(String, default="multiple_choice", nullable=False)  # multiple_choice, email_inspection, spot_the_lie
    difficulty = Column(String, default="Intermediate", nullable=False)  # Beginner, Intermediate, Advanced
    email_metadata = Column(Text, nullable=True)  # JSON string for email sender, headers, body, red_flags
    options = Column(Text, nullable=False)  # JSON string list of choices
    correct_index = Column(Integer, nullable=False)
    educational_feedback = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def parsed_options(self):
        try:
            return json.loads(self.options)
        except Exception:
            return []

    @property
    def parsed_email_metadata(self):
        if not self.email_metadata:
            return None
        try:
            return json.loads(self.email_metadata)
        except Exception:
            return None


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    passed = Column(Boolean, default=False, nullable=False)
    category_scores = Column(Text, nullable=True)  # JSON string of performance per category
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("Profile", back_populates="results")

    @property
    def parsed_category_scores(self):
        if not self.category_scores:
            return {}
        try:
            return json.loads(self.category_scores)
        except Exception:
            return {}
