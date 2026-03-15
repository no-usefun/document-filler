import os
from weasyprint import HTML, CSS
from jinja2 import Environment, FileSystemLoader

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")
_jinja       = Environment(loader=FileSystemLoader(TEMPLATE_DIR))


def generate_pdf(form_type: str, fields: dict) -> bytes:
    """
    Render the HTML template for form_type with fields,
    then convert to PDF bytes using WeasyPrint.
    """
    try:
        template = _jinja.get_template(f"{form_type}.html")
    except Exception:
        raise ValueError(f"No PDF template found for form type: {form_type}")

    html_str  = template.render(**fields, items=fields.get("items", []))
    pdf_bytes = HTML(string=html_str, base_url=TEMPLATE_DIR).write_pdf(
        stylesheets=[CSS(string=_a4_base_css())]
    )
    return pdf_bytes


def _a4_base_css() -> str:
    return """
        @page {
            size: A4;
            margin: 20mm 24mm;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 11px;
            color: #111;
            line-height: 1.5;
        }
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: 6px 8px; border: 1px solid #ddd; font-size: 10px; }
        th {
            background: #f5f5f5;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
    """