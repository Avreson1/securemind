import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Question, Profile, QuizResult
from ..schemas import QuizSubmission, QuizResultResponse, AnswerEvaluation

router = APIRouter(prefix="/api/quiz", tags=["Quiz & Simulation Engine"])

PASSING_THRESHOLD_PERCENT = 70.0

@router.post("/submit", response_model=QuizResultResponse, status_code=status.HTTP_201_CREATED)
def submit_quiz(submission: QuizSubmission, db: Session = Depends(get_db)):
    """Evaluate submitted quiz answers, log telemetry, and return comprehensive feedback."""
    user = db.query(Profile).filter(Profile.id == submission.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")

    if not submission.answers:
        raise HTTPException(status_code=400, detail="Submission cannot be empty")

    question_ids = [a.question_id for a in submission.answers]
    questions = db.query(Question).filter(Question.id.in_(question_ids)).all()
    q_map = {q.id: q for q in questions}

    correct_count = 0
    total_count = len(submission.answers)
    category_scores = {}
    evaluations = []

    for item in submission.answers:
        q = q_map.get(item.question_id)
        if not q:
            continue
        
        is_correct = (item.selected_index == q.correct_index)
        if is_correct:
            correct_count += 1
        
        # Track category breakdown
        cat = q.category
        if cat not in category_scores:
            category_scores[cat] = {"correct": 0, "total": 0}
        category_scores[cat]["total"] += 1
        if is_correct:
            category_scores[cat]["correct"] += 1

        evaluations.append(AnswerEvaluation(
            question_id=q.id,
            selected_index=item.selected_index,
            correct_index=q.correct_index,
            is_correct=is_correct,
            scenario_text=q.scenario_text,
            category=q.category,
            educational_feedback=q.educational_feedback
        ))

    percentage = round((correct_count / total_count) * 100, 1) if total_count > 0 else 0.0
    passed = (percentage >= PASSING_THRESHOLD_PERCENT)

    # Persist in DB
    result_record = QuizResult(
        user_id=user.id,
        score=correct_count,
        total_questions=total_count,
        percentage=percentage,
        passed=passed,
        category_scores=json.dumps(category_scores),
        timestamp=datetime.utcnow()
    )
    db.add(result_record)
    db.commit()
    db.refresh(result_record)

    return QuizResultResponse(
        id=result_record.id,
        user_id=user.id,
        user_name=user.name,
        user_department=user.department,
        score=correct_count,
        total_questions=total_count,
        percentage=percentage,
        passed=passed,
        category_scores=category_scores,
        evaluations=evaluations,
        timestamp=result_record.timestamp
    )

@router.get("/results", response_model=List[QuizResultResponse])
def get_quiz_results(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Retrieve quiz attempt history."""
    query = db.query(QuizResult)
    if user_id:
        query = query.filter(QuizResult.user_id == user_id)
    
    results = query.order_by(QuizResult.timestamp.desc()).limit(limit).all()
    
    response_list = []
    for r in results:
        user_name = r.user.name if r.user else "Unknown"
        user_dept = r.user.department if r.user else "General"
        response_list.append(QuizResultResponse(
            id=r.id,
            user_id=r.user_id,
            user_name=user_name,
            user_department=user_dept,
            score=r.score,
            total_questions=r.total_questions,
            percentage=r.percentage,
            passed=r.passed,
            category_scores=r.parsed_category_scores,
            evaluations=None,
            timestamp=r.timestamp
        ))
    return response_list
