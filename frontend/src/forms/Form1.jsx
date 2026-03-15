import { useRef, useEffect } from 'react'

// Auto-shrinking textarea — fixed box size, font shrinks to fit content
function AutoFitArea({ value, onChange, minFont = 8, maxFont = 11, rows = 2, readOnly = false }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Reset to max font first
    el.style.fontSize = `${maxFont}px`

    // Shrink font until content fits (no scroll)
    let size = maxFont
    while (el.scrollHeight > el.clientHeight && size > minFont) {
      size -= 0.5
      el.style.fontSize = `${size}px`
    }
  }, [value, maxFont, minFont])

  const rowHeight = 20 // px per row
  const height = rows * rowHeight

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={e => !readOnly && onChange(e.target.value)}
      readOnly={readOnly}
      style={{
        width: '100%',
        height: height,
        minHeight: height,
        maxHeight: height,
        fontSize: maxFont,
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.4',
        border: 'none',
        outline: 'none',
        resize: 'none',
        overflow: 'hidden',
        background: 'transparent',
        color: '#000',
        padding: 0,
        display: 'block',
        boxSizing: 'border-box',
      }}
    />
  )
}

// Auto-shrinking single-line input — fixed width, font shrinks to fit
function AutoFitInput({ value, onChange, width = '100%', minFont = 8, maxFont = 11,
                        readOnly = false, bold = false, style = {} }) {
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
        fontSize: maxFont,
        fontFamily: 'Arial, sans-serif',
        fontWeight: bold ? 'bold' : 'normal',
        border: 'none',
        borderBottom: readOnly ? 'none' : '1px solid #ccc',
        outline: 'none',
        background: 'transparent',
        color: '#000',
        padding: '1px 2px',
        display: 'inline-block',
        boxSizing: 'border-box',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        ...style,
      }}
    />
  )
}

