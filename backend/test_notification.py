import sys
import os

# Add the project root and backend folder to sys.path
sys.path.append(os.getcwd())
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.database import SessionLocal
from app.models import Claim
from app.tasks import send_claim_notification

def test_notification():
    db = SessionLocal()
    try:
        # Get the latest claim
        claim = db.query(Claim).order_by(Claim.id.desc()).first()
        if not claim:
            print("No claims found in database to test with.")
            return

        print(f"Testing notification for Claim #{claim.claim_number}...")
        print(f"User: {claim.user_policy.user.name} ({claim.user_policy.user.email})")
        
        # Trigger the task synchronously (not using .delay for testing)
        send_claim_notification(claim.id, "approved")
        
        print("\nTest completed successfully. Check the console output above to see if the email 'sent' (or printed to console if not configured).")
        
    finally:
        db.close()

if __name__ == "__main__":
    test_notification()
