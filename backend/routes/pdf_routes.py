import io
import base64
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.document_model import (
    get_document_by_id, get_form_data, save_pdf,
    get_pdf, list_pdfs_for_voucher, list_all_pdfs
)
from services.pdf_service import generate_pdf
from services.data_mapper import map_for_form, merge_with_overrides

pdf_bp = Blueprint("pdf", __name__)

VALID_FORMS = {"form1", "form2", "form3", "form4", "form5"}


@pdf_bp.post("/generate")
@jwt_required()
def generate():
    """
    POST /api/pdf/generate
    Body: { document_id, form_type }
    Generates PDF, stores it in MongoDB under voucher_number, returns the file.
    """
    data        = request.get_json(silent=True) or {}
    document_id = data.get("document_id", "").strip()
    form_type   = data.get("form_type",   "").strip()

    if not document_id or not form_type:
        return jsonify(message="document_id and form_type are required."), 400
    if form_type not in VALID_FORMS:
        return jsonify(message="Invalid form type."), 400

    user_id = get_jwt_identity()
    doc     = get_document_by_id(document_id, user_id)
    if not doc:
        return jsonify(message="Document not found."), 404

    base_fields  = map_for_form(doc.get("parsed_data", {}), form_type)
    saved        = get_form_data(document_id, form_type)
    saved_fields = saved.get("fields", {}) if saved else {}
    merged       = merge_with_overrides(base_fields, saved_fields)

    try:
        pdf_bytes = generate_pdf(form_type, merged)
    except ValueError as e:
        return jsonify(message=str(e)), 400
    except Exception as e:
        return jsonify(message=f"PDF generation error: {str(e)}"), 500

    # Store PDF in database under voucher_number folder
    voucher_number = doc.get("voucher_number", document_id[:8])
    save_pdf(
        document_id    = document_id,
        voucher_number = voucher_number,
        form_type      = form_type,
        pdf_bytes      = pdf_bytes,
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
    Returns all generated PDFs grouped by voucher_number (folder).
    """
    user_id = get_jwt_identity()
    return jsonify(history=list_all_pdfs(user_id)), 200


@pdf_bp.get("/history/<voucher_folder>")
@jwt_required()
def history_for_voucher(voucher_folder: str):
    """
    GET /api/pdf/history/<voucher_folder>
    Returns all PDFs for a specific voucher number folder.
    """
    user_id = get_jwt_identity()
    # Convert folder name back to voucher number (replace - with /)
    voucher_number = voucher_folder.replace('-', '/')
    records = list_pdfs_for_voucher(voucher_number, user_id)
    return jsonify(voucher_number=voucher_number, pdfs=records), 200


@pdf_bp.get("/download/<document_id>/<form_type>")
@jwt_required()
def download_stored(document_id: str, form_type: str):
    """
    GET /api/pdf/download/<document_id>/<form_type>
    Re-download a previously generated PDF from the database.
    """
    user_id = get_jwt_identity()

    # Verify document ownership
    doc = get_document_by_id(document_id, user_id)
    if not doc:
        return jsonify(message="Document not found."), 404

    record = get_pdf(document_id, form_type)
    if not record:
        return jsonify(message="No PDF found. Generate it first."), 404

    pdf_bytes = base64.b64decode(record["pdf_b64"])

    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype      = "application/pdf",
        as_attachment = True,
        download_name = record.get("filename", f"{form_type}.pdf"),
    )