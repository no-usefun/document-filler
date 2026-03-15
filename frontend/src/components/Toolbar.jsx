import { useState } from 'react'
import { generatePDF } from '../services/api.js'

const FORM_TITLES = {
  form1: 'GST Declaration',
  form2: 'SCOMET Letter',
  form3: 'KYC Form',
  form4: 'CHA Authorization',
  form5: 'Packing Details',
}

const EDITABLE_FORMS = new Set(['form1', 'form2', 'form4', 'form5'])

export default function Toolbar({ activeForm, documentId }) {
  const [generating, setGenerating] = useState(false)
  const [genDone, setGenDone]       = useState(false)

  async function handleGenerate() {
    if (!documentId || !activeForm) return
    setGenerating(true)
    setGenDone(false)
    try {
      await generatePDF(documentId, activeForm)
      setGenDone(true)
      setTimeout(() => setGenDone(false), 3000)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <header className="h-[52px] flex-shrink-0 bg-surface border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-2.5">
        {activeForm ? (
          <>
            <span className="font-mono text-[10px] font-medium tracking-widest text-accent bg-accent-bg border border-accent-bd rounded px-1.5 py-0.5">
              {activeForm.toUpperCase()}
            </span>
            <span className="text-sm font-medium text-primary">{FORM_TITLES[activeForm]}</span>
            {EDITABLE_FORMS.has(activeForm) && (
              <span className="text-[10px] text-muted ml-1">· editable</span>
            )}
          </>
        ) : (
          <span className="text-sm text-muted">No document loaded</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {genDone && (
          <span className="text-[11px] text-success font-medium animate-pulse">
            ✓ PDF saved to history
          </span>
        )}
        <button
          onClick={handleGenerate}
          disabled={!documentId || !activeForm || generating}
          className="btn-accent flex items-center gap-2"
        >
          {generating ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-black/20 border-t-black/80 rounded-full animate-spin" />
              Generating…
            </>
          ) : (
            <>⬇ Generate PDF</>
          )}
        </button>
      </div>
    </header>
  )
}