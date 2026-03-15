import { useEffect, useState, useCallback, useRef } from 'react'
import { getDocument, getFormData, updateFormData } from '../services/api.js'
import Form1 from '../forms/Form1.jsx'
import Form2 from '../forms/Form2.jsx'
import Form3 from '../forms/Form3.jsx'
import Form4 from '../forms/Form4.jsx'
import Form5 from '../forms/Form5.jsx'

const FORM_COMPONENTS = { form1: Form1, form2: Form2, form3: Form3, form4: Form4, form5: Form5 }

// Form 3 (KYC) is the only truly static form — always the same R.K. Traders data
const STATIC_FORMS = new Set(['form3'])

// Save status: idle | saving | saved | error
export default function FormViewer({ activeForm, documentId }) {
  const [fields, setFields]       = useState({})
  const [baseFields, setBaseFields] = useState({})   // original parsed XML data
  const [loading, setLoading]     = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved | error
  const [error, setError]         = useState('')
  const debounceRef               = useRef(null)

  const isStatic   = STATIC_FORMS.has(activeForm)
  const isEditable = !isStatic

  // Load document + saved form data whenever form/doc changes
  useEffect(() => {
    if (!documentId || !activeForm) return
    setLoading(true)
    setError('')
    setSaveStatus('idle')

    Promise.all([
      getDocument(documentId),
      getFormData(documentId, activeForm).catch(() => null)
    ])
      .then(([docRes, formRes]) => {
        const base  = docRes.data.parsed_data || {}
        const saved = formRes?.data?.fields   || {}
        const merged = { ...base, ...saved }
        setBaseFields(base)    // keep original for reset
        setFields(merged)
      })
      .catch(() => setError('Failed to load document data.'))
      .finally(() => setLoading(false))
  }, [documentId, activeForm])

  // Debounced save — waits 800ms after last keystroke before hitting the API
  const debouncedSave = useCallback((updatedFields) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaveStatus('saving')
    debounceRef.current = setTimeout(async () => {
      try {
        await updateFormData(documentId, activeForm, updatedFields)
        setSaveStatus('saved')
        // Reset to idle after 2.5s
        setTimeout(() => setSaveStatus('idle'), 2500)
      } catch {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    }, 800)
  }, [documentId, activeForm])

  function handleFieldChange(key, value) {
    if (isStatic) return
    let updated = { ...fields, [key]: value }

    // When totalQty or weightApprox changes in Form5,
    // sync to weight/quantity fields used by Form1 and other forms
    if (key === 'weightApprox') {
      updated.weight = value
    }
    if (key === 'totalQty') {
      // Only update quantity if it's currently empty or was previously auto-set
      if (!fields.quantity || fields._qtySynced) {
        updated.quantity = value
        updated._qtySynced = true
      }
    }

    setFields(updated)
    debouncedSave(updated)
  }

  // Reset all edits back to original XML-parsed values
  function handleReset() {
    if (!window.confirm('Reset all edits and restore original XML data?')) return
    setFields({ ...baseFields })
    debouncedSave({ ...baseFields })
  }

  // ── Status badge ──────────────────────────────────────────────────────────
  function StatusBadge() {
    if (isStatic) return (
      <span className="font-mono text-[10px] text-muted bg-panel border border-border rounded px-1.5 py-0.5">
        Static · Read-only
      </span>
    )
    if (saveStatus === 'saving') return (
      <span className="flex items-center gap-1.5 font-mono text-[10px] text-accent">
        <span className="inline-block w-2.5 h-2.5 border border-accent border-t-transparent rounded-full animate-spin" />
        Saving…
      </span>
    )
    if (saveStatus === 'saved') return (
      <span className="font-mono text-[10px] text-success bg-success/10 border border-success/30 rounded px-1.5 py-0.5">
        ✓ Saved
      </span>
    )
    if (saveStatus === 'error') return (
      <span className="font-mono text-[10px] text-danger bg-danger/10 border border-danger/30 rounded px-1.5 py-0.5">
        ✕ Save failed
      </span>
    )
    return (
      <span className="font-mono text-[10px] text-accent bg-accent-bg border border-accent-bd rounded px-1.5 py-0.5">
        Editable · Auto-save on
      </span>
    )
  }

  // ── Empty / loading / error states ───────────────────────────────────────
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

      {/* Meta bar */}
      <div className="flex items-center gap-3 self-start w-[860px] max-w-full">
        <span className="font-mono text-[10px] text-muted uppercase tracking-widest">A4 Preview</span>
        <StatusBadge />
        {/* Reset button — only shown for editable forms that have been modified */}
        {isEditable && saveStatus !== 'idle' || isEditable && JSON.stringify(fields) !== JSON.stringify(baseFields) ? (
          <button
            onClick={handleReset}
            className="ml-auto font-mono text-[10px] text-muted hover:text-danger transition-colors px-2 py-0.5 rounded border border-border hover:border-danger/40"
          >
            ↺ Reset to XML
          </button>
        ) : null}
      </div>

      {/* Editable hint — shown only once for editable forms */}
      {isEditable && saveStatus === 'idle' && (
        <div className="self-start w-[860px] max-w-full">
          <p className="text-[11px] text-muted">
            Click any field to edit. Changes are auto-saved to the database after you stop typing.
          </p>
        </div>
      )}

      {/* A4 paper — 794px wide, scaled up to fill available space */}
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

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}