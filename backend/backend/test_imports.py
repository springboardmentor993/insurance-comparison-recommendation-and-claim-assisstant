"""
Test script to verify all imports work correctly.
"""

try:
    print("Testing imports...")
    
    # Test dotenv
    from dotenv import load_dotenv
    print("✅ dotenv imported successfully")
    
    # Test config
    from config import JWT_SECRET_KEY, AWS_REGION
    print("✅ config imported successfully")
    
    # Test jwt_token
    from jwt_token import create_access_token
    print("✅ jwt_token imported successfully")
    
    # Test auth_deps
    from auth_deps import get_current_user
    print("✅ auth_deps imported successfully")
    
    # Test models
    from models import Claim, ClaimDocument
    print("✅ models imported successfully")
    
    # Test routes
    from routes.claims import router as claims_router
    print("✅ routes.claims imported successfully")
    
    from routes.policies import router as policies_router
    print("✅ routes.policies imported successfully")
    
    # Test main
    import main
    print("✅ main imported successfully")
    
    print("\n🎉 All imports successful! Server should work now.")
    
except Exception as e:
    print(f"\n❌ Import failed: {e}")
    import traceback
    traceback.print_exc()
