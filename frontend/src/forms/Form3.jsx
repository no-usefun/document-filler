import './form-paper.css'

// KYC Form — fully static, R.K. Traders fixed data, read-only
export default function Form3() {
  return (
    <div className="page" style={{ fontFamily: 'Arial, sans-serif' }}>

      {/* Letterhead */}
      <div style={{ textAlign:'center', borderBottom:'2px solid #000', paddingBottom:10, marginBottom:16 }}>
        <div style={{ fontSize:26, fontWeight:'bold', fontFamily:'Times New Roman,serif', letterSpacing:3 }}>
          R . K . T R A D E R S
        </div>
        <div style={{ fontSize:10, marginTop:4, lineHeight:1.6 }}>
          219/B, OLD CHINA BAZAR STREET,<br/>
          1<sup>ST</sup> FLOOR, ROOM NO. – 8<br/>
          KOLKATA – 700 001. (W.B.)
        </div>
        <div style={{ fontSize:10, marginTop:2, lineHeight:1.6 }}>
          Phone No. – 0091– 33 – 46022533. &nbsp;&nbsp; Cell No. – 0091 – 70446 76599<br/>
          Email ID: – rkt_kol1977@yahoo.in
        </div>
      </div>

      {/* Title */}
      <div style={{
        textAlign:'center', border:'2px solid #000', padding:'6px',
        fontWeight:'bold', fontSize:12, letterSpacing:1, marginBottom:0
      }}>
        CUSTOMER INFORMATION SHEET – KYC FORM
      </div>

      {/* Table */}
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
        <tbody>
          <tr style={{ background:'#f0f0f0' }}>
            <td style={S.sr}><strong>SR<br/>NO.</strong></td>
            <td colSpan={2} style={S.td}></td>
          </tr>
          <KRow n="1."  label="Name Of Establishment:"                              val="R. K. TRADERS" />
          <tr>
            <td style={S.sr}>2.</td>
            <td style={S.label}>
              Nature Of Company: Ownership:<br/>
              Family/ Trust/ Foundation/<br/>
              Partnership/ Company/ Individual/ Proprietor:
            </td>
            <td style={S.td}>PROPRIETORSHIP</td>
          </tr>
          <KRow n="3."  label="Full Name of Promoters/Directors/Partners/Proprietor:" val="RAKESH KUMAR AGARWAL" />
          <tr>
            <td style={S.sr}>4.</td>
            <td style={S.label}>Registered Address of Business:</td>
            <td style={S.td} rowSpan={2}>
              219 / B, OLD CHINA BAZAR STREET,<br/>
              1<sup>ST</sup> FLOOR, ROOM NO. – 8<br/>
              KOLKATA – 700 001 (W.B.)
            </td>
          </tr>
          <tr>
            <td style={S.sr}>5.</td>
            <td style={S.label}>
              Preferred Address Required on Invoice<br/>
              (If Different to Registered Place of Business):
            </td>
          </tr>
          <KRow n="6."  label="IEC Code:"                                            val="0206017863" />
          <KRow n="7."  label="Contacts: Telephone No. / Mobile No."                val="+91 70446 76599 / 033 – 3568 3084" />
          <KRow n=""    label="Email:"                                               val="rkt_kol1977@yahoo.in" />
          <KRow n="8."  label="Pan Card Number:"                                    val="ACXPA0890P" />
          <KRow n="9."  label="Aadhar Card Number:"                                 val="328740537406" />
          <KRow n="10." label="GSTIN Number (As Per Invoice Address):"              val="19ACXPA0890P1ZS" />
        </tbody>
      </table>

      {/* Signature */}
      <div style={{ marginTop:20, fontSize:12 }}>
        <p>Thanking you,</p>
        <p style={{ fontWeight:'bold', marginTop:4 }}>For R. K. TRADERS</p>
        <div style={{ marginTop:80, maxWidth:180 }}>
          <div style={{ borderTop:'1px solid #000', paddingTop:4, fontSize:11, textAlign:'center' }}>
            Authorised Signatory
          </div>
        </div>
      </div>
    </div>
  )
}

const S = {
  sr:    { border:'1px solid #000', padding:'5px 7px', width:36, textAlign:'center', fontWeight:'bold', verticalAlign:'top' },
  label: { border:'1px solid #000', padding:'5px 7px', width:'42%', verticalAlign:'top' },
  td:    { border:'1px solid #000', padding:'5px 7px', verticalAlign:'top' },
}

function KRow({ n, label, val }) {
  return (
    <tr>
      <td style={S.sr}>{n}</td>
      <td style={S.label}>{label}</td>
      <td style={S.td}>{val}</td>
    </tr>
  )
}