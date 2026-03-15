from datetime import datetime, timezone
from bson import ObjectId
from config.database import get_db


# ── Documents ──────────────────────────────────────────────────────────────

def create_document(user_id: str, xml_filename: str, parsed_data: dict) -> dict:
    db  = get_db()
    doc = {
        "user_id":        user_id,
        "xml_filename":   xml_filename,
        "voucher_number": parsed_data.get("voucherNumber", "UNKNOWN"),
        "parsed_data":    parsed_data,
        "created_at":     datetime.now(timezone.utc),
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
    docs = get_db().documents.find(
        {"user_id": user_id},
        {"parsed_data": 0}
    ).sort("created_at", -1)
    return [_serialize(d) for d in docs]


# ── Form Data (user edits) ─────────────────────────────────────────────────

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


# ── PDF History — metadata only, NO binary storage ────────────────────────

def record_pdf_generation(document_id: str, voucher_number: str,
                           form_type: str, user_id: str) -> None:
    """
    Record that a PDF was generated for this document+form.
    Stores only metadata — NO PDF bytes. PDF is regenerated on download.
    """
    get_db().pdf_history.update_one(
        {"document_id": document_id, "form_type": form_type},
        {"$set": {
            "document_id":    document_id,
            "user_id":        user_id,
            "voucher_number": voucher_number,
            "folder":         _safe_folder(voucher_number),
            "form_type":      form_type,
            "filename":       f"{form_type}_{_safe_folder(voucher_number)}.pdf",
            "generated_at":   datetime.now(timezone.utc),
        }},
        upsert=True,
    )


def list_all_pdf_history(user_id: str) -> list:
    """
    All PDF generation records for a user, grouped by voucher_number.
    Returns: [{ voucher_number, folder, document_id, forms: [...] }]
    """
    records = list(
        get_db().pdf_history
        .find({"user_id": user_id})
        .sort("generated_at", -1)
    )

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
            "generated_at": r["generated_at"].isoformat(),
        })

    return list(groups.values())


def get_pdf_record(document_id: str, form_type: str) -> dict | None:
    return get_db().pdf_history.find_one({
        "document_id": document_id,
        "form_type":   form_type,
    })


# ── Helpers ────────────────────────────────────────────────────────────────

def _safe_folder(voucher_number: str) -> str:
    return voucher_number.replace('/', '-').replace(' ', '_').strip()


def _serialize(doc: dict) -> dict:
    doc["_id"] = str(doc["_id"])
    for key, val in doc.items():
        if isinstance(val, datetime):
            doc[key] = val.isoformat()
    return doc


def delete_pdf_record(document_id: str, form_type: str, user_id: str) -> bool:
    """Delete a single PDF history record (one form from one voucher)."""
    result = get_db().pdf_history.delete_one({
        "document_id": document_id,
        "form_type":   form_type,
        "user_id":     user_id,
    })
    return result.deleted_count > 0


def delete_voucher_history(document_id: str, user_id: str) -> int:
    """Delete all PDF history records for an entire voucher/document."""
    result = get_db().pdf_history.delete_many({
        "document_id": document_id,
        "user_id":     user_id,
    })
    return result.deleted_count


def clear_all_history(user_id: str) -> int:
    """Delete all PDF history for a user."""
    result = get_db().pdf_history.delete_many({"user_id": user_id})
    return result.deleted_count