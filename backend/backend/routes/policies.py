from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from deps import get_db
from models import Policy, UserPolicy
from auth_deps import get_current_user, get_current_user_only

router = APIRouter(
    prefix="/policies",
    tags=["Policies"],
)

from typing import List
import json
import schemas

@router.get("/", response_model=List[schemas.PolicyOut])
def get_policies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Get all available policies
    """
    policies = db.query(Policy).offset(skip).limit(limit).all()
    
    results = []
    for p in policies:
        # Parse coverage if it's a string
        coverage_data = {}
        if isinstance(p.coverage, str):
            try:
                coverage_data = json.loads(p.coverage)
            except:
                coverage_data = {"raw": p.coverage}
        else:
            coverage_data = p.coverage or {}

        results.append({
            "id": p.id,
            "title": p.title, # Correctly map to title
            "provider": p.provider.name if p.provider else "Unknown",
            "provider_name": p.provider.name if p.provider else "Unknown",
            "premium": p.premium,
            "coverage": coverage_data,
            "policy_type": p.policy_type.value if hasattr(p.policy_type, "value") else p.policy_type,
            "term_months": p.term_months,
            "deductible": p.deductible
        })
            
    return results


@router.get("/my", response_model=List[schemas.UserPolicyOut])
def get_my_policies(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_only),
):
    """
    Get policies purchased by the logged-in user
    (Used for claim policy selection dropdown)
    """

    policies = (
        db.query(UserPolicy)
        .join(Policy, Policy.id == UserPolicy.policy_id)
        .filter(UserPolicy.user_id == current_user.id)
        .all()
    )

    # Convert Enums to strings for Pydantic if needed, 
    # but Pydantic's from_attributes handles it if Schema uses str.
    # However, Policy inside UserPolicy relies on PolicyOut having 'title'.
    
    # We must ensuring nested Policy object is loaded correctly.
    # SQLAlchemy lazy loading handles it, or eager load above.
    # Let's verify Coverage handling?
    # PolicyOut expects coverage as dict. In DB it is often JSON string.
    # We might need to manually parse it or add a validator to PolicyOut.
    # Let's fix coverage parsing globally in helper or schema?
    
    # For now, let's just return the ORM objects. 
    # BUT wait, Policy.coverage is string in DB. PolicyOut expects Dict.
    # Pydantic will fail to validate string against Dict.
    # So we MUST manually process the list like in get_policies.
    
    results = []
    for up in policies:
        coverage_data = {}
        if up.policy and up.policy.coverage:
             if isinstance(up.policy.coverage, str):
                try:
                    coverage_data = json.loads(up.policy.coverage)
                except:
                    coverage_data = {"raw": up.policy.coverage}
             else:
                coverage_data = up.policy.coverage
        
        # We need to construct PolicyOut manually because of the coverage parsing issue
        policy_data = None
        if up.policy:
            policy_data = {
                "id": up.policy.id,
                "title": up.policy.title,
                "provider": up.policy.provider.name if up.policy.provider else "Unknown",
                "provider_name": up.policy.provider.name if up.policy.provider else "Unknown",
                "premium": up.policy.premium,
                "coverage": coverage_data,
                "policy_type": up.policy.policy_type.value if hasattr(up.policy.policy_type, "value") else up.policy.policy_type,
                "term_months": up.policy.term_months,
                "deductible": up.policy.deductible
            }

        results.append({
            "id": up.id,
            "user_id": up.user_id,
            "policy_id": up.policy_id,
            "policy_number": up.policy_number,
            "start_date": up.start_date,
            "end_date": up.end_date,
            "premium": up.premium,
            "status": up.status.value if hasattr(up.status, "value") else up.status,
            "auto_renew": up.auto_renew,
            "policy": policy_data
        })

    return results
