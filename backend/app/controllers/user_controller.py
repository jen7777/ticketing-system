from app.repositories.user_repository import UserRepository
from app.auth.auth_utils import hash_password

repo = UserRepository()

def get_all():
    return repo.get_all()

def get(user_id):
    return repo.get_by_id(user_id)

def create(**data):
    if not data.get("name") or not data.get("email"):
        raise ValueError("Name and email are required")
    if repo.get_by_email(data["email"]):
        raise ValueError("Email is already in use")
    if data.get("password"):
        data["password_hash"] = hash_password(data.pop("password"))
    data.setdefault("role", "user")
    repo.create(data)
    return {"message": "User created successfully"}

def update(user_id, **data):
    user = get(user_id)
    if not user:
        raise ValueError(f"User {user_id} not found")
    if not data.get("name") or not data.get("email"):
        raise ValueError("Name and email are required")
    existing = repo.get_by_email(data["email"])
    if existing and existing["id"] != user_id:
        raise ValueError("Email is already in use")
    if data.get("password"):
        data["password_hash"] = hash_password(data.pop("password"))
    elif "password" in data:
        data.pop("password")
    data.setdefault("role", user.get("role", "user"))
    repo.update(user_id, data)
    return {"message": "User updated successfully"}

def delete(user_id):
    user = get(user_id)
    if not user:
        raise ValueError(f"User {user_id} not found")
    repo.delete(user_id)
    return True
