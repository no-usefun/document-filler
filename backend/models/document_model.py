from datetime import datetime, timezone
from bson import ObjectId
from config.database import get_db
import base64


# ── Documents ──────────────────────────────────────────────────────────────

def create_document(user_id: str, xml_filename: str, parsed_data: dict) -> dict:
    db  = get_db()
    doc = {
        "user_id":       user_id,
        "xml_filename":  xml_filename,
        "voucher_number": parsed_data.get("voucherNumber", "UNKNOWN"),
        "parsed_data":   parsed_data,
        "created_at":    datetime.now(timezone.utc),
    }
    result     = db.documents.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def get_document_by_id(document_id: str, user_id: str) -> dict | None:
    try:
        return get_db().documents.find_one({
            "_id":     ObjectId(document_id),
            "user_id": user_id,
        })
    except Exception:
        return None


def list_documents(user_id: str) -> list:
    """List all documents for a user, newest first."""
    docs = get_db().documents.find(
        {"user_id": user_id},
        {"parsed_data": 0}   # exclude heavy parsed_data from list view
    ).sort("created_at", -1)
    return [_serialize(d) for d in docs]


# ── Form Data ──────────────────────────────────────────────────────────────

def get_form_data(document_id: str, form_type: str) -> dict | None:
    return get_db().form_data.find_one({
        "document_id": document_id,
        "form_type":   form_type,
    })


def upsert_form_data(document_id: str, form_type: str, fields: dict) -> None:
    get_db().form_data.update_one(
        {"document_id": document_id, "form_type": form_type},
        {"$set": {
            "fields":     fields,
            "updated_at": datetime.now(timezone.utc),
        }},
        upsert=True,
    )


# ── PDF Storage ────────────────────────────────────────────────────────────

def save_pdf(document_id: str, voucher_number: str, form_type: str,
             pdf_bytes: bytes, user_id: str) -> dict:
    """
    Store a generated PDF in the pdf_history collection.
    Organised by voucher_number (acts as folder name).
    """
    db  = get_db()
    # Encode PDF as base64 for MongoDB storage
    pdf_b64 = base64.b64encode(pdf_bytes).decode('utf-8')

    record = {
        "document_id":    document_id,
        "user_id":        user_id,
        "voucher_number": voucher_number,          # e.g. "RKT/210/25-26"
        "folder":         _safe_folder(voucher_number),  # filesystem-safe version
        "form_type":      form_type,
        "filename":       f"{form_type}_{_safe_folder(voucher_number)}.pdf",
        "pdf_b64":        pdf_b64,
        "size_bytes":     len(pdf_bytes),
        "generated_at":   datetime.now(timezone.utc),
    }

    # Upsert — regenerating the same form replaces the old PDF
    db.pdf_history.update_one(
        {"document_id": document_id, "form_type": form_type},
        {"$set": record},
        upsert=True,
    )
    return record


def get_pdf(document_id: str, form_type: str) -> dict | None:
    """Retrieve a stored PDF record."""
    return get_db().pdf_history.find_one({
        "document_id": document_id,
        "form_type":   form_type,
    })


def list_pdfs_for_voucher(voucher_number: str, user_id: str) -> list:
    """Get all PDFs generated for a given voucher number."""
    records = get_db().pdf_history.find(
        {"voucher_number": voucher_number, "user_id": user_id},
        {"pdf_b64": 0}   # exclude binary from list
    ).sort("generated_at", -1)
    return [_serialize(r) for r in records]


def list_all_pdfs(user_id: str) -> list:
    """
    Get all PDF history for a user grouped by voucher_number.
    Returns list of {voucher_number, folder, forms: [...]}
    """
    records = list(get_db().pdf_history.find(
        {"user_id": user_id},
        {"pdf_b64": 0}
    ).sort("generated_at", -1))

    # Group by voucher_number
    groups: dict = {}
    for r in records:
        vn = r.get("voucher_number", "UNKNOWN")
        if vn not in groups:
            groups[vn] = {
                "voucher_number": vn,
                "folder":         r.get("folder", vn),
                "document_id":    r.get("document_id"),
                "forms":          [],
            }
        groups[vn]["forms"].append({
            "form_type":    r["form_type"],
            "filename":     r.get("filename", ""),
            "size_bytes":   r.get("size_bytes", 0),
            "generated_at": r["generated_at"].isoformat(),
        })

    return list(groups.values())


def _safe_folder(voucher_number: str) -> str:
    """Convert voucher number to a filesystem-safe string."""
    return voucher_number.replace('/', '-').replace(' ', '_').strip()


def _serialize(doc: dict) -> dict:
    """Convert MongoDB ObjectId and datetime to JSON-safe types."""
    doc["_id"] = str(doc["_id"])
    for key, val in doc.items():
        if isinstance(val, datetime):
            doc[key] = val.isoformat()
    return doc