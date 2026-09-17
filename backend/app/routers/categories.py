from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.category import Category, StockCategory
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    StockCategoryAssign,
    StockCategoryResponse
)
from app.routers.deps import get_current_user

router = APIRouter()

# 1. List user categories
@router.get("", response_model=List[CategoryResponse], summary="List all categories for current user")
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Category).filter(Category.user_id == current_user.id).all()

# 2. Create category
@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED, summary="Create a new stock category")
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    name = category_in.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name cannot be empty.")
    
    existing = db.query(Category).filter(
        Category.user_id == current_user.id,
        Category.name == name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Category '{name}' already exists.")

    category = Category(
        user_id=current_user.id,
        name=name,
        color=category_in.color or "#3b82f6"
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

# 3. Update category
@router.put("/{category_id}", response_model=CategoryResponse, summary="Update an existing category")
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")

    if category_in.name is not None:
        name = category_in.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="Category name cannot be empty.")
        category.name = name
    if category_in.color is not None:
        category.color = category_in.color

    db.add(category)
    db.commit()
    db.refresh(category)
    return category

# 4. Delete category
@router.delete("/{category_id}", status_code=status.HTTP_200_OK, summary="Delete a category")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")

    db.delete(category)
    db.commit()
    return {"status": "ok", "message": f"Category '{category.name}' deleted."}

# 5. List all stock-category assignments for current user
@router.get("/assignments", response_model=List[StockCategoryResponse], summary="List all symbol category assignments")
def get_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assignments = db.query(StockCategory).filter(StockCategory.user_id == current_user.id).all()
    return assignments

# 6. Assign category to symbol
@router.post("/assign", response_model=StockCategoryResponse, status_code=status.HTTP_201_CREATED, summary="Assign category to a stock symbol")
def assign_category_to_symbol(
    assign_in: StockCategoryAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    symbol = assign_in.symbol.strip().upper()
    category = db.query(Category).filter(
        Category.id == assign_in.category_id,
        Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")

    existing = db.query(StockCategory).filter(
        StockCategory.user_id == current_user.id,
        StockCategory.category_id == category.id,
        StockCategory.symbol == symbol
    ).first()
    if existing:
        return existing

    assignment = StockCategory(
        user_id=current_user.id,
        category_id=category.id,
        symbol=symbol
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

# 7. Remove category assignment from symbol
@router.delete("/assign/{category_id}/{symbol}", status_code=status.HTTP_200_OK, summary="Remove category assignment from stock")
def remove_category_from_symbol(
    category_id: int,
    symbol: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    clean_sym = symbol.strip().upper()
    assignment = db.query(StockCategory).filter(
        StockCategory.user_id == current_user.id,
        StockCategory.category_id == category_id,
        StockCategory.symbol == clean_sym
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Category assignment not found.")

    db.delete(assignment)
    db.commit()
    return {"status": "ok", "message": f"Removed category from {clean_sym}."}
