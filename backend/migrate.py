from backend.database import engine
from backend.models import Base

try:
    # Create all tables defined in models
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully!")
    print("✓ Users table is ready for registration")
except Exception as e:
    print(f"✗ Error: {e}")
