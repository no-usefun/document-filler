import base64
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user_model import find_user_by_id
from config.database import get_db
from datetime import datetime, timezone
from bson import ObjectId

images_bp = Blueprint("images", __name__)

VALID_FOLDERS = {"sonauli", "raxaul", "general"}


def _require_admin():
    user_id = get_jwt_identity()
    user    = find_user_by_id(user_id)
    if not user or not user.get("is_admin", False):
        return None, (jsonify(message="Admin access required."), 403)
    return user, None


def _serialize(doc):
    doc["_id"] = str(doc["_id"])
    for k, v in doc.items():
        if isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc


# ── List images (optionally by folder) ────────────────────────────────────

@images_bp.get("/")
@jwt_required()
def list_images():
    """GET /api/images/?folder=sonauli  — list all or by folder"""
    folder = request.args.get("folder", "").strip().lower()
    query  = {}
    if folder and folder in VALID_FOLDERS:
        query["folder"] = folder

    docs = list(get_db().images.find(query).sort("uploaded_at", -1))
    return jsonify(images=[_serialize(d) for d in docs]), 200


# ── Get single image with data ─────────────────────────────────────────────

@images_bp.get("/<image_id>")
@jwt_required()
def get_image(image_id):
    try:
        doc = get_db().images.find_one({"_id": ObjectId(image_id)})
    except Exception:
        return jsonify(message="Invalid image ID."), 400
    if not doc:
        return jsonify(message="Image not found."), 404
    return jsonify(_serialize(doc)), 200


# ── Upload image (admin only) ──────────────────────────────────────────────

@images_bp.post("/upload")
@jwt_required()
def upload_image():
    _, err = _require_admin()
    if err: return err

    if "file" not in request.files:
        return jsonify(message="No file provided."), 400

    file   = request.files["file"]
    folder = request.form.get("folder", "general").lower().strip()
    label  = request.form.get("label", file.filename).strip()

    if folder not in VALID_FOLDERS:
        folder = "general"

    if not file.content_type.startswith("image/"):
        return jsonify(message="Only image files are accepted."), 400

    raw_bytes = file.read()
    if len(raw_bytes) > 10 * 1024 * 1024:   # 10 MB limit
        return jsonify(message="Image too large. Max 10 MB."), 400

    data_b64   = base64.b64encode(raw_bytes).decode("utf-8")
    user_id    = get_jwt_identity()
    user       = find_user_by_id(user_id)

    doc = {
        "filename":    file.filename,
        "label":       label,
        "folder":      folder,
        "mime_type":   file.content_type,
        "data":        data_b64,
        "size_bytes":  len(raw_bytes),
        "uploaded_by": user.get("email", "admin"),
        "uploaded_at": datetime.now(timezone.utc),
    }

    result = get_db().images.insert_one(doc)
    return jsonify(
        message  = "Uploaded.",
        image_id = str(result.inserted_id),
        filename = file.filename,
        folder   = folder,
        label    = label,
    ), 201


# ── Delete image (admin only) ──────────────────────────────────────────────

@images_bp.delete("/<image_id>")
@jwt_required()
def delete_image(image_id):
    _, err = _require_admin()
    if err: return err

    try:
        result = get_db().images.delete_one({"_id": ObjectId(image_id)})
    except Exception:
        return jsonify(message="Invalid image ID."), 400

    if result.deleted_count == 0:
        return jsonify(message="Image not found."), 404

    return jsonify(message="Deleted."), 200


# ── Update label (admin only) ──────────────────────────────────────────────

@images_bp.patch("/<image_id>")
@jwt_required()
def update_image(image_id):
    _, err = _require_admin()
    if err: return err

    data   = request.get_json(silent=True) or {}
    label  = data.get("label", "").strip()
    folder = data.get("folder", "").strip().lower()

    updates = {}
    if label:  updates["label"]  = label
    if folder and folder in VALID_FOLDERS:
        updates["folder"] = folder

    if not updates:
        return jsonify(message="Nothing to update."), 400

    try:
        get_db().images.update_one({"_id": ObjectId(image_id)}, {"$set": updates})
    except Exception:
        return jsonify(message="Invalid image ID."), 400

    return jsonify(message="Updated."), 200