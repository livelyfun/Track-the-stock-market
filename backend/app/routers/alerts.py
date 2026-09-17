from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.alert import Alert
from app.schemas.alert import AlertCreate, AlertUpdate, AlertResponse
from app.routers.deps import get_current_user

router = APIRouter()

@router.get("", response_model=List[AlertResponse], summary="Get all alerts for current user")
def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Alert).filter(Alert.user_id == current_user.id).order_by(Alert.created_at.desc()).all()

@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED, summary="Create a new price alert")
def create_alert(
    alert_in: AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    symbol = alert_in.symbol.strip().upper()
    condition = alert_in.condition.strip().upper()
    if condition not in ["ABOVE", "BELOW"]:
        raise HTTPException(status_code=400, detail="Condition must be 'ABOVE' or 'BELOW'.")

    alert = Alert(
        user_id=current_user.id,
        symbol=symbol,
        target_price=alert_in.target_price,
        condition=condition,
        is_active=True,
        is_triggered=False,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

@router.put("/{alert_id}", response_model=AlertResponse, summary="Update an existing price alert")
def update_alert(
    alert_id: int,
    alert_in: AlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    if alert_in.target_price is not None:
        alert.target_price = alert_in.target_price
    if alert_in.condition is not None:
        cond = alert_in.condition.strip().upper()
        if cond in ["ABOVE", "BELOW"]:
            alert.condition = cond
    if alert_in.is_active is not None:
        alert.is_active = alert_in.is_active
        if alert_in.is_active:
            alert.is_triggered = False
            alert.triggered_at = None

    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

@router.delete("/{alert_id}", status_code=status.HTTP_200_OK, summary="Delete an alert")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).filter(Alert.id == alert_id, Alert.user_id == current_user.id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    db.delete(alert)
    db.commit()
    return {"status": "ok", "message": "Alert deleted successfully."}
