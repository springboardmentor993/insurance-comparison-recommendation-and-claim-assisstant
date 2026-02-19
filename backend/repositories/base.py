"""
Base repository with common CRUD operations.

Follows:
- Single Responsibility: Only handles data access
- Open/Closed: New repositories extend without modifying this
- Dependency Inversion: Routes depend on repository abstraction
"""
from abc import ABC, abstractmethod
from typing import TypeVar, Generic, List, Optional, Type
from sqlalchemy.orm import Session

# Generic type for model classes
T = TypeVar("T")


class BaseRepository(ABC, Generic[T]):
    """
    Abstract base repository providing common CRUD operations.
    
    All concrete repositories should inherit from this class.
    This ensures consistent data access patterns across the application.
    
    Usage:
        class UserRepository(BaseRepository[User]):
            def __init__(self, db: Session):
                super().__init__(db, User)
    """
    
    def __init__(self, db: Session, model: Type[T]):
        """
        Initialize repository with database session and model class.
        
        Args:
            db: SQLAlchemy database session
            model: The SQLAlchemy model class this repository manages
        """
        self._db = db
        self._model = model
    
    @property
    def db(self) -> Session:
        """Access the database session."""
        return self._db
    
    def get_by_id(self, id: int) -> Optional[T]:
        """
        Get a single entity by ID.
        
        Args:
            id: Primary key of the entity
            
        Returns:
            Entity if found, None otherwise
        """
        return self._db.query(self._model).filter(self._model.id == id).first()
    
    def get_all(self, limit: int = 100, offset: int = 0) -> List[T]:
        """
        Get all entities with pagination.
        
        Args:
            limit: Maximum number of entities to return
            offset: Number of entities to skip
            
        Returns:
            List of entities
        """
        return self._db.query(self._model).limit(limit).offset(offset).all()
    
    def create(self, entity: T) -> T:
        """
        Create a new entity.
        
        Args:
            entity: Entity instance to persist
            
        Returns:
            The persisted entity with updated fields (e.g., ID)
        """
        self._db.add(entity)
        self._db.commit()
        self._db.refresh(entity)
        return entity
    
    def update(self, entity: T) -> T:
        """
        Update an existing entity.
        
        Args:
            entity: Entity instance with updated fields
            
        Returns:
            The updated entity
        """
        self._db.commit()
        self._db.refresh(entity)
        return entity
    
    def delete(self, entity: T) -> None:
        """
        Delete an entity.
        
        Args:
            entity: Entity instance to delete
        """
        self._db.delete(entity)
        self._db.commit()
    
    def delete_by_id(self, id: int) -> bool:
        """
        Delete an entity by ID.
        
        Args:
            id: Primary key of the entity to delete
            
        Returns:
            True if entity was deleted, False if not found
        """
        entity = self.get_by_id(id)
        if entity:
            self.delete(entity)
            return True
        return False
    
    def count(self) -> int:
        """
        Get total count of entities.
        
        Returns:
            Total number of entities
        """
        return self._db.query(self._model).count()
