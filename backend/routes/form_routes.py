from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.document_model import get_form_data, upsert_form_data

form_bp = Blueprint("forms", __name__)

VALID_FORMS = {"form1", "form2", "form3", "form4"}


@form_bp.get("/forms/<document_id>/<form_type>")
@jwt_required()
def get_form(document_id, form_type):
    """
    GET /api/forms/<document_id>/<form_type>
    Returns saved field overrides for a specific form.
    Returns empty dict if the form has never been saved.
    """
    if form_type not in VALID_FORMS:
        return jsonify(message="Invalid form type. Must be form1–form4."), 400

    row = get_form_data(document_id, form_type)
    if not row:
        return jsonify(fields={}), 200

    return jsonify(fields=row.get("fields", {})), 200


@form_bp.put("/forms/update")
@jwt_required()
def update_form():
    """
    PUT /api/forms/update
    Body: { document_id, form_type, fields: {} }
    Saves user-edited fields for a specific form (upsert).
    """
    data        = request.get_json(silent=True) or {}
    document_id = data.get("document_id", "").strip()
    form_type   = data.get("form_type",   "").strip()
    fields      = data.get("fields",      {})

    if not document_id or not form_type:
        return jsonify(message="document_id and form_type are required."), 400
    if form_type not in VALID_FORMS:
        return jsonify(message="Invalid form type. Must be form1–form4."), 400
    if not isinstance(fields, dict):
        return jsonify(message="fields must be a JSON object."), 400

    upsert_form_data(document_id, form_type, fields)
    return jsonify(message="Saved."), 200