import './form-paper.css'

export default function Form4({ fields = {}, onChange, readOnly = false }) {
  const f    = (key, fb = '') => fields[key] ?? fb
  const edit = (key, width = '100%') => readOnly
    ? <span style={{ fontWeight:'bold', textDecoration:'underline' }}>{f(key)}</span>
    : <input className="edit-field" style={{ width, display:'inline' }}
        value={f(key)} onChange={e => onChange(key, e.target.value)} />

  return (
    <div className="page" style={{ fontFamily: 'Arial, sans-serif', fontSize:12 }}>

      {/* Letterhead */}
      <div style={{ textAlign:'center', borderBottom:'1px solid #000', paddingBottom:8, marginBottom:14 }}>
        <div style={{ fontSize:24, fontWeight:'bold', fontFamily:'Times New Roman,serif', letterSpacing:3 }}>
          R.K.TRADERS
        </div>
        <div style={{ fontSize:11, marginTop:3, lineHeight:1.5 }}>
          219/B, OLD CHINA BAZAR STREET<br/>
          KOLKATA – 700 001
        </div>
        <div style={{ fontSize:10, textDecoration:'underline', marginTop:2 }}>
          PHONE – 0091-7044676599 / 033-46018237
        </div>
      </div>

      {/* Header row: To + Date */}
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ fontSize:12, lineHeight:1.8 }}>
          To,<br/>
          The Assistant Commissioner,<br/>
          Land Custom station<br/>
          <strong style={{ textDecoration:'underline' }}>SONAULI, U.P.</strong>
        </div>
        <div style={{ fontSize:12, fontWeight:'bold' }}>
          Date: {f('invoiceDate')}
        </div>
      </div>

      <div style={{ fontWeight:'bold', textDecoration:'underline', fontSize:12, marginBottom:10 }}>
        RE: - CLEARING AGENT AUTHORIZATION LETTER
      </div>

      <p style={{ marginBottom:8, fontSize:12 }}>Respected Sir / Ma&apos;am,</p>

      {/* Auth body */}
      <div style={{ fontSize:12, lineHeight:2.1 }}>
        <p>
          We hereby authorize to Mr.&nbsp;
          <span style={{ display:'inline-block', minWidth:160, borderBottom:'1px solid #000' }}></span>
          &nbsp;(Custom House Agent)
        </p>
        <p>
          CHA License No. ,&nbsp;
          <span style={{ display:'inline-block', minWidth:80, borderBottom:'1px solid #000' }}></span>
          &nbsp;,&nbsp;
          <span style={{ display:'inline-block', minWidth:80, borderBottom:'1px solid #000' }}></span>
          , SONAULI to carry out all
        </p>
        <p>
          clearance of cargo along with all custom related work from Indian custom on behalf of
        </p>
        <p>
          M/S.&nbsp;<strong style={{ textDecoration:'underline' }}>R.K.TRADERS</strong>&nbsp;, IEC Code No.&nbsp;
          <strong style={{ textDecoration:'underline' }}>0206017863</strong>
        </p>
      </div>

      {/* Shipment details */}
      <div style={{ margin:'12px 0', fontSize:12, lineHeight:2 }}>
        <p style={{ marginBottom:4 }}>The details of shipment will be as given below; : -</p>
        <p>BL Number / LC No:-</p>
        <p>Company Name:- &nbsp;<strong style={{ textDecoration:'underline' }}>{f('consignee')}</strong></p>
        <p>
          Invoice Number &amp; Date:-&nbsp;
          <strong style={{ textDecoration:'underline' }}>{f('voucherNumber')} DT. {f('invoiceDate')}.</strong>
        </p>
        <p>Quantity:- &nbsp;<strong style={{ textDecoration:'underline' }}>{f('quantity')}</strong></p>
        <p>Package:- &nbsp;<strong style={{ textDecoration:'underline' }}>{f('descriptionOfGoods')}</strong></p>
      </div>

      <div style={{ fontSize:12, lineHeight:1.9 }}>
        <p>Please accord them with the necessary assistance for clearance of the goods.</p>
        <p>Thank you for your co-operation,</p>
      </div>

      {/* Signature area — 3 boxes with generous stamp space */}
      <div style={{ marginTop:20, display:'flex', gap:40, alignItems:'flex-end', fontSize:11 }}>
        <div style={{ textAlign:'center', minWidth:150 }}>
          <div style={{ height:75 }}></div>
          <div style={{ borderTop:'1px solid #000', paddingTop:4 }}>
            First Name Last Name<br/>Designation<br/><strong>COMPANY STAMP</strong>
          </div>
        </div>
        <div style={{ textAlign:'center', minWidth:150 }}>
          <div style={{ height:75 }}></div>
          <div style={{ borderTop:'1px solid #000', paddingTop:4 }}>For R. K. TRADERS</div>
        </div>
        <div style={{ textAlign:'center', minWidth:120 }}>
          <div style={{ height:75 }}></div>
          <div style={{ borderTop:'1px solid #000', paddingTop:4 }}>
            R. K. TRADERS<br/>Proprietor
          </div>
        </div>
      </div>

      <div style={{ textAlign:'center', fontSize:11, fontWeight:'bold', marginTop:12, borderTop:'1px solid #000', paddingTop:6 }}>
        Signature and company stamp is mandatory for registered companies
      </div>
    </div>
  )
}