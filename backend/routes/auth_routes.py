from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user_model import create_user, find_user_by_email, verify_password, email_exists

auth_bp = Blueprint("auth", __name__)


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

    create_user(email, password)
    return jsonify(message="Account created successfully."), 201


@auth_bp.post("/login")
def login():
    data     = request.get_json(silent=True) or {}
    email    = data.get("email", "").strip()
    password = data.get("password", "")

    user = find_user_by_email(email)
    if not user or not verify_password(user, password):
        return jsonify(message="Invalid email or password."), 401

    token = create_access_token(identity=str(user["_id"]))
    return jsonify(access_token=token), 200