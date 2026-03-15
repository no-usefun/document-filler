from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.document_model import get_form_data, upsert_form_data

form_bp = Blueprint("forms", __name__)

VALID_FORMS = {"form1", "form2", "form3", "form4", "form5"}


@form_bp.get("/forms/<document_id>/<form_type>")
@jwt_required()
def get_form(document_id, form_type):
    if form_type not in VALID_FORMS:
        return jsonify(message=f"Invalid form type '{form_type}'."), 400

    row = get_form_data(document_id, form_type)
    if not row:
        return jsonify(fields={}), 200

    return jsonify(fields=row.get("fields", {})), 200


@form_bp.put("/forms/update")
@jwt_required()
def update_form():
    # Accept both JSON and multipart
    data = request.get_json(force=True, silent=True)

    if data is None:
        print("ERROR: Could not parse JSON body")
        print("Content-Type:", request.content_type)
        print("Raw data:", request.data[:200])
        return jsonify(message="Invalid JSON body."), 400

    document_id = data.get("document_id", "").strip()
    form_type   = data.get("form_type",   "").strip()
    fields      = data.get("fields",      None)

    print(f"UPDATE FORM: doc={document_id} form={form_type} fields_keys={list(fields.keys()) if isinstance(fields, dict) else type(fields)}")

    if not document_id:
        return jsonify(message="document_id is required."), 400
    if not form_type:
        return jsonify(message="form_type is required."), 400
    if form_type not in VALID_FORMS:
        return jsonify(message=f"Invalid form type '{form_type}'. Must be one of: {', '.join(sorted(VALID_FORMS))}"), 400
    if fields is None:
        return jsonify(message="fields is required."), 400
    if not isinstance(fields, dict):
        return jsonify(message=f"fields must be a JSON object, got {type(fields).__name__}."), 400

    upsert_form_data(document_id, form_type, fields)
    return jsonify(message="Saved."), 200