import os
import sys
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

# Ensure backend directory is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

app = Flask(__name__)

# ── Config ─────────────────────────────────────────────────────────────────
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")

# ── CORS ───────────────────────────────────────────────────────────────────
CORS(app,
     origins="*",
     supports_credentials=False,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)

# ── JWT ────────────────────────────────────────────────────────────────────
JWTManager(app)

# ── Handle OPTIONS preflight for all routes ────────────────────────────────
@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        res = Response()
        res.headers["Access-Control-Allow-Origin"]  = "*"
        res.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        res.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return res

# ── Blueprints ─────────────────────────────────────────────────────────────
try:
    from routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    print("✓ auth_routes loaded")
except Exception as e:
    print(f"✗ auth_routes failed: {e}")

try:
    from routes.xml_routes import xml_bp
    app.register_blueprint(xml_bp, url_prefix="/api/xml")
    print("✓ xml_routes loaded")
except Exception as e:
    print(f"✗ xml_routes failed: {e}")

try:
    from routes.documents_routes import documents_bp
    app.register_blueprint(documents_bp, url_prefix="/api/documents")
    print("✓ documents_routes loaded")
except Exception as e:
    print(f"✗ documents_routes failed: {e}")

try:
    from routes.form_routes import form_bp
    app.register_blueprint(form_bp, url_prefix="/api")
    print("✓ form_routes loaded")
except Exception as e:
    print(f"✗ form_routes failed: {e}")

try:
    from routes.pdf_routes import pdf_bp
    app.register_blueprint(pdf_bp, url_prefix="/api/pdf")
    print("✓ pdf_routes loaded")
except Exception as e:
    print(f"✗ pdf_routes failed: {e}")

try:
    from routes.images_routes import images_bp
    app.register_blueprint(images_bp, url_prefix="/api/images")
    print("✓ images_routes loaded")
except Exception as e:
    print(f"✗ images_routes failed: {e}")

# ── Health check ───────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return jsonify(status="ok", message="Backend is running")

@app.get("/")
def root():
    return jsonify(status="ok", message="Flask backend. Use /api/health to check.")

# ── Error handlers ─────────────────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify(message=f"Route not found: {request.path}"), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify(message=f"Server error: {str(e)}"), 500

# ── Run ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n=== Starting XML→PDF Backend ===")
    print(f"Working directory: {os.getcwd()}")
    app.run(
        debug=os.getenv("FLASK_DEBUG", "1") == "1",
        port=int(os.getenv("PORT", 5000)),
        host="0.0.0.0"
    )