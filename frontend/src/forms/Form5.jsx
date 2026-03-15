import './form-paper.css'

export default function Form5({ fields = {}, onChange, readOnly = false }) {
  const f    = (key, fb = '') => fields[key] ?? fb
  const items = fields.items || []

  // Calculate total packages and weight from items for display
  const totalLine = items.length
    ? items.map(i => `${i.quantity} ${i.name}`).join(' + ')
    : ''

  return (
    <div className="page" style={{ fontFamily: 'Arial, sans-serif', fontSize:12 }}>

      {/* Letterhead */}
      <div style={{ textAlign:'center', borderBottom:'2px solid #000', paddingBottom:10, marginBottom:16 }}>
        <div style={{ fontSize:26, fontWeight:'bold', fontFamily:'Times New Roman,serif', letterSpacing:3 }}>
          R . K . T R A D E R S
        </div>
        <div style={{ fontSize:11, marginTop:4, lineHeight:1.6 }}>
          219/B, OLD CHINA BAZAR STREET,<br/>
          1<sup>ST</sup> FLOOR, ROOM NO. – B<br/>
          KOLKATA – 700 001. (W.B.)
        </div>
        <div style={{ fontSize:11, marginTop:4, lineHeight:1.6 }}>
          Phone No. – 0091– 33 – 46022533,<br/>
          Call No. – 0091 – 7044676599<br/>
          Email ID: – rkt_kol1977@yahoo.in
        </div>
      </div>

      <div style={{ fontWeight:'bold', marginBottom:12, fontSize:12 }}>
        DATE: {f('invoiceDate')}
      </div>

      {/* Addressee */}
      <div style={{ marginBottom:14, fontSize:12, lineHeight:1.7 }}>
        M/S. <strong>{f('consignee')}</strong><br/>
        <span style={{ whiteSpace:'pre-line' }}>{f('consigneeAddress')}</span>
      </div>

      <p style={{ marginBottom:6 }}>Dear Sir,</p>

      {/* Subject */}
      <div style={{ textAlign:'center', fontWeight:'bold', textDecoration:'underline', fontSize:13, margin:'12px 0' }}>
        PACKING DETAILS
      </div>

      {/* Invoice reference */}
      <div style={{ fontSize:12, lineHeight:2 }}>
        <p>
          TAX Invoice NO.&nbsp;
          <strong style={{ textDecoration:'underline' }}>{f('voucherNumber')}</strong>
          &nbsp;DT. {f('invoiceDate')} for IRs.&nbsp;
          <strong style={{ textDecoration:'underline' }}>
            {f('totalAmount')}/- only.
          </strong>
        </p>
        {f('totalPackages') && (
          <p style={{ fontWeight:'bold', textDecoration:'underline', marginTop:4 }}>
            TOTAL- {f('totalPackages')}
          </p>
        )}
      </div>

      {/* Items list */}
      <div style={{ margin:'10px 0 8px 24px', fontSize:12, lineHeight:2 }}>
        {items.map((item, i) => (
          <div key={i} style={{ fontWeight:'bold' }}>
            {String(i + 1).padStart(2, '0')}.) {item.quantity} – {item.name}
            {item.description && item.description !== item.name && (
              <div style={{ fontWeight:'normal', marginLeft:32, fontSize:11 }}>
                {item.description}
              </div>
            )}
          </div>
        ))}
      </div>

      {totalLine && (
        <div style={{ fontWeight:'bold', textDecoration:'underline', fontSize:12, margin:'6px 0' }}>
          TOTAL QTY. &amp; WEIGHT AS PER PACKING LIST
        </div>
      )}

      {/* Closing */}
      <div style={{ marginTop:14, fontSize:12, lineHeight:1.9 }}>
        <p>
          Please acknowledgement receipt and send us Custom clearance certificate along
          with Bill of Export also for the same at your earliest.
        </p>
        <p style={{ marginTop:8 }}>
          Thanking you and assuring to you our best services all the times, we are,<br/>
          Very truly yours,
        </p>
      </div>

      {/* Signature + stamp — generous space */}
      <div style={{ marginTop:14, fontSize:12 }}>
        <p style={{ fontWeight:'bold' }}>For R. K. TRADERS</p>
        <div style={{ marginTop:80, maxWidth:200 }}>
          <div style={{ borderTop:'1px solid #000', paddingTop:4, fontSize:11, textAlign:'center' }}>
            Authorised Signatory
          </div>
        </div>
      </div>
    </div>
  )
}