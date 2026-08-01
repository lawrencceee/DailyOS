from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.session import get_db
from modules.user.schema import UserRegister, UserLogin, UserResponse, TokenResponse
from modules.user.service import UserService, EmailAlreadyRegisteredError, InvalidCredentialsError
from modules.user.dependencies import get_current_user
from modules.user.model import User

router = APIRouter(prefix="/auth", tags=["auth"])


def get_user_service(db: Session = Depends(get_db)) -> UserService:
    return UserService(db)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, service: UserService = Depends(get_user_service)):
    try:
        _, token = service.register(payload.email, payload.password)
    except EmailAlreadyRegisteredError as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with that email already exists") from exc
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, service: UserService = Depends(get_user_service)):
    try:
        _, token = service.login(payload.email, payload.password)
    except InvalidCredentialsError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password") from exc
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
