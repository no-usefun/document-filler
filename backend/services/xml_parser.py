import xml.etree.ElementTree as ET
from datetime import datetime
from collections import defaultdict
import re


def _sanitize_xml(xml_bytes: bytes) -> bytes:
    """
    Fix bare & characters in Tally XML exports before parsing.
    Replaces & not followed by a valid XML entity with &amp;
    """
    text = xml_bytes.decode('utf-8', errors='replace')
    # Replace & not already part of &amp; &lt; &gt; &apos; &quot; &#N; &#xN;
    text = re.sub(r'&(?!(amp|lt|gt|apos|quot|#\d+|#x[0-9a-fA-F]+);)', '&amp;', text)
    return text.encode('utf-8')


def parse_xml(xml_bytes: bytes) -> dict:
    """
    Parse Tally ERP ENVELOPE XML for R.K. Traders vouchers.
    """
    xml_bytes = _sanitize_xml(xml_bytes)
    root = ET.fromstring(xml_bytes)

    voucher = root.find('.//VOUCHER')
    if voucher is None:
        raise ValueError("No VOUCHER element found. Is this a Tally XML export?")

    def vtext(tag, default=''):
        el = voucher.find(tag)
        return el.text.strip() if el is not None and el.text else default

    # ── Company (consignor) ────────────────────────────────────────────────
    company_name = ''
    svc = root.find('.//SVCURRENTCOMPANY')
    if svc is not None and svc.text:
        raw = svc.text.strip()
        company_name = re.split(r'\s*-\s*\(from', raw)[0].strip()

    company_state = ''
    company_el = root.find('.//COMPANY/REMOTECMPINFO.LIST')
    if company_el is not None:
        s_el = company_el.find('REMOTECMPSTATE')
        if s_el is not None and s_el.text:
            company_state = s_el.text.strip()

    # Fixed R.K. Traders consignor details
    consignor_details = (
        "M/S. R.K. TRADERS\n"
        "219/B, OLD CHINA BAZAR STREET, 1ST FLOOR,\n"
        "ROOM NO. - 8, KOLKATA - 700 001. (W.B.)\n"
        "PAN # ACXPA0890P"
    )

    # ── Voucher number and serial no ───────────────────────────────────────
    voucher_number = vtext('VOUCHERNUMBER') or vtext('REFERENCE')

    # Extract serial: RKT/210/25-26 → "210/25-26" (everything after RKT/)
    serial_no = ''
    if voucher_number:
        prefix = 'RKT/'
        if voucher_number.upper().startswith(prefix.upper()):
            serial_no = voucher_number[len(prefix):]
        else:
            idx = voucher_number.find('/')
            serial_no = voucher_number[idx + 1:] if idx != -1 else voucher_number

    # ── Date ───────────────────────────────────────────────────────────────
    raw_date = vtext('DATE') or vtext('EFFECTIVEDATE')
    formatted_date = _format_date(raw_date)

    # ── Consignee address — exclude EMAIL and CELL NO lines ────────────────
    consignee_name = vtext('PARTYNAME') or vtext('BASICBUYERNAME')
    raw_addr_lines = [
        el.text.strip()
        for el in voucher.findall('.//BASICBUYERADDRESS.LIST/BASICBUYERADDRESS')
        if el.text and el.text.strip()
    ]
    filtered_addr = [
        line for line in raw_addr_lines
        if not re.search(r'(EMAIL|CELL\s*NO|@)', line, re.IGNORECASE)
    ]
    consignee_details = f"M/S. {consignee_name}\n" + '\n'.join(filtered_addr)

    # ── Items ──────────────────────────────────────────────────────────────
    items = []
    for inv in voucher.findall('ALLINVENTORYENTRIES.LIST'):
        name_el   = inv.find('STOCKITEMNAME')
        rate_el   = inv.find('RATE')
        amount_el = inv.find('AMOUNT')
        qty_el    = inv.find('BILLEDQTY')

        desc_parts = [
            d.text.strip()
            for d in inv.findall('.//BASICUSERDESCRIPTION.LIST/BASICUSERDESCRIPTION')
            if d.text and d.text.strip()
        ]
        name = name_el.text.strip() if name_el is not None and name_el.text else ''
        qty_raw = qty_el.text.strip() if qty_el is not None and qty_el.text else ''

        items.append({
            'name':        name,
            'description': ' | '.join(desc_parts) if desc_parts else name,
            'quantity':    qty_raw,
            'rate':        rate_el.text.strip()   if rate_el   is not None and rate_el.text   else '',
            'amount':      amount_el.text.strip() if amount_el is not None and amount_el.text else '',
        })

    # ── Total amount (party ledger, positive) ─────────────────────────────
    total_amount = ''
    for ledger in voucher.findall('LEDGERENTRIES.LIST'):
        is_party = ledger.find('ISPARTYLEDGER')
        if is_party is not None and is_party.text and is_party.text.strip() == 'Yes':
            amt_el = ledger.find('AMOUNT')
            if amt_el is not None and amt_el.text:
                total_amount = amt_el.text.strip().lstrip('-').strip()
            break

    # ── Quantity: group by unit, sum counts ────────────────────────────────
    quantity_field = _combine_quantities(items)

    # ── Value: total only ──────────────────────────────────────────────────
    value_field = f"IRs. {total_amount}/- only." if total_amount else ''

    # ── Place of despatch ──────────────────────────────────────────────────
    place_of_despatch = vtext('BASICPORTOFLOADING').rstrip('.')

    # ── Destination ────────────────────────────────────────────────────────
    destination = vtext('BASICFINALDESTINATION') or vtext('BASICDESTINATIONCOUNTRY')

    # ── Consignment note ───────────────────────────────────────────────────
    consignment_note = f"OUR TAX INVOICE NO.: - {voucher_number} DT. {formatted_date}."

    # ── Order info ─────────────────────────────────────────────────────────
    order_el   = voucher.find('.//INVOICEORDERLIST.LIST')
    order_date = order_no = ''
    if order_el is not None:
        od = order_el.find('BASICORDERDATE')
        on = order_el.find('BASICPURCHASEORDERNO')
        order_date = _format_date(od.text.strip()) if od is not None and od.text else ''
        order_no   = on.text.strip()               if on is not None and on.text else ''

    return {
        # Form 1 fields
        'serialNo':             serial_no,
        'consignorDetails':     consignor_details,
        'consigneeDetails':     consignee_details,
        'placeOfDespatch':      place_of_despatch,
        'destination':          destination,
        'descriptionOfGoods':   '',
        'quantity':             quantity_field,
        'valueRate':            value_field,
        'valueRate2':           value_field,
        'weight':               '',
        'consignmentNote':      consignment_note,
        'gstCertificateNumber': '',
        'consigneeGSTIN':       '19ACXPA0890P1ZS',

        # General
        'voucherNumber':        voucher_number,
        'invoiceDate':          formatted_date,
        'narration':            vtext('NARRATION'),
        'voucherType':          vtext('VOUCHERTYPENAME'),

        # Consignor
        'consignor':            company_name,
        'consignorAddress':     consignor_details,
        'consignorState':       company_state,
        'dispatchLocation':     place_of_despatch,

        # Consignee
        'consignee':            consignee_name,
        'consigneeAddress':     '\n'.join(filtered_addr),
        'destinationCountry':   vtext('BASICDESTINATIONCOUNTRY'),

        # Transport
        'shippedBy':            vtext('BASICSHIPPEDBY') or vtext('BASICSHIPVESSELNO'),
        'portOfLoading':        vtext('BASICPORTOFLOADING'),
        'portOfDischarge':      vtext('BASICPORTOFDISCHARGE'),
        'finalDestination':     vtext('BASICFINALDESTINATION'),
        'orderTerms':           _multi_text(voucher, 'BASICORDERTERMS.LIST', 'BASICORDERTERMS'),
        'countryOfResidence':   vtext('COUNTRYOFRESIDENCE'),

        # Order
        'poNumber':             order_no,
        'poDate':               order_date,
        'dueDate':              vtext('BASICDUEDATEOFPYMT'),

        # Financial
        'totalAmount':          total_amount,
        'totalPackages':        '',

        # Items
        'items': items,
    }


