from app.auth.auth_utils import create_token, hash_password, verify_password
from app.repositories.user_repository import UserRepository

repo = UserRepository()


def register(name="", email="", password="", role="user"):
    if not name or not email or not password:
        raise ValueError("Name, email, and password are required")
    if len(password) < 6:
        raise ValueError("Password must be at least 6 characters")
    if repo.get_by_email(email):
        raise ValueError("Email is already in use")

    user_id = repo.create({
        "name": name,
        "email": email,
        "role": role or "user",
        "password_hash": hash_password(password),
    })
    user = repo.get_by_id(user_id)
    return {"token": create_token(user), "user": user}


def login(email="", password=""):
    if not email or not password:
        raise ValueError("Email and password are required")

    user_with_password = repo.get_by_email(email, include_password=True)
    if not user_with_password or not verify_password(user_with_password.get("password_hash"), password):
        raise ValueError("Invalid email or password")

    user = repo.get_by_id(user_with_password["id"])
    return {"token": create_token(user), "user": user}
