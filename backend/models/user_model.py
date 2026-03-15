from datetime import datetime, timezone
from config.database import get_db
import bcrypt


def create_user(email: str, password: str) -> dict:
    db            = get_db()
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = {
        "email":         email.lower().strip(),
        "password_hash": password_hash,
        "created_at":    datetime.now(timezone.utc),
    }
    result      = db.users.insert_one(user)
    user["_id"] = result.inserted_id
    return user


def find_user_by_email(email: str) -> dict | None:
    return get_db().users.find_one({"email": email.lower().strip()})


def verify_password(user: dict, password: str) -> bool:
    return bcrypt.checkpw(password.encode(), user["password_hash"].encode())


def email_exists(email: str) -> bool:
    return find_user_by_email(email) is not None