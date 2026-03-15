// Form 4 — Clearing Agent Authorization Letter
// Reference: WhatsApp_Image_2026-03-15_at_2_46_42_AM__2_.jpeg

import { useRef, useEffect } from 'react'

function AutoFitInput({ value, onChange, width, minFont = 10, maxFont = 14,
                        readOnly = false, bold = false, underline = false, style = {} }) {
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
    <input
      ref={ref}
      value={value}
      onChange={e => !readOnly && onChange(e.target.value)}
      readOnly={readOnly}
      style={{
        width,
        border: 'none',
        borderBottom: '1px solid #000',
        outline: 'none',
        background: 'transparent',
        fontFamily: 'Arial, sans-serif',
        fontSize: maxFont,
        fontWeight: bold ? 'bold' : 'normal',
        textDecoration: underline ? 'underline' : 'none',
        color: '#000',
        display: 'inline-block',
        padding: '1px 2px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        verticalAlign: 'middle',
        ...style,
      }}
    />
  )
}

export default function Form4({ fields = {}, onChange, readOnly = false }) {
  const f = (key, fb = '') => fields[key] ?? fb
  const ch = key => val => !readOnly && onChange(key, val)

  // Build quantity string from items for display
  const items   = fields.items || []
  const qtyLine = f('quantity') || items.map(i => `${i.quantity} ${i.name}`).join(', ')
  const pkgLine = f('descriptionOfGoods') || items.map(i => i.name).join(', ')

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      padding: '32px 48px',
      background: '#fff',
      color: '#000',
      width: 794,
      minHeight: 1123,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ── Letterhead ── */}
      <div style={{ textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: 10, marginBottom: 20 }}>
        <div style={{ fontSize: 32, fontWeight: 'bold', fontFamily: 'Times New Roman, serif', letterSpacing: 3 }}>
          R.K.TRADERS
        </div>
        <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.6 }}>
          219/B, OLD CHINA BAZAR STREET<br />
          KOLKATA – 700 001
        </div>
        <div style={{ fontSize: 12, textDecoration: 'underline', marginTop: 2 }}>
          PHONE – 0091-7044676599 / 033-46018237
        </div>
      </div>

      {/* To + Date row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 14 }}>
        <div style={{ lineHeight: 2 }}>
          To,<br />
          The Assistant Commissioner,<br />
          Land Custom station<br />
          <strong style={{ textDecoration: 'underline' }}>SONAULI, U.P.</strong>
        </div>
        <div style={{ fontWeight: 'bold', fontSize: 14 }}>
          Date:&nbsp;
          <AutoFitInput value={f('invoiceDate')} onChange={ch('invoiceDate')}
            width={130} readOnly={readOnly} />
        </div>
      </div>

      {/* RE line */}
      <div style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: 14, marginBottom: 16 }}>
        RE: - CLEARING AGENT AUTHORIZATION LETTER
      </div>

      <div style={{ fontSize: 14, marginBottom: 16 }}>Respected Sir / Ma'am,</div>

      {/* Auth body */}
      <div style={{ fontSize: 14, lineHeight: 2.1 }}>
        <div>
          We hereby authorize to Mr.&nbsp;
          <span style={{ display: 'inline-block', width: 180, borderBottom: '1px solid #000' }}>&nbsp;</span>
          &nbsp;(Custom House Agent)
        </div>
        <div>
          CHA License No. ,&nbsp;
          <span style={{ display: 'inline-block', width: 100, borderBottom: '1px solid #000' }}>&nbsp;</span>
          &nbsp;,&nbsp;
          <span style={{ display: 'inline-block', width: 80, borderBottom: '1px solid #000' }}>&nbsp;</span>
          , SONAULI to carry out all
        </div>
        <div>
          clearance of cargo along with all custom related work from Indian custom on behalf of
        </div>
        <div>
          M/S.&nbsp;<strong style={{ textDecoration: 'underline' }}>R.K.TRADERS</strong>
          &nbsp;, IEC Code No.&nbsp;<strong style={{ textDecoration: 'underline' }}>0206017863</strong>
        </div>
      </div>

      {/* Shipment details */}
      <div style={{ fontSize: 14, lineHeight: 2, marginTop: 16 }}>
        <div>The details of shipment will be as given below; : -</div>
        <div>BL Number / LC No:-</div>
        <div>
          Company Name:-&nbsp;
          <AutoFitInput value={f('consignee')} onChange={ch('consignee')}
            width={320} bold underline readOnly={readOnly} />
        </div>
        <div>
          Invoice Number &amp; Date:-&nbsp;
          <AutoFitInput value={`${f('voucherNumber')} DT. ${f('invoiceDate')}.`}
            onChange={() => {}} width={320} bold underline readOnly={true} />
        </div>
        <div>
          Quantity: -&nbsp;
          <AutoFitInput value={qtyLine} onChange={ch('quantity')}
            width={340} bold underline readOnly={readOnly} />
        </div>
        <div>
          Package:-&nbsp;
          <AutoFitInput value={pkgLine} onChange={ch('descriptionOfGoods')}
            width={360} bold underline readOnly={readOnly} />
        </div>
      </div>

      <div style={{ fontSize: 14, lineHeight: 1.9, marginTop: 20 }}>
        <div>Please accord them with the necessary assistance for clearance of the goods.</div>
        <div>Thank you for your co-operation,</div>
      </div>

      <div style={{ fontSize: 14, marginTop: 16 }}>Yours Faithfully,</div>

      {/* Spacer */}
      <div style={{ flex: 1, minHeight: 20 }} />

      {/* Three signature boxes matching image */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', marginTop: 20, fontSize: 13 }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ height: 80, borderBottom: '1px solid #000' }} />
          <div style={{ paddingTop: 4 }}>
            First Name Last Name<br />
            Designation<br />
            <strong>COMPANY STAMP</strong>
          </div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ height: 80, borderBottom: '1px solid #000' }} />
          <div style={{ paddingTop: 4 }}>
            For R. K. TRADERS
          </div>
        </div>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ height: 80, borderBottom: '1px solid #000' }} />
          <div style={{ paddingTop: 4 }}>
            R. K. TRADERS<br />
            Proprietor
          </div>
        </div>
      </div>

      {/* Mandatory note */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 13,
                    marginTop: 16, borderTop: '1px solid #000', paddingTop: 8 }}>
        Signature and company stamp is mandatory for registered companies
      </div>

    </div>
  )
}