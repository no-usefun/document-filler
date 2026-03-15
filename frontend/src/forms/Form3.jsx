// Form 3 — KYC Customer Information Sheet
// Reference: WhatsApp_Image_2026-03-15_at_2_46_42_AM__1_.jpeg
// Fully static — R.K. Traders fixed data, no XML fields needed

export default function Form3() {
  const cell  = { border: '1px solid #000', padding: '7px 10px', verticalAlign: 'top', fontSize: 14 }
  const cellC = { ...cell, textAlign: 'center' }

  return (
    <div style={{
      fontFamily: "'Courier New', monospace",
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
      <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 34, fontWeight: 'bold', letterSpacing: 4 }}>
          R . K . T R A D E R S
        </div>
        <div style={{ fontSize: 12, marginTop: 5, lineHeight: 1.7 }}>
          219/B, OLD CHINA BAZAR STREET,<br />
          1<sup>ST</sup> FLOOR, ROOM NO. – 8<br />
          KOLKATA – 700 001. (W.B.)
        </div>
        <div style={{ fontSize: 12, marginTop: 4, lineHeight: 1.7 }}>
          Phone No. – 0091– 33 – 46022533.&nbsp;&nbsp;
          Cell No. – 0091 – 70446 76599<br />
          Email ID: – rkt_kol1977@yahoo.in
        </div>
      </div>

      {/* ── KYC Title ── */}
      <div style={{
        border: '1.5px solid #000', padding: '8px 12px',
        textAlign: 'center', fontWeight: 'bold', fontSize: 14,
        letterSpacing: 1, marginBottom: 0,
      }}>
        CUSTOMER INFORMATION SHEET – KYC FORM
      </div>

      {/* ── Table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <colgroup>
          <col style={{ width: 50 }} />
          <col style={{ width: '45%' }} />
          <col />
        </colgroup>
        <tbody>
          {/* Header row */}
          <tr>
            <td style={{ ...cell, fontWeight: 'bold', background: '#f5f5f5' }}>SR<br />NO.</td>
            <td style={{ ...cell, background: '#f5f5f5' }} colSpan={2}></td>
          </tr>
          <tr>
            <td style={cellC}>1.</td>
            <td style={cell}>Name Of Establishment:</td>
            <td style={cell}>R. K. TRADERS</td>
          </tr>
          <tr>
            <td style={cellC}>2.</td>
            <td style={cell}>
              Nature Of Company: Ownership:<br />
              Family/ Trust/ Foundation/<br />
              Partnership/ Company/ Individual/ Proprietor:
            </td>
            <td style={{ ...cell, fontWeight: 'bold' }}>PROPRIETORSHIP</td>
          </tr>
          <tr>
            <td style={cellC}>3.</td>
            <td style={cell}>
              Full Name of<br />
              Promoters/Directors/Partners/Proprietor:
            </td>
            <td style={{ ...cell, fontWeight: 'bold' }}>RAKESH KUMAR AGARWAL</td>
          </tr>
          <tr>
            <td style={cellC}>4.</td>
            <td style={cell}>Registered Address of Business:</td>
            <td style={cell} rowSpan={2}>
              219 / B, OLD CHINA BAZAR<br />
              STREET,<br />
              1<sup>ST</sup> FLOOR, ROOM NO. – 8<br />
              KOLKATA – 700 001 (W.B.)
            </td>
          </tr>
          <tr>
            <td style={cellC}>5.</td>
            <td style={cell}>
              Preferred Address Required on Invoice<br />
              (If Different to Registered Place of Business):
            </td>
          </tr>
          <tr>
            <td style={cellC}>6.</td>
            <td style={cell}>IEC Code:</td>
            <td style={cell}>0206017863</td>
          </tr>
          <tr>
            <td style={cellC}>7.</td>
            <td style={cell}>Contacts: Telephone No. / Mobile No.</td>
            <td style={cell}>+91 70446 76599 /<br />033 – 3568 3084</td>
          </tr>
          <tr>
            <td style={cellC}></td>
            <td style={cell}>Email:</td>
            <td style={cell}>rkt_kol1977@yahoo.in</td>
          </tr>
          <tr>
            <td style={cellC}>8.</td>
            <td style={cell}>Pan Card Number:</td>
            <td style={cell}>ACXPA0890P</td>
          </tr>
          <tr>
            <td style={cellC}>9.</td>
            <td style={cell}>Aadhar Card Number:</td>
            <td style={cell}>328740537406</td>
          </tr>
          <tr>
            <td style={cellC}>10.</td>
            <td style={cell}>GSTIN Number (As Per Invoice Address):</td>
            <td style={{ ...cell, fontWeight: 'bold' }}>19ACXPA0890P1ZS</td>
          </tr>
        </tbody>
      </table>

      {/* Spacer */}
      <div style={{ flex: 1, minHeight: 40 }} />

      {/* Closing + signature */}
      <div style={{ fontSize: 14, marginTop: 24 }}>
        <div>Thanking you,</div>
        <div style={{ fontWeight: 'bold', fontSize: 15, marginTop: 4 }}>For R. K. TRADERS</div>
        <div style={{ marginTop: 90, maxWidth: 200 }}>
          <div style={{ borderTop: '1px solid #000', paddingTop: 4, fontSize: 12, textAlign: 'center' }}>
            Authorised Signatory
          </div>
        </div>
      </div>

    </div>
  )
}