from sqlalchemy.orm import Session

from modules.user.model import User
from modules.user.repository import UserRepository
from modules.user.security import hash_password, verify_password, create_access_token


class EmailAlreadyRegisteredError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class UserService:
    def __init__(self, db: Session):
        self.repository = UserRepository(db)

    def register(self, email: str, password: str) -> tuple[User, str]:
        if self.repository.get_by_email(email) is not None:
            raise EmailAlreadyRegisteredError(email)
        user = self.repository.create(email=email, hashed_password=hash_password(password))
        token = create_access_token(user.id)
        return user, token

    def login(self, email: str, password: str) -> tuple[User, str]:
        user = self.repository.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            # Deliberately the same error for "no such user" and "wrong
            # password" — distinguishing them lets an attacker enumerate
            # which emails have accounts.
            raise InvalidCredentialsError()
        token = create_access_token(user.id)
        return user, token
