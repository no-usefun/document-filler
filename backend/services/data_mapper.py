"""
data_mapper.py  —  Maps Tally ERP parsed fields to per-form subsets.
"""

FORM_FIELD_MAP = {
    # WB GST Declaration
    "form1": [
        "serialNo", "consignorDetails", "consigneeDetails",
        "placeOfDespatch", "destination", "descriptionOfGoods",
        "quantity", "valueRate", "valueRate2", "weight",
        "consignmentNote", "gstCertificateNumber", "consigneeGSTIN",
        "invoiceDate", "voucherNumber", "consignor",
    ],
    # SCOMET letter
    "form2": [
        "voucherNumber", "invoiceDate", "consignor",
        "consignee", "consigneeAddress", "destination",
    ],
    # KYC form — static, no fields needed from XML
    "form3": [],
    # Clearing Agent Authorization
    "form4": [
        "voucherNumber", "invoiceDate",
        "consignee", "consigneeAddress",
        "quantity", "descriptionOfGoods",
        "portOfDischarge", "finalDestination",
    ],
    # Packing Details
    "form5": [
        "voucherNumber", "invoiceDate",
        "consignee", "consigneeAddress",
        "totalAmount", "totalPackages",
        "descriptionOfGoods", "quantity",
        "items",
    ],
}


def map_for_form(parsed_data: dict, form_type: str) -> dict:
    """Return only the fields relevant to the given form type."""
    fields = FORM_FIELD_MAP.get(form_type)
    if fields is None:
        return parsed_data
    if not fields:               # form3 — static, return empty
        return {}
    return {key: parsed_data[key] for key in fields if key in parsed_data}


def merge_with_overrides(base: dict, overrides: dict) -> dict:
    """Merge base parsed data with user-saved edits. Overrides always win."""
    merged = {**base, **overrides}
    if "items" not in overrides and "items" in base:
        merged["items"] = base["items"]
    return merged