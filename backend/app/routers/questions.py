import json
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Question
from ..schemas import QuestionCreate, QuestionUpdate, QuestionResponse

router = APIRouter(prefix="/api/questions", tags=["Live Scenario & Question Bank"])

@router.get("", response_model=List[QuestionResponse])
def get_questions(
    category: Optional[str] = Query(None, description="Filter by threat category"),
    type: Optional[str] = Query(None, description="Filter by question type (e.g. email_inspection, multiple_choice)"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Fetch scenarios dynamically from database for staff training and phishing simulation."""
    query = db.query(Question)
    if category and category.lower() != 'all':
        query = query.filter(Question.category.ilike(category))
    if type:
        query = query.filter(Question.type.ilike(type))
    if difficulty:
        query = query.filter(Question.difficulty.ilike(difficulty))
    
    questions = query.order_by(Question.id.asc()).limit(limit).all()
    results = []
    for q in questions:
        results.append(QuestionResponse(
            id=q.id,
            scenario_text=q.scenario_text,
            category=q.category,
            type=q.type,
            difficulty=q.difficulty,
            email_metadata=q.parsed_email_metadata,
            options=q.parsed_options,
            correct_index=q.correct_index,
            educational_feedback=q.educational_feedback,
            created_at=q.created_at
        ))
    return results

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Retrieve all distinct threat categories dynamically from database."""
    categories = db.query(Question.category).distinct().all()
    return [c[0] for c in categories if c[0]]

@router.get("/{question_id}", response_model=QuestionResponse)
def get_question(question_id: int, db: Session = Depends(get_db)):
    """Retrieve a single scenario by ID from database."""
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return QuestionResponse(
        id=q.id,
        scenario_text=q.scenario_text,
        category=q.category,
        type=q.type,
        difficulty=q.difficulty,
        email_metadata=q.parsed_email_metadata,
        options=q.parsed_options,
        correct_index=q.correct_index,
        educational_feedback=q.educational_feedback,
        created_at=q.created_at
    )

@router.post("", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
def create_question(q_in: QuestionCreate, db: Session = Depends(get_db)):
    """Cyber Team: Create a new custom security scenario in the live database."""
    new_q = Question(
        scenario_text=q_in.scenario_text,
        category=q_in.category,
        type=q_in.type or "multiple_choice",
        difficulty=q_in.difficulty or "Intermediate",
        email_metadata=json.dumps(q_in.email_metadata) if q_in.email_metadata else None,
        options=json.dumps(q_in.options),
        correct_index=q_in.correct_index,
        educational_feedback=q_in.educational_feedback
    )
    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    return QuestionResponse(
        id=new_q.id,
        scenario_text=new_q.scenario_text,
        category=new_q.category,
        type=new_q.type,
        difficulty=new_q.difficulty,
        email_metadata=new_q.parsed_email_metadata,
        options=new_q.parsed_options,
        correct_index=new_q.correct_index,
        educational_feedback=new_q.educational_feedback,
        created_at=new_q.created_at
    )

@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(question_id: int, q_in: QuestionUpdate, db: Session = Depends(get_db)):
    """Cyber Team: Update an existing scenario in the live database."""
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    if q_in.scenario_text is not None:
        q.scenario_text = q_in.scenario_text
    if q_in.category is not None:
        q.category = q_in.category
    if q_in.type is not None:
        q.type = q_in.type
    if q_in.difficulty is not None:
        q.difficulty = q_in.difficulty
    if q_in.email_metadata is not None:
        q.email_metadata = json.dumps(q_in.email_metadata)
    if q_in.options is not None:
        q.options = json.dumps(q_in.options)
    if q_in.correct_index is not None:
        q.correct_index = q_in.correct_index
    if q_in.educational_feedback is not None:
        q.educational_feedback = q_in.educational_feedback

    db.commit()
    db.refresh(q)
    return QuestionResponse(
        id=q.id,
        scenario_text=q.scenario_text,
        category=q.category,
        type=q.type,
        difficulty=q.difficulty,
        email_metadata=q.parsed_email_metadata,
        options=q.parsed_options,
        correct_index=q.correct_index,
        educational_feedback=q.educational_feedback,
        created_at=q.created_at
    )

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: int, db: Session = Depends(get_db)):
    """Cyber Team: Remove a scenario from the live database."""
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()
    return None
