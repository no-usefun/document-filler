from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.document_model import get_document_by_id, list_documents

documents_bp = Blueprint("documents", __name__)


@documents_bp.get("/")
@jwt_required()
def list_docs():
    """GET /api/documents/ — list all documents for the current user."""
    user_id = get_jwt_identity()
    return jsonify(documents=list_documents(user_id)), 200


@documents_bp.get("/<document_id>")
@jwt_required()
def get_document(document_id):
    """GET /api/documents/<document_id> — get parsed data for one document."""
    user_id = get_jwt_identity()
    doc     = get_document_by_id(document_id, user_id)
    if not doc:
        return jsonify(message="Document not found."), 404
    return jsonify(
        document_id    = str(doc["_id"]),
        xml_filename   = doc.get("xml_filename", ""),
        voucher_number = doc.get("voucher_number", ""),
        parsed_data    = doc.get("parsed_data", {}),
        created_at     = doc["created_at"].isoformat(),
    ), 200