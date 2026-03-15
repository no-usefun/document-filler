// Form 5 — Packing Details
// Packages section is fully editable
// totalQty and totalWeight are shared with other forms via onChange

import { useRef, useEffect } from 'react'

function AFInput({ value, onChange, width, minFont = 10, maxFont = 14,
                   readOnly = false, bold = false, underline = false, iStyle = {} }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.fontSize = `${maxFont}px`
    let size = maxFont
    while (el.scrollWidth > el.clientWidth && size > minFont) {
      size -= 0.5
      el.style.fontSize = `${size}px`
    }
  }, [value, maxFont, minFont])

  return (
    <input ref={ref} value={value}
      onChange={e => !readOnly && onChange(e.target.value)}
      readOnly={readOnly}
      style={{
        width, border: 'none', borderBottom: '1px solid #000', outline: 'none',
        background: 'transparent', fontFamily: 'Arial, sans-serif',
        fontSize: maxFont, fontWeight: bold ? 'bold' : 'normal',
        textDecoration: underline ? 'underline' : 'none',
        color: '#000', display: 'inline-block', padding: '1px 3px',
        boxSizing: 'border-box', overflow: 'hidden', whiteSpace: 'nowrap',
        verticalAlign: 'middle', ...iStyle,
      }}
    />
  )
}

// Editable item row — package description, sub-description
function ItemRow({ item, index, onChange, readOnly }) {
  function update(key, val) {
    onChange({ ...item, [key]: val })
  }

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Main row: 01.) [qty] – [name] */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 'bold', fontSize: 14 }}>
        <span style={{ flexShrink: 0 }}>{String(index + 1).padStart(2, '0')}.)</span>
        <AFInput value={item.quantity || ''} onChange={v => update('quantity', v)}
          width={80} readOnly={readOnly} bold />
        <span style={{ flexShrink: 0 }}> – </span>
        <AFInput value={item.name || ''} onChange={v => update('name', v)}
          width={340} readOnly={readOnly} bold />
      </div>
      {/* Sub-description row */}
      <div style={{ marginLeft: 36, marginTop: 2 }}>
        <input
          value={item.description || ''}
          onChange={e => !readOnly && update('description', e.target.value)}
          readOnly={readOnly}
          placeholder="Sub-description (optional)"
          style={{
            width: '90%', border: 'none', borderBottom: '1px solid #ddd',
            outline: 'none', background: 'transparent', fontSize: 12,
            fontFamily: 'Arial, sans-serif', color: '#000', padding: '1px 2px',
          }}
        />
      </div>
    </div>
  )
}

