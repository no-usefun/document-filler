import './form-paper.css'

// SCOMET letter — pre-filled but editable (invoice no. and date may need correction)
export default function Form2({ fields = {}, onChange, readOnly = false }) {
  const f = (key, fb = '') => fields[key] ?? fb

  const editStyle = {
    border: 'none',
    borderBottom: readOnly ? 'none' : '1px solid #999',
    outline: 'none',
    background: readOnly ? 'transparent' : 'rgba(212,168,83,0.04)',
    fontFamily: 'Arial, sans-serif',
    fontSize: 12,
    color: '#000',
    display: 'inline',
    cursor: readOnly ? 'default' : 'text',
  }

  function field(key, width = 120, bold = false) {
    return (
      <input
        style={{ ...editStyle, width, fontWeight: bold ? 'bold' : 'normal', textDecoration: bold ? 'underline' : 'none' }}
        value={f(key)}
        onChange={e => !readOnly && onChange(key, e.target.value)}
        readOnly={readOnly}
      />
    )
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, padding: '14px 16px', background: '#fff', color: '#000', minHeight: 1123, boxSizing: 'border-box' }}>

      {/* Letterhead */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 26, fontWeight: 'bold', fontFamily: 'Times New Roman,serif', letterSpacing: 3 }}>
          R . K . T R A D E R S
        </div>
        <div style={{ fontSize: 11, marginTop: 4, lineHeight: 1.6 }}>
          219/B, OLD CHINA BAZAR STREET,<br />
          1<sup>ST</sup> FLOOR, ROOM NO. – 8,<br />
          KOLKATA – 700 001. (W.B.)
        </div>
        <div style={{ fontSize: 11, marginTop: 4, lineHeight: 1.6 }}>
          Phone No. – 0091– 33 – 46022533.<br />
          Cell No. – 0091 – 7044676599.<br />
          Email ID: – rkt_kol1977@yahoo.in
        </div>
      </div>

      <div style={{ marginBottom: 14, fontSize: 12 }}>
        DATE: -&nbsp;{field('invoiceDate', 120)}
      </div>

      <div style={{ marginBottom: 18, fontSize: 12, lineHeight: 1.8 }}>
        To,<br />
        The Deputy Commissioner<br />
        <strong style={{ textDecoration: 'underline' }}>LCS SONAULI.</strong>
      </div>

      <p style={{ marginBottom: 6, fontSize: 12 }}>Dear Sir,</p>

      <div style={{ textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline', fontSize: 13, margin: '16px 0' }}>
        TO WHOM IT MAY CONCERN
      </div>

      <div style={{ fontSize: 12, lineHeight: 1.9, textAlign: 'justify' }}>
        AS PER THE END USE CRITERIA THE GOODS UNDER THE INVOICE NO.: –&nbsp;
        <strong style={{ textDecoration: 'underline' }}>
          {field('voucherNumber', 160, true)}&nbsp;DATED&nbsp;{field('invoiceDate', 100, true)}.
        </strong>
        &nbsp;DOES NOT FALL UNDER ANY CATEGORY OF SCOMET LIST – Refer to category 4 (4A013) of Appendix 3
        of the SCOMET list and are going to be used exclusively for consumer or to be used in the industry
        producing consumer goods.
      </div>

      <div style={{ marginTop: 30, fontSize: 12 }}>
        <p>Thank you,</p>
        <p style={{ fontWeight: 'bold', marginTop: 8 }}>For R. K. TRADERS</p>
        {/* Stamp + signature space */}
        <div style={{ marginTop: 85, display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <div style={{ minWidth: 200, textAlign: 'center' }}>
            <div style={{
              border: '1px dashed #ccc', height: 80, width: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 9, color: '#aaa' }}>Stamp here</span>
            </div>
            <div style={{ borderTop: '1px solid #000', paddingTop: 4, fontSize: 11, marginTop: 6, textAlign: 'center' }}>
              Authorised Signatory
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}