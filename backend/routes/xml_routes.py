from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.xml_parser import parse_xml
from models.document_model import create_document

xml_bp = Blueprint("xml", __name__)


@xml_bp.post("/upload")
@jwt_required()
def upload_xml():
    if "file" not in request.files:
        return jsonify(message="No file provided."), 400

    file = request.files["file"]

    if not file.filename or not file.filename.endswith(".xml"):
        return jsonify(message="Only .xml files are accepted."), 400

    xml_bytes = file.read()
    if not xml_bytes:
        return jsonify(message="File is empty."), 400

    try:
        parsed_data = parse_xml(xml_bytes)
    except Exception as e:
        return jsonify(message=f"XML parsing failed: {str(e)}"), 422

    user_id = get_jwt_identity()
    doc     = create_document(
        user_id      = user_id,
        xml_filename = file.filename,
        parsed_data  = parsed_data,
    )

    return jsonify(document_id=str(doc["_id"])), 201