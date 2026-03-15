import { useEffect, useState } from 'react'
import { getDocument, getFormData, updateFormData } from '../services/api.js'
import Form1 from '../forms/Form1.jsx'
import Form2 from '../forms/Form2.jsx'
import Form3 from '../forms/Form3.jsx'
import Form4 from '../forms/Form4.jsx'
import Form5 from '../forms/Form5.jsx'

const FORM_COMPONENTS = { form1: Form1, form2: Form2, form3: Form3, form4: Form4, form5: Form5 }
const STATIC_FORMS    = new Set(['form3'])

function applyBorderFields(fields, border, formType) {
  if (!border) return fields
  const f = { ...fields }
  if (formType === 'form2') {
    f.borderCommissioner = border.commissioner
    f.borderLocation     = border.sub
    f.portOfDischarge    = border.discharge
    f.destination        = border.destination || f.destination
  }
  if (formType === 'form4') {
    f.borderAssistant = border.assistant
    f.borderLocation  = border.sub
    f.portOfDischarge = border.discharge
  }
  if (formType === 'form1') {
    if (!f.destination || f.destination === '')
      f.destination = border.destination
  }
  return f
}

export default function FormViewer({ activeForm, documentId, border }) {
  const [fields, setFields]       = useState({})
  const [baseFields, setBaseFields] = useState({})
  const [loading, setLoading]     = useState(false)
  const [isDirty, setIsDirty]     = useState(false)   // unsaved changes exist
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved | error
  const [error, setError]         = useState('')

  const isStatic   = STATIC_FORMS.has(activeForm)
  const isEditable = !isStatic

  // Load form data whenever form/doc changes
  useEffect(() => {
    if (!documentId || !activeForm) return
    setLoading(true)
    setError('')
    setSaveStatus('idle')
    setIsDirty(false)

    Promise.all([
      getDocument(documentId),
      getFormData(documentId, activeForm).catch(() => null)
    ])
      .then(([docRes, formRes]) => {
        const base       = docRes.data.parsed_data || {}
        const saved      = formRes?.data?.fields   || {}
        const withBorder = applyBorderFields(base, border, activeForm)
        const merged     = { ...withBorder, ...saved }
        setBaseFields(withBorder)
        setFields(merged)
        setIsDirty(false)
      })
      .catch(() => setError('Failed to load document data.'))
      .finally(() => setLoading(false))
  }, [documentId, activeForm, border])

  // Field change — only updates local state, does NOT call API
  function handleFieldChange(key, value) {
    if (isStatic) return
    let updated = { ...fields, [key]: value }

    // Sync weight/qty from Form5 summary fields
    if (key === 'weightApprox') updated.weight   = value
    if (key === 'totalQty')     updated.quantity  = value

    setFields(updated)
    setIsDirty(true)
    setSaveStatus('idle')
  }

  // Explicit save — called only when user clicks Save
  async function handleSave() {
    if (!isDirty || isStatic) return
    setSaveStatus('saving')
    try {
      await updateFormData(documentId, activeForm, fields)
      setSaveStatus('saved')
      setIsDirty(false)
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  // Reset to original XML data
  function handleReset() {
    if (!window.confirm('Discard all changes and restore original XML data?')) return
    setFields({ ...baseFields })
    setIsDirty(false)
    setSaveStatus('idle')
  }

  // ── States ────────────────────────────────────────────────────────────────
  if (!activeForm || !documentId) return (
    <div className="flex flex-col items-center justify-center gap-3 min-h-[400px] text-muted">
      <span className="font-mono text-5xl text-border">⌗</span>
      <p className="text-base font-medium text-secondary">No document loaded</p>
      <p className="text-sm">Upload an XML file to get started</p>
    </div>
  )

  if (loading) return (
    <div className="flex flex-col items-center justify-center gap-3 min-h-[400px]">
      <span className="inline-block w-6 h-6 border-2 border-borderlt border-t-accent rounded-full animate-spin" />
      <p className="text-sm text-muted">Loading form data…</p>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-sm text-red-400">{error}</p>
    </div>
  )

  const FormComponent = FORM_COMPONENTS[activeForm]

  return (
    <div className="w-full flex flex-col items-center gap-3 pb-12">

      {/* ── Action bar ── */}
      <div className="flex items-center gap-3 self-start w-[794px] max-w-full">

        <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
          A4 Preview
        </span>

        {/* Status badges */}
        {isStatic && (
          <span className="font-mono text-[10px] text-muted bg-panel border border-border rounded px-1.5 py-0.5">
            Static · Read-only
          </span>
        )}
        {!isStatic && !isDirty && saveStatus === 'idle' && (
          <span className="font-mono text-[10px] text-muted bg-panel border border-border rounded px-1.5 py-0.5">
            No unsaved changes
          </span>
        )}
        {!isStatic && isDirty && (
          <span className="font-mono text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded px-1.5 py-0.5 animate-pulse">
            ● Unsaved changes
          </span>
        )}
        {saveStatus === 'saved' && (
          <span className="font-mono text-[10px] text-success bg-success/10 border border-success/30 rounded px-1.5 py-0.5">
            ✓ Saved
          </span>
        )}
        {saveStatus === 'error' && (
          <span className="font-mono text-[10px] text-danger bg-danger/10 border border-danger/30 rounded px-1.5 py-0.5">
            ✕ Save failed — try again
          </span>
        )}

        {/* Right side buttons */}
        <div className="ml-auto flex items-center gap-2">
          {/* Reset button — only if dirty */}
          {isEditable && isDirty && (
            <button
              onClick={handleReset}
              className="font-mono text-[11px] text-muted hover:text-danger transition-colors px-2.5 py-1 rounded border border-border hover:border-danger/40"
            >
              ↺ Reset
            </button>
          )}

          {/* Save button — only for editable forms */}
          {isEditable && (
            <button
              onClick={handleSave}
              disabled={!isDirty || saveStatus === 'saving'}
              className={`flex items-center gap-1.5 text-[12px] font-semibold px-4 py-1.5 rounded transition-all ${
                isDirty && saveStatus !== 'saving'
                  ? 'bg-accent text-base hover:bg-yellow-400 cursor-pointer'
                  : 'bg-panel text-muted border border-border cursor-not-allowed opacity-50'
              }`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>💾 Save changes</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Hint for editable forms */}
      {isEditable && (
        <div className="self-start w-[794px] max-w-full">
          <p className="text-[11px] text-muted">
            Edit any field, then click <strong className="text-accent">Save changes</strong> to store.
            {isDirty && ' You have unsaved changes — don\'t forget to save before generating the PDF.'}
          </p>
        </div>
      )}

      {/* A4 paper */}
      <div style={{
        width: 794,
        minHeight: 1123,
        transformOrigin: 'top center',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
        borderRadius: 2,
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease',
        background: '#fff',
      }}>
        <FormComponent
          fields={fields}
          onChange={handleFieldChange}
          readOnly={isStatic}
        />
      </div>

      {/* Sticky save bar — appears at bottom when there are unsaved changes */}
      {isEditable && isDirty && (
        <div className="fixed bottom-0 left-[220px] right-0 bg-surface border-t border-border px-6 py-3
                        flex items-center justify-between z-40 animate-[slideUp_0.2s_ease]">
          <p className="text-sm text-secondary">
            <span className="text-amber-400 font-medium">●</span>
            &nbsp;You have unsaved changes in this form
          </p>
          <div className="flex items-center gap-3">
            <button onClick={handleReset}
              className="text-sm text-muted hover:text-danger transition-colors px-3 py-1.5 rounded border border-borderlt hover:border-danger/40">
              ↺ Reset
            </button>
            <button onClick={handleSave} disabled={saveStatus === 'saving'}
              className="btn-accent flex items-center gap-1.5 text-sm py-1.5 disabled:opacity-50">
              {saveStatus === 'saving' ? (
                <><span className="inline-block w-3 h-3 border-2 border-black/20 border-t-black/70 rounded-full animate-spin" /> Saving…</>
              ) : (
                <>💾 Save changes</>
              )}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn   { from{opacity:0;transform:translateY(6px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}