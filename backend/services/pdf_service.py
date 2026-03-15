import os
from weasyprint import HTML, CSS
from jinja2 import Environment, FileSystemLoader, StrictUndefined

TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "templates")

# Use Undefined (not StrictUndefined) so missing vars render as empty string
_jinja = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    undefined=StrictUndefined,
    autoescape=False,
)
# Override to use non-strict so missing template vars = empty string
_jinja_safe = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=False,
)


def generate_pdf(form_type: str, fields: dict) -> bytes:
    """
    Render the HTML template for form_type with the given fields dict,
    then convert to PDF bytes using WeasyPrint.
    The fields dict is passed directly — all user edits are already merged in.
    """
    template_name = f"{form_type}.html"

    try:
        template = _jinja_safe.get_template(template_name)
    except Exception:
        raise ValueError(f"No PDF template found for form type: {form_type}")

    # Ensure items is always a list
    if "items" not in fields:
        fields = dict(fields)
        fields["items"] = []
    elif not isinstance(fields["items"], list):
        fields = dict(fields)
        fields["items"] = []

    # Render — pass entire fields dict as keyword args
    try:
        html_str = template.render(**fields)
    except Exception as e:
        raise RuntimeError(f"Template render error for {form_type}: {e}")

    # Convert to PDF
    try:
        pdf_bytes = HTML(
            string=html_str,
            base_url=TEMPLATE_DIR
        ).write_pdf(stylesheets=[CSS(string=_a4_css())])
    except Exception as e:
        raise RuntimeError(f"WeasyPrint error: {e}")

    return pdf_bytes


def _a4_css() -> str:
    return """
        @page {
            size: A4;
            margin: 15mm 20mm;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 12px;
            color: #000;
            line-height: 1.5;
        }
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: 6px 8px; border: 1px solid #000; font-size: 11px; }
        th { background: #f5f5f5; font-weight: bold; }
        pre { white-space: pre-wrap; font-family: inherit; }
    """