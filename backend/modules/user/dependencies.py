"""
get_current_user is the dependency every protected route uses. It's
what turns "there's a valid JWT in the Authorization header" into "here
is the actual User row" — controllers depend on this instead of
duplicating token-decoding logic themselves.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database.session import get_db
from modules.user.model import User
from modules.user.repository import UserRepository
from modules.user.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise unauthorized

    user = UserRepository(db).get_by_id(user_id)
    if user is None:
        raise unauthorized

    return user
