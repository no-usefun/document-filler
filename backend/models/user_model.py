from datetime import datetime, timezone
from config.database import get_db
import bcrypt


def create_user(email: str, password: str, is_admin: bool = False) -> dict:
    db            = get_db()
    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = {
        "email":         email.lower().strip(),
        "password_hash": password_hash,
        "is_admin":      is_admin,
        "created_at":    datetime.now(timezone.utc),
    }
    result      = db.users.insert_one(user)
    user["_id"] = result.inserted_id
    return user


def find_user_by_email(email: str) -> dict | None:
    return get_db().users.find_one({"email": email.lower().strip()})


def find_user_by_id(user_id: str) -> dict | None:
    from bson import ObjectId
    try:
        return get_db().users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


def verify_password(user: dict, password: str) -> bool:
    return bcrypt.checkpw(password.encode(), user["password_hash"].encode())


def email_exists(email: str) -> bool:
    return find_user_by_email(email) is not None


def set_admin(email: str, is_admin: bool) -> bool:
    """Promote or demote a user to/from admin."""
    result = get_db().users.update_one(
        {"email": email.lower().strip()},
        {"$set": {"is_admin": is_admin}}
    )
    return result.modified_count > 0


def list_users() -> list:
    """List all users (admin only)."""
    users = get_db().users.find({}, {"password_hash": 0})
    return [
        {
            "_id":        str(u["_id"]),
            "email":      u["email"],
            "is_admin":   u.get("is_admin", False),
            "created_at": u["created_at"].isoformat(),
        }
        for u in users
    ]