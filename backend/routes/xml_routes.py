from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.xml_parser import parse_xml
from models.document_model import create_document

xml_bp = Blueprint("xml", __name__)

# Border-specific field overrides
BORDER_FIELDS = {
    'sonauli': {
        'borderCommissioner': 'The Deputy Commissioner\nLCS SONAULI.',
        'borderAssistant':    'The Assistant Commissioner,\nLand Custom station\nSONAULI, U.P.',
        'borderLocation':     'LCS SONAULI, U.P.',
        'portOfDischarge':    'SONAULI BORDER.',
        'borderLabel':        'Sonauli Border',
    },
    'raxaul': {
        'borderCommissioner': 'The Deputy Commissioner\nLCS RAXAUL.',
        'borderAssistant':    'The Assistant Commissioner,\nLand Custom station\nRAXAUL, BIHAR.',
        'borderLocation':     'LCS RAXAUL, BIHAR.',
        'portOfDischarge':    'RAXAUL BORDER.',
        'borderLabel':        'Raxaul Border',
    },
}


@xml_bp.post("/upload")
@jwt_required()
def upload_xml():
    if "file" not in request.files:
        return jsonify(message="No file provided."), 400

    file   = request.files["file"]
    border = request.form.get("border", "sonauli").lower().strip()

    if not file.filename or not file.filename.endswith(".xml"):
        return jsonify(message="Only .xml files are accepted."), 400

    xml_bytes = file.read()
    if not xml_bytes:
        return jsonify(message="File is empty."), 400

    try:
        parsed_data = parse_xml(xml_bytes)
    except Exception as e:
        return jsonify(message=f"XML parsing failed: {str(e)}"), 422

    # Apply border-specific fields to parsed data
    if border in BORDER_FIELDS:
        parsed_data.update(BORDER_FIELDS[border])
        parsed_data['selectedBorder'] = border

    user_id = get_jwt_identity()
    doc     = create_document(
        user_id      = user_id,
        xml_filename = file.filename,
        parsed_data  = parsed_data,
    )

    return jsonify(document_id=str(doc["_id"])), 201