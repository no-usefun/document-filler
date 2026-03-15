from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from models.user_model import (
    create_user, find_user_by_email, find_user_by_id,
    verify_password, email_exists, set_admin, list_users
)

auth_bp = Blueprint("auth", __name__)


def _require_admin():
    """Return the current user if admin, else return a 403 response tuple."""
    user_id = get_jwt_identity()
    user    = find_user_by_id(user_id)
    if not user or not user.get("is_admin", False):
        return None, (jsonify(message="Admin access required."), 403)
    return user, None


# ── Register ──────────────────────────────────────────────────────────────

@auth_bp.post("/register")
def register():
    data     = request.get_json(silent=True) or {}
    email    = data.get("email", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify(message="Email and password are required."), 400
    if len(password) < 6:
        return jsonify(message="Password must be at least 6 characters."), 400
    if email_exists(email):
        return jsonify(message="An account with this email already exists."), 409

    # First registered user automatically becomes admin
    from config.database import get_db
    is_first = get_db().users.count_documents({}) == 0

    create_user(email, password, is_admin=is_first)
    msg = "Account created. You are the admin." if is_first else "Account created successfully."
    return jsonify(message=msg, is_admin=is_first), 201


# ── Login ─────────────────────────────────────────────────────────────────

@auth_bp.post("/login")
def login():
    data     = request.get_json(silent=True) or {}
    email    = data.get("email", "").strip()
    password = data.get("password", "")

    user = find_user_by_email(email)
    if not user or not verify_password(user, password):
        return jsonify(message="Invalid email or password."), 401

    token    = create_access_token(identity=str(user["_id"]))
    is_admin = user.get("is_admin", False)

    return jsonify(
        access_token = token,
        is_admin     = is_admin,
        email        = user["email"],
    ), 200


# ── Get current user ──────────────────────────────────────────────────────

@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user    = find_user_by_id(user_id)
    if not user:
        return jsonify(message="User not found."), 404
    return jsonify(
        email    = user["email"],
        is_admin = user.get("is_admin", False),
    ), 200


# ── Admin: list users ─────────────────────────────────────────────────────

@auth_bp.get("/users")
@jwt_required()
def get_users():
    _, err = _require_admin()
    if err: return err
    return jsonify(users=list_users()), 200


# ── Admin: promote/demote user ────────────────────────────────────────────

@auth_bp.post("/users/set-admin")
@jwt_required()
def set_user_admin():
    _, err = _require_admin()
    if err: return err

    data     = request.get_json(silent=True) or {}
    email    = data.get("email", "").strip()
    is_admin = data.get("is_admin", False)

    if not email:
        return jsonify(message="Email is required."), 400

    updated = set_admin(email, is_admin)
    if not updated:
        return jsonify(message="User not found."), 404

    action = "promoted to admin" if is_admin else "demoted to regular user"
    return jsonify(message=f"{email} {action}."), 200