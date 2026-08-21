from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, List, Any
from ..database import get_db
from ..models import Profile, QuizResult, Question
from ..schemas import AnalyticsOverview, DepartmentMaturity

router = APIRouter(prefix="/api/analytics", tags=["Admin & HR Analytics"])

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(get_db)):
    """Compute enterprise Security Maturity Index (SMI) and department vulnerability telemetry."""
    profiles = db.query(Profile).all()
    results = db.query(QuizResult).all()
    
    total_employees = len(profiles)
    total_trainings = len(results)

    if total_trainings == 0:
        return AnalyticsOverview(
            security_maturity_index=0.0,
            total_employees=total_employees,
            total_trainings_completed=0,
            pass_rate=0.0,
            high_risk_departments=[],
            department_benchmarks=[],
            category_weaknesses={},
            recent_completions=[]
        )

    # Calculate overall metrics
    passed_count = sum(1 for r in results if r.passed)
    pass_rate = round((passed_count / total_trainings) * 100, 1)
    avg_score_total = sum(r.percentage for r in results) / total_trainings
    security_maturity_index = round(avg_score_total, 1)

    # Department aggregation
    dept_map: Dict[str, Dict[str, Any]] = {}
    for p in profiles:
        dept = p.department or "General"
        if dept not in dept_map:
            dept_map[dept] = {
                "staff_ids": set(),
                "results": [],
                "cat_stats": {}
            }
        dept_map[dept]["staff_ids"].add(p.id)

    # Collect category metrics across all results
    global_cat_stats: Dict[str, Dict[str, int]] = {}

    for r in results:
        user_dept = r.user.department if r.user else "General"
        if user_dept in dept_map:
            dept_map[user_dept]["results"].append(r)
        
        cats = r.parsed_category_scores
        for cat_name, stats in cats.items():
            c = stats.get("correct", stats.get("c", 0))
            t = stats.get("total", stats.get("t", 0))

            # Global
            if cat_name not in global_cat_stats:
                global_cat_stats[cat_name] = {"correct": 0, "total": 0}
            global_cat_stats[cat_name]["correct"] += c
            global_cat_stats[cat_name]["total"] += t

            # Departmental
            if user_dept in dept_map:
                if cat_name not in dept_map[user_dept]["cat_stats"]:
                    dept_map[user_dept]["cat_stats"][cat_name] = {"correct": 0, "total": 0}
                dept_map[user_dept]["cat_stats"][cat_name]["correct"] += c
                dept_map[user_dept]["cat_stats"][cat_name]["total"] += t

    # Build Department benchmarks
    dept_benchmarks: List[DepartmentMaturity] = []
    high_risk_depts: List[str] = []

    for dept, data in dept_map.items():
        staff_count = len(data["staff_ids"])
        res_list = data["results"]
        completed = len(res_list)
        
        if completed > 0:
            avg_pct = round(sum(r.percentage for r in res_list) / completed, 1)
        else:
            avg_pct = 0.0

        if avg_pct >= 85:
            risk = "Low Risk"
        elif avg_pct >= 70:
            risk = "Moderate"
        elif avg_pct >= 50:
            risk = "Elevated Risk"
            high_risk_depts.append(dept)
        else:
            risk = "Critical Vulnerability"
            high_risk_depts.append(dept)

        cat_pcts = {}
        for cname, cstat in data["cat_stats"].items():
            if cstat["total"] > 0:
                cat_pcts[cname] = round((cstat["correct"] / cstat["total"]) * 100, 1)

        dept_benchmarks.append(DepartmentMaturity(
            department=dept,
            total_staff=staff_count,
            completed_count=completed,
            average_score=avg_pct,
            risk_level=risk,
            category_scores=cat_pcts
        ))

    # Category weaknesses (percentage accuracy per category)
    category_weaknesses: Dict[str, float] = {}
    for cname, cstat in global_cat_stats.items():
        if cstat["total"] > 0:
            category_weaknesses[cname] = round((cstat["correct"] / cstat["total"]) * 100, 1)

    # Recent completions list
    recent_records = db.query(QuizResult).order_by(QuizResult.timestamp.desc()).limit(10).all()
    recent_completions = [
        {
            "id": r.id,
            "user_name": r.user.name if r.user else "Unknown Employee",
            "department": r.user.department if r.user else "General",
            "score": r.score,
            "total": r.total_questions,
            "percentage": r.percentage,
            "passed": r.passed,
            "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M")
        }
        for r in recent_records
    ]

    return AnalyticsOverview(
        security_maturity_index=security_maturity_index,
        total_employees=total_employees,
        total_trainings_completed=total_trainings,
        pass_rate=pass_rate,
        high_risk_departments=high_risk_depts,
        department_benchmarks=dept_benchmarks,
        category_weaknesses=category_weaknesses,
        recent_completions=recent_completions
    )