export default function Form1({ fields = {}, onChange, readOnly = false }) {
  const f = (key, fb = '') => fields[key] ?? fb
  const change = (key) => (val) => !readOnly && onChange(key, val)

  // GST number defaults to the fixed R.K. Traders GST number
  const gstNumber = f('consigneeGSTIN') || '19ACXPA0890P1ZS'

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      fontSize: 11,
      padding: '14px 16px',
      background: '#fff',
      color: '#000',
      minHeight: 1123,
      boxSizing: 'border-box',
    }}>
      <div style={{ border: '1px solid #000', padding: '10px 14px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 2, fontSize: 11 }}>
          THE WEST BENGAL VALUE ADDED TAX RULES, 2005 UNDER GST ACT, 2017
        </div>
        <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', letterSpacing: 1, margin: '4px 0' }}>
          DECLARATION
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, marginBottom: 10 }}>
          [ See Rule 107 (1) ]
        </div>

        {/* Serial No */}
        <div style={{ textAlign: 'right', marginBottom: 8, fontSize: 11 }}>
          Serial No.&nbsp;
          <AutoFitInput
            value={f('serialNo')}
            onChange={change('serialNo')}
            width={90}
            readOnly={readOnly}
            style={{ borderBottom: '1px solid #000' }}
          />
        </div>

        <p style={{ marginBottom: 8, fontSize: 11, textAlign: 'center' }}>
          *I/We declare that the following consignment of goods is despatched from a place within West Bengal.
        </p>

        {/* Main table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 28 }} />
            <col style={{ width: '43%' }} />
            <col />
          </colgroup>
          <tbody>

            <TR num="1." label="Name, address and Income Tax Permanent Account No. (PAN) of the Consignor">
              <AutoFitArea rows={3} value={f('consignorDetails')} onChange={change('consignorDetails')} readOnly={readOnly} />
            </TR>

            <TR num="2." label="Name, address and Income Tax Permanent Account No. (PAN) of the Consignee">
              <AutoFitArea rows={3} value={f('consigneeDetails')} onChange={change('consigneeDetails')} readOnly={readOnly} />
            </TR>

            <TR num="3." label="Place of Despatch">
              <AutoFitArea rows={2} value={f('placeOfDespatch')} onChange={change('placeOfDespatch')} readOnly={readOnly} />
            </TR>

            <TR num="4." label="Destination">
              <AutoFitArea rows={2} value={f('destination')} onChange={change('destination')} readOnly={readOnly} />
            </TR>

            <TR num="5." label="Description of goods">
              <AutoFitArea rows={4} minFont={7} value={f('descriptionOfGoods')} onChange={change('descriptionOfGoods')} readOnly={readOnly} />
            </TR>

            <TR num="6." label="Quantity">
              <AutoFitArea rows={3} value={f('quantity')} onChange={change('quantity')} readOnly={readOnly} />
            </TR>

            <TR num="7." label="Value and / or rate">
              <AutoFitArea rows={2} value={f('valueRate')} onChange={change('valueRate')} readOnly={readOnly} />
            </TR>

            <TR num="8." label="Weight">
              <AutoFitArea rows={2} value={f('weight')} onChange={change('weight')} readOnly={readOnly} />
            </TR>

            <TR num="9." label="Value and / or rate">
              <AutoFitArea rows={2} value={f('valueRate2')} onChange={change('valueRate2')} readOnly={readOnly} />
            </TR>

            <TR num="10." label="*Consignment Note or Delivery Note No. and Date of Challan No. and Date">
              <AutoFitArea rows={2} value={f('consignmentNote')} onChange={change('consignmentNote')} readOnly={readOnly} />
            </TR>

          </tbody>
        </table>

        {/* Declaration box */}
        <div style={{ marginTop: 10, fontSize: 11, lineHeight: 1.8 }}>
          <p>
            *I/We declare that I/We* hold/do not hold GST Certificate of Registration bearing No.&nbsp;
            <AutoFitInput
              value={f('gstCertificateNumber')}
              onChange={change('gstCertificateNumber')}
              width={70}
              readOnly={readOnly}
              style={{ borderBottom: '1px solid #000' }}
            />
            &nbsp;under the West Bengal Value Added Tax Act, 2003 (West Ben. Act....of 2003).&nbsp;
            <strong>
              GST #&nbsp;
              <AutoFitInput
                value={gstNumber}
                onChange={change('consigneeGSTIN')}
                width={170}
                bold
                readOnly={readOnly}
                style={{ borderBottom: '1px solid #000', fontWeight: 'bold' }}
              />
            </strong>
          </p>
          <p style={{ marginTop: 6 }}>
            *I/We* have/have not Manufactured the goods in West Bengal/not transported the goods from outside West Bengal.
          </p>
          <p style={{ marginTop: 6 }}>
            The above statement is true to the best of my/our knowledge and belief.
          </p>
        </div>

        {/* Signature row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28 }}>

          <div style={{ fontSize: 11 }}>
            Date :-&nbsp;
            <AutoFitInput
              value={f('invoiceDate')}
              onChange={change('invoiceDate')}
              width={110}
              readOnly={readOnly}
              style={{ borderBottom: '1px solid #000' }}
            />
          </div>

          {/* Stamp + signature box */}
          <div style={{ textAlign: 'center', minWidth: 210 }}>
            <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>
              {f('consignor') || 'R. K. TRADERS'}
            </div>
            <div style={{
              border: '1px dashed #bbb',
              height: 75,
              width: 210,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontSize: 9, color: '#bbb' }}>Stamp</span>
            </div>
            <div style={{
              borderTop: '1px solid #000',
              paddingTop: 3,
              marginTop: 6,
              fontSize: 10,
              textAlign: 'center',
            }}>
              Signature &amp; Status of the Declarant
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{ borderTop: '1px solid #000', marginTop: 14, paddingTop: 6, fontSize: 10, lineHeight: 1.6 }}>
          <p>
            N.B. : (1) The declaration should bear a consecutive Serial No. issued by the officer at the
            consignor giving the declaration and a true copy of the same should be retained by him.
          </p>
          <p style={{ marginTop: 3 }}>(2) *Strike out whichever is not applicable.</p>
        </div>

      </div>
    </div>
  )
}

// Table row helper
function TR({ num, label, children }) {
  const cell = { border: '1px solid #000', padding: '4px 6px', verticalAlign: 'top', fontSize: 11 }
  return (
    <tr>
      <td style={{ ...cell, textAlign: 'center', fontWeight: 'bold' }}>{num}</td>
      <td style={{ ...cell, fontWeight: 'bold' }}>{label}</td>
      <td style={cell}>{children}</td>
    </tr>
  )
}