export default function Form5({ fields = {}, onChange, readOnly = false }) {
  const f    = (key, fb = '') => fields[key] ?? fb
  const ch   = key => val => !readOnly && onChange(key, val)
  const items = Array.isArray(fields.items) ? fields.items : []

  function updateItem(index, updatedItem) {
    const updated = [...items]
    updated[index] = updatedItem
    onChange('items', updated)
  }

  function addItem() {
    onChange('items', [...items, { name: '', quantity: '', description: '' }])
  }

  function removeItem(index) {
    onChange('items', items.filter((_, i) => i !== index))
  }

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif', fontSize: 14,
      padding: '32px 48px', background: '#fff', color: '#000',
      width: 794, minHeight: 1123, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* Letterhead */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 34, fontWeight: 'bold', fontFamily: 'Times New Roman, serif', letterSpacing: 4 }}>
          R . K . T R A D E R S
        </div>
        <div style={{ fontSize: 12, marginTop: 4, lineHeight: 1.6 }}>
          219/B, OLD CHINA BAZAR STREET,<br />
          1<sup>ST</sup> FLOOR, ROOM NO. – B, KOLKATA – 700 001. (W.B.)
        </div>
        <div style={{ fontSize: 12, marginTop: 3, lineHeight: 1.6 }}>
          Phone No. – 0091– 33 – 46022533,&nbsp;&nbsp;Call No. – 0091 – 7044676599<br />
          Email ID: – rkt_kol1977@yahoo.in
        </div>
      </div>

      {/* Subject */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline',
                    fontSize: 16, marginBottom: 14 }}>
        PACKING DETAILS
      </div>

      {/* Date */}
      <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 12 }}>
        DATE:&nbsp;
        <AFInput value={f('invoiceDate')} onChange={ch('invoiceDate')} width={140} readOnly={readOnly} />
      </div>

      {/* Addressee */}
      <div style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 12 }}>
        <strong>M/S.&nbsp;
          <AFInput value={f('consignee')} onChange={ch('consignee')}
            width={360} bold readOnly={readOnly} iStyle={{ borderBottom: 'none' }} />
        </strong><br />
        <span style={{ whiteSpace: 'pre-line', fontSize: 13 }}>{f('consigneeAddress')}</span>
      </div>

      <div style={{ fontSize: 14, marginBottom: 10 }}>Dear Sir,</div>

      {/* Invoice ref */}
      <div style={{ fontSize: 14, lineHeight: 2, marginBottom: 6 }}>
        TAX Invoice NO.&nbsp;
        <strong style={{ textDecoration: 'underline' }}>
          <AFInput value={f('voucherNumber')} onChange={ch('voucherNumber')}
            width={170} bold underline readOnly={readOnly} iStyle={{ borderBottom: 'none' }} />
        </strong>
        &nbsp;DT.&nbsp;
        <AFInput value={f('invoiceDate')} onChange={ch('invoiceDate')}
          width={100} readOnly={readOnly} iStyle={{ borderBottom: 'none' }} />
        &nbsp;for IRs.&nbsp;
        <strong style={{ textDecoration: 'underline' }}>
          <AFInput value={f('totalAmount') ? `${f('totalAmount')}/- only.` : ''}
            onChange={v => ch('totalAmount')(v.replace('/- only.', '').trim())}
            width={150} bold underline readOnly={readOnly} iStyle={{ borderBottom: 'none' }} />
        </strong>
      </div>

      {/* Total packages line — editable */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6,
                    fontWeight: 'bold', fontSize: 14, marginBottom: 10 }}>
        <span style={{ textDecoration: 'underline', flexShrink: 0 }}>TOTAL-</span>
        <AFInput value={f('totalPackages')} onChange={ch('totalPackages')}
          width={320} bold readOnly={readOnly} />
      </div>

      {/* ── Packages section — fully editable ── */}
      <div style={{ marginLeft: 16, marginBottom: 8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
            <div style={{ flex: 1 }}>
              <ItemRow item={item} index={i} onChange={upd => updateItem(i, upd)} readOnly={readOnly} />
            </div>
            {!readOnly && (
              <button
                onClick={() => removeItem(i)}
                style={{ color: '#c0504a', background: 'none', border: 'none',
                         cursor: 'pointer', fontSize: 16, paddingTop: 2, flexShrink: 0 }}
                title="Remove item"
              >✕</button>
            )}
          </div>
        ))}
        {!readOnly && (
          <button
            onClick={addItem}
            style={{ marginTop: 6, fontSize: 12, color: '#d4a853', background: 'none',
                     border: '1px dashed #d4a853', borderRadius: 3, padding: '2px 10px',
                     cursor: 'pointer' }}
          >+ Add item</button>
        )}
      </div>

      {/* ── Total Qty & Weight — shared with other forms ── */}
      <div style={{ border: '1px solid #ddd', borderRadius: 4, padding: '8px 12px',
                    marginBottom: 12, background: '#fafafa' }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 6, fontWeight: 'bold',
                      textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Summary — used across all forms
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              TOTAL QTY.:
            </span>
            <AFInput value={f('totalQty')} onChange={ch('totalQty')}
              width={160} readOnly={readOnly} bold
              iStyle={{ borderBottom: '1.5px solid #000', fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              WEIGHT APPROX.:
            </span>
            <AFInput value={f('weightApprox')} onChange={ch('weightApprox')}
              width={140} readOnly={readOnly} bold
              iStyle={{ borderBottom: '1.5px solid #000', fontSize: 13 }} />
          </div>
        </div>
      </div>

      {/* Total qty summary line */}
      {(f('totalQty') || f('weightApprox')) && (
        <div style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: 14, marginBottom: 14 }}>
          {f('totalPackages') && `${f('totalPackages')} – `}
          TOTAL QTY.&nbsp;
          {f('totalQty') && <span>{f('totalQty')}</span>}
          {f('totalQty') && f('weightApprox') && ' & '}
          {f('weightApprox') && <span>WEIGHT APPROX. – {f('weightApprox')}</span>}
        </div>
      )}

      {/* Closing */}
      <div style={{ fontSize: 14, lineHeight: 1.9, marginBottom: 10 }}>
        <p>Please acknowledgement receipt and send us Custom clearance certificate along
          with Bill of Export also for the same at your earliest.</p>
        <p style={{ marginTop: 8 }}>Thanking you and assuring to you our best services all the times, we are,<br />
          Very truly yours,</p>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1, minHeight: 16 }} />

      {/* Signature */}
      <div style={{ fontSize: 14 }}>
        <div style={{ fontWeight: 'bold', fontSize: 15 }}>For R. K. TRADERS</div>
        <div style={{ marginTop: 80, maxWidth: 220 }}>
          <div style={{ borderTop: '1px solid #000', paddingTop: 4,
                        fontSize: 12, textAlign: 'center' }}>
            Authorised Signatory
          </div>
        </div>
      </div>

    </div>
  )
}