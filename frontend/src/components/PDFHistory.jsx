import { useEffect, useState } from 'react'
import api from '../services/api.js'

const FORM_LABELS = {
  form1: 'GST Declaration',
  form2: 'SCOMET Letter',
  form3: 'KYC Form',
  form4: 'CHA Authorization',
  form5: 'Packing Details',
}

export default function PDFHistory({ onClose }) {
  const [groups, setGroups]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    api.get('/pdf/history')
      .then(res => setGroups(res.data.history || []))
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false))
  }, [])

  function toggle(vn) {
    setExpanded(e => ({ ...e, [vn]: !e[vn] }))
  }

  async function handleDownload(documentId, formType, filename) {
    try {
      const res = await api.get(`/pdf/download/${documentId}/${formType}`, {
        responseType: 'blob'
      })
      const url = URL.createObjectURL(res.data)
      const a   = document.createElement('a')
      a.href     = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Download failed.')
    }
  }

  return (
    <div className="w-full flex flex-col gap-4 max-w-2xl animate-[fadeIn_0.2s_ease]">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">PDF History</h2>
          <p className="text-xs text-secondary mt-0.5">All generated PDFs, organised by bill number</p>
        </div>
        <button
          onClick={onClose}
          className="text-muted text-sm px-3 py-1.5 rounded border border-borderlt hover:bg-hover transition-colors"
        >
          ← Back
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-[200px] gap-3 text-muted">
          <span className="inline-block w-5 h-5 border-2 border-borderlt border-t-accent rounded-full animate-spin" />
          <span className="text-sm">Loading history…</span>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && groups.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-2 text-muted">
          <span className="font-mono text-4xl text-border">⌗</span>
          <p className="text-sm text-secondary">No PDFs generated yet.</p>
          <p className="text-xs">Upload an XML and generate PDFs to see them here.</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {groups.map(group => (
          <div
            key={group.voucher_number}
            className="bg-surface border border-border rounded-lg overflow-hidden"
          >
            {/* Folder header */}
            <button
              onClick={() => toggle(group.voucher_number)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-hover transition-colors text-left"
            >
              <span className="font-mono text-base text-accent flex-shrink-0">
                {expanded[group.voucher_number] ? '▾' : '▸'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-medium text-primary truncate">
                  {group.voucher_number}
                </p>
                <p className="text-xs text-secondary mt-0.5">
                  {group.forms.length} form{group.forms.length !== 1 ? 's' : ''} generated
                </p>
              </div>
              <span className="text-[10px] text-muted font-mono uppercase tracking-widest flex-shrink-0">
                {group.folder}
              </span>
            </button>

            {/* Forms inside folder */}
            {expanded[group.voucher_number] && (
              <div className="border-t border-border">
                {group.forms.map(form => (
                  <div
                    key={form.form_type}
                    className="flex items-center gap-3 px-5 py-2.5 border-b border-border last:border-b-0 hover:bg-hover/50"
                  >
                    <span className="font-mono text-[10px] text-accent bg-accent-bg border border-accent-bd rounded px-1.5 py-0.5 flex-shrink-0">
                      {form.form_type.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-primary">
                        {FORM_LABELS[form.form_type] || form.form_type}
                      </p>
                      <p className="text-[10px] text-muted mt-0.5">
                        {new Date(form.generated_at).toLocaleString()} &middot; {(form.size_bytes / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(group.document_id, form.form_type, form.filename)}
                      className="flex-shrink-0 text-xs text-accent hover:text-yellow-400 font-medium transition-colors px-2 py-1 rounded hover:bg-accent-bg"
                    >
                      ⬇ Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}