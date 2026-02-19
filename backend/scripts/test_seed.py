"""Test seed to get full error message."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from scripts.seed import seed_data
    seed_data()
except Exception as e:
    print(f"\n❌ ERROR Details:")
    print(f"Type: {type(e).__name__}")
    print(f"Message: {str(e)}")
    
    if hasattr(e, 'orig'):
        print(f"Original Error: {e.orig}")
    
    import traceback
    print("\nFull Traceback:")
    traceback.print_exc()
