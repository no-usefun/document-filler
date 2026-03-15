// Form 2 — SCOMET "To Whom It May Concern" letter
// Reference: WhatsApp_Image_2026-03-15_at_2_46_42_AM.jpeg

const S = {
  page: {
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
  },
}

export default function Form2({ fields = {}, onChange, readOnly = false }) {
  const f = (key, fb = '') => fields[key] ?? fb

  function editLine(key, style = {}) {
    return (
      <input
        value={f(key)}
        onChange={e => !readOnly && onChange(key, e.target.value)}
        readOnly={readOnly}
        style={{
          border: 'none',
          borderBottom: '1px solid #999',
          outline: 'none',
          background: 'transparent',
          fontFamily: 'Arial, sans-serif',
          fontSize: 14,
          color: '#000',
          display: 'inline',
          padding: '0 2px',
          ...style,
        }}
      />
    )
  }

  return (
    <div style={S.page}>

      {/* ── Letterhead ── */}
      <div style={{ textAlign: 'center', borderBottom: '1.5px solid #000', paddingBottom: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 36, fontWeight: 'bold', fontFamily: 'Times New Roman, serif', letterSpacing: 4 }}>
          R . K . T R A D E R S
        </div>
        <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.7 }}>
          219/B, OLD CHINA BAZAR STREET,<br />
          1<sup>ST</sup> FLOOR, ROOM NO. – 8,<br />
          KOLKATA – 700 001. (W.B.)
        </div>
        <div style={{ fontSize: 13, marginTop: 4, lineHeight: 1.7 }}>
          Phone No. – 0091– 33 – 46022533.<br />
          Cell No. – 0091 – 7044676599.<br />
          Email ID: – rkt_kol1977@yahoo.in
        </div>
      </div>

      {/* Date */}
      <div style={{ fontSize: 14, marginBottom: 20 }}>
        <strong>DATE: -</strong>&nbsp;
        {editLine('invoiceDate', { width: 140 })}
      </div>

      {/* To block */}
      <div style={{ fontSize: 14, lineHeight: 2, marginBottom: 20 }}>
        To,<br />
        The Deputy Commissioner<br />
        <strong style={{ textDecoration: 'underline' }}>LCS SONAULI.</strong>
      </div>

      <div style={{ fontSize: 14, marginBottom: 16 }}>Dear Sir,</div>

      {/* Subject */}
      <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold',
                    textDecoration: 'underline', marginBottom: 20 }}>
        TO WHOM IT MAY CONCERN
      </div>

      {/* Body */}
      <div style={{ fontSize: 14, lineHeight: 2, textAlign: 'justify' }}>
        AS PER THE END USE CRITERIA THE GOODS UNDER THE INVOICE NO.: –&nbsp;
        <strong style={{ textDecoration: 'underline' }}>
          {editLine('voucherNumber', { width: 180, fontWeight: 'bold' })}&nbsp;
          DATED&nbsp;{editLine('invoiceDate', { width: 110, fontWeight: 'bold' })}.
        </strong>
        &nbsp;DOES NOT FALL UNDER ANY CATEGORY OF SCOMET LIST – Refer to category 4 (4A013)
        of Appendix 3 of the SCOMET list and are going to be used exclusively for consumer
        or to be used in the industry producing consumer goods.
      </div>

      <div style={{ fontSize: 14, marginTop: 24 }}>Thank you,</div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Signature block */}
      <div style={{ fontSize: 14, marginTop: 20 }}>
        <div style={{ fontWeight: 'bold', fontSize: 15 }}>For R. K. TRADERS</div>
        {/* Stamp + signature space */}
        <div style={{ marginTop: 90, display: 'flex', alignItems: 'flex-end', gap: 0 }}>
          <div style={{ textAlign: 'center', minWidth: 220 }}>
            <div style={{
              border: '1px dashed #ccc', height: 20, width: 220,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} />
            <div style={{ borderTop: '1px solid #000', paddingTop: 4, fontSize: 12, marginTop: 2 }}>
              Authorised Signatory
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}