def _combine_quantities(items: list) -> str:
    """
    Group item quantities by unit and sum numeric parts.
    e.g. "4 Set", "6 NOS.", "1 NOS." → "4 Set., 7 NOS."
    """
    unit_totals = defaultdict(float)
    unit_order  = []

    for item in items:
        qty_raw = item.get('quantity', '').strip()
        if not qty_raw:
            continue
        match = re.match(r'^\s*([\d.]+)\s+(.+?)\s*\.?\s*$', qty_raw)
        if match:
            num  = float(match.group(1))
            unit = match.group(2).strip().upper().rstrip('.')
            if unit not in unit_order:
                unit_order.append(unit)
            unit_totals[unit] += num
        else:
            if qty_raw not in unit_order:
                unit_order.append(qty_raw)

    parts = []
    for unit in unit_order:
        total = unit_totals[unit]
        num_str = str(int(total)) if total == int(total) else str(total)
        parts.append(f"{num_str} {unit}.")

    return ', '.join(parts)


def _multi_text(voucher, list_tag, item_tag):
    parts = []
    container = voucher.find(list_tag)
    if container is not None:
        for el in container.findall(item_tag):
            if el.text and el.text.strip():
                parts.append(el.text.strip())
    return '\n'.join(parts)


def _format_date(raw: str) -> str:
    """Convert Tally YYYYMMDD to DD-MM-YYYY."""
    if not raw:
        return ''
    raw = raw.strip()
    if len(raw) == 8 and raw.isdigit():
        try:
            return datetime.strptime(raw, '%Y%m%d').strftime('%d-%m-%Y')
        except ValueError:
            pass
    return raw