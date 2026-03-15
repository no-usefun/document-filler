import io
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.document_model import (
    get_document_by_id, get_form_data,
    record_pdf_generation, list_all_pdf_history, get_pdf_record
)
from services.pdf_service import generate_pdf

pdf_bp = Blueprint("pdf", __name__)

VALID_FORMS = {"form1", "form2", "form3", "form4", "form5"}


def _build_fields(doc: dict, document_id: str, form_type: str) -> dict:
    """
    Merge parsed XML data with user-saved edits.
    Saved edits always win. Items list preserved from saved if present.
    No PDF bytes — just the data needed to render.
    """
    base   = dict(doc.get("parsed_data", {}))
    saved  = get_form_data(document_id, form_type)
    edits  = saved.get("fields", {}) if saved else {}

    merged = {**base, **edits}

    # Keep items from edits if user updated them, else fall back to parsed
    if "items" not in edits and "items" in base:
        merged["items"] = base["items"]

    # Always ensure items is a list
    if not isinstance(merged.get("items"), list):
        merged["items"] = []

    return merged


@pdf_bp.post("/generate")
@jwt_required()
def generate():
    """
    POST /api/pdf/generate
    Body: { document_id, form_type }
    Generates PDF from merged data, returns file for download.
    Records metadata in MongoDB — NO PDF bytes stored.
    """
    data        = request.get_json(silent=True) or {}
    document_id = data.get("document_id", "").strip()
    form_type   = data.get("form_type",   "").strip()

    if not document_id or not form_type:
        return jsonify(message="document_id and form_type are required."), 400
    if form_type not in VALID_FORMS:
        return jsonify(message=f"Invalid form type '{form_type}'."), 400

    user_id = get_jwt_identity()
    doc     = get_document_by_id(document_id, user_id)
    if not doc:
        return jsonify(message="Document not found."), 404

    merged = _build_fields(doc, document_id, form_type)

    try:
        pdf_bytes = generate_pdf(form_type, merged)
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify(message=f"PDF generation error: {str(e)}"), 500

    # Record metadata only — no PDF bytes in DB
    voucher_number = doc.get("voucher_number", document_id[:8])
    record_pdf_generation(
        document_id    = document_id,
        voucher_number = voucher_number,
        form_type      = form_type,
        user_id        = user_id,
    )

    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype      = "application/pdf",
        as_attachment = True,
        download_name = f"{form_type}_{voucher_number.replace('/', '-')}.pdf",
    )


@pdf_bp.get("/history")
@jwt_required()
def history():
    """
    GET /api/pdf/history
    Returns all PDF generation records grouped by voucher_number.
    No binary data — just metadata.
    """
    user_id = get_jwt_identity()
    return jsonify(history=list_all_pdf_history(user_id)), 200


@pdf_bp.get("/download/<document_id>/<form_type>")
@jwt_required()
def download_stored(document_id: str, form_type: str):
    """
    GET /api/pdf/download/<document_id>/<form_type>
    Re-generates the PDF on the fly using the current saved field data.
    No stored binary — regenerated fresh each time from MongoDB fields.
    """
    if form_type not in VALID_FORMS:
        return jsonify(message="Invalid form type."), 400

    user_id = get_jwt_identity()
    doc     = get_document_by_id(document_id, user_id)
    if not doc:
        return jsonify(message="Document not found."), 404

    # Check it was previously generated
    record = get_pdf_record(document_id, form_type)
    if not record:
        return jsonify(message="No generation record found. Generate it first."), 404

    # Regenerate from current saved data
    merged = _build_fields(doc, document_id, form_type)

    try:
        pdf_bytes = generate_pdf(form_type, merged)
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify(message=f"PDF regeneration error: {str(e)}"), 500

    filename = record.get("filename", f"{form_type}.pdf")
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype      = "application/pdf",
        as_attachment = True,
        download_name = filename,
    )