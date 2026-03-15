import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from routes.auth_routes      import auth_bp
from routes.xml_routes       import xml_bp
from routes.documents_routes import documents_bp
from routes.form_routes      import form_bp
from routes.pdf_routes       import pdf_bp

load_dotenv()

app = Flask(__name__)

# ── Config ─────────────────────────────────────────────────────────────────
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")

# ── Extensions ─────────────────────────────────────────────────────────────
CORS(app, origins=["http://localhost:5173"])
JWTManager(app)

# ── Blueprints ─────────────────────────────────────────────────────────────
# POST /api/auth/register
# POST /api/auth/login
app.register_blueprint(auth_bp,      url_prefix="/api/auth")

# POST /api/xml/upload
app.register_blueprint(xml_bp,       url_prefix="/api/xml")

# GET  /api/documents/<document_id>
app.register_blueprint(documents_bp, url_prefix="/api/documents")

# GET  /api/forms/<document_id>/<form_type>
# PUT  /api/forms/update
app.register_blueprint(form_bp,      url_prefix="/api")

# POST /api/pdf/generate
app.register_blueprint(pdf_bp,       url_prefix="/api/pdf")

# ── Health check ───────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG", "1") == "1", port=5000)