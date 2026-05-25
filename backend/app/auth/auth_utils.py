import os
from functools import wraps

from flask import g, jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from werkzeug.security import check_password_hash, generate_password_hash

from app.repositories.user_repository import UserRepository

TOKEN_SALT = "ticketing-system-auth"
TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24


def _serializer():
    secret = os.getenv("AUTH_SECRET_KEY") or os.getenv("SECRET_KEY") or "dev-ticketing-secret"
    return URLSafeTimedSerializer(secret)


def hash_password(password):
    return generate_password_hash(password, method="pbkdf2:sha256")


def verify_password(password_hash, password):
    if not password_hash:
        return False
    return check_password_hash(password_hash, password)


def create_token(user):
    return _serializer().dumps({"user_id": user["id"]}, salt=TOKEN_SALT)


def get_user_from_token(token):
    try:
        payload = _serializer().loads(token, salt=TOKEN_SALT, max_age=TOKEN_MAX_AGE_SECONDS)
    except (BadSignature, SignatureExpired):
        return None

    user_id = payload.get("user_id")
    if not user_id:
        return None
    return UserRepository().get_by_id(user_id)


def current_user():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    return get_user_from_token(auth_header.removeprefix("Bearer ").strip())


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        user = current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        g.current_user = user
        return view(*args, **kwargs)

    return wrapped
