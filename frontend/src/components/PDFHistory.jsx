import { useEffect, useState, useMemo } from 'react'
import api from '../services/api.js'

const FORM_LABELS = {
  form1: 'GST Declaration',
  form2: 'SCOMET Letter',
  form3: 'KYC Form',
  form4: 'CHA Authorization',
  form5: 'Packing Details',
}

const FORM_OPTIONS = [
  { value: '', label: 'All forms' },
  ...Object.entries(FORM_LABELS).map(([v, l]) => ({ value: v, label: l })),
]

export default function PDFHistory({ onClose }) {
  const [groups, setGroups]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [expanded, setExpanded]     = useState({})
  const [downloading, setDownloading] = useState('')
  const [deleting, setDeleting]     = useState('')
  const [search, setSearch]         = useState('')
  const [filterForm, setFilterForm] = useState('')
  const [sortOrder, setSortOrder]   = useState('newest')  // newest | oldest | alpha
  const [confirmClear, setConfirmClear] = useState(false)

  function load() {
    setLoading(true)
    api.get('/pdf/history')
      .then(res => setGroups(res.data.history || []))
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // ── Filtering + sorting ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = groups.map(g => {
      // Filter forms inside each group
      const forms = filterForm
        ? g.forms.filter(f => f.form_type === filterForm)
        : g.forms
      return { ...g, forms }
    }).filter(g => g.forms.length > 0)

    // Search by voucher number
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(g =>
        g.voucher_number.toLowerCase().includes(q)
      )
    }

    // Sort
    if (sortOrder === 'newest') {
      result = [...result].sort((a, b) => {
        const aDate = Math.max(...a.forms.map(f => new Date(f.generated_at)))
        const bDate = Math.max(...b.forms.map(f => new Date(f.generated_at)))
        return bDate - aDate
      })
    } else if (sortOrder === 'oldest') {
      result = [...result].sort((a, b) => {
        const aDate = Math.min(...a.forms.map(f => new Date(f.generated_at)))
        const bDate = Math.min(...b.forms.map(f => new Date(f.generated_at)))
        return aDate - bDate
      })
    } else if (sortOrder === 'alpha') {
      result = [...result].sort((a, b) =>
        a.voucher_number.localeCompare(b.voucher_number)
      )
    }

    return result
  }, [groups, search, filterForm, sortOrder])

  const totalForms = filtered.reduce((s, g) => s + g.forms.length, 0)

  // ── Actions ───────────────────────────────────────────────────────────
  function toggle(vn) {
    setExpanded(e => ({ ...e, [vn]: !e[vn] }))
  }

  function expandAll()   { setExpanded(Object.fromEntries(filtered.map(g => [g.voucher_number, true]))) }
  function collapseAll() { setExpanded({}) }

  async function handleDownload(documentId, formType, filename) {
    const key = `${documentId}-${formType}`
    setDownloading(key)
    try {
      const res = await api.get(`/pdf/download/${documentId}/${formType}`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a   = document.createElement('a')
      a.href = url; a.download = filename; a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Download failed. Please try generating the PDF again.')
    } finally { setDownloading('') }
  }

  async function handleDeleteForm(documentId, formType, voucherNumber) {
    const key = `del-${documentId}-${formType}`
    setDeleting(key)
    try {
      await api.delete(`/pdf/history/${documentId}/${formType}`)
      setGroups(prev => prev.map(g => {
        if (g.document_id !== documentId) return g
        return { ...g, forms: g.forms.filter(f => f.form_type !== formType) }
      }).filter(g => g.forms.length > 0))
    } catch {
      alert('Delete failed.')
    } finally { setDeleting('') }
  }

  async function handleDeleteVoucher(documentId, voucherNumber) {
    if (!window.confirm(`Remove all history for "${voucherNumber}"?`)) return
    setDeleting(`del-voucher-${documentId}`)
    try {
      await api.delete(`/pdf/history/${documentId}`)
      setGroups(prev => prev.filter(g => g.document_id !== documentId))
      setExpanded(e => { const n = { ...e }; delete n[voucherNumber]; return n })
    } catch {
      alert('Delete failed.')
    } finally { setDeleting('') }
  }

  async function handleClearAll() {
    setConfirmClear(false)
    try {
      await api.delete('/pdf/history')
      setGroups([])
      setExpanded({})
    } catch {
      alert('Clear failed.')
    }
  }

  return (
    <div className="w-full flex flex-col gap-4 max-w-2xl animate-[fadeIn_0.2s_ease]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">PDF History</h2>
          <p className="text-xs text-secondary mt-0.5">
            PDFs regenerate on download using your latest saved data
          </p>
        </div>
        <div className="flex items-center gap-2">
          {groups.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-xs text-danger hover:text-red-400 px-2.5 py-1.5 rounded border border-danger/30 hover:border-danger/60 transition-colors"
            >
              ✕ Clear all
            </button>
          )}
          <button onClick={onClose}
            className="text-muted text-sm px-3 py-1.5 rounded border border-borderlt hover:bg-hover transition-colors">
            ← Back
          </button>
        </div>
      </div>

      {/* ── Confirm clear all ── */}
      {confirmClear && (
        <div className="flex items-center gap-3 bg-danger/10 border border-danger/30 rounded-lg px-4 py-3">
          <p className="text-sm text-primary flex-1">
            Remove <strong>all</strong> PDF history? This cannot be undone.
          </p>
          <button onClick={handleClearAll}
            className="text-xs text-white bg-danger px-3 py-1.5 rounded hover:bg-red-600 transition-colors">
            Yes, clear all
          </button>
          <button onClick={() => setConfirmClear(false)}
            className="text-xs text-muted px-3 py-1.5 rounded border border-borderlt hover:bg-hover transition-colors">
            Cancel
          </button>
        </div>
      )}

      {/* ── Search + Filter + Sort bar ── */}
      {!loading && groups.length > 0 && (
        <div className="flex flex-col gap-2">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">⌕</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by voucher number…"
              className="w-full bg-panel border border-borderlt rounded-lg pl-8 pr-4 py-2 text-sm
                         text-primary placeholder-muted outline-none focus:border-accent transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary">
                ✕
              </button>
            )}
          </div>

          {/* Filter + Sort row */}
          <div className="flex items-center gap-2">
            {/* Form filter */}
            <select
              value={filterForm}
              onChange={e => setFilterForm(e.target.value)}
              className="flex-1 bg-panel border border-borderlt rounded-lg px-3 py-1.5 text-sm
                         text-primary outline-none focus:border-accent transition-colors"
            >
              {FORM_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className="flex-1 bg-panel border border-borderlt rounded-lg px-3 py-1.5 text-sm
                         text-primary outline-none focus:border-accent transition-colors"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="alpha">A → Z</option>
            </select>

            {/* Expand / collapse all */}
            <button onClick={expandAll}
              className="text-xs text-muted px-2.5 py-1.5 rounded border border-borderlt hover:bg-hover hover:text-primary transition-colors whitespace-nowrap">
              ▾ All
            </button>
            <button onClick={collapseAll}
              className="text-xs text-muted px-2.5 py-1.5 rounded border border-borderlt hover:bg-hover hover:text-primary transition-colors whitespace-nowrap">
              ▸ All
            </button>
          </div>

          {/* Result count */}
          <p className="text-[11px] text-muted">
            {filtered.length} voucher{filtered.length !== 1 ? 's' : ''},&nbsp;
            {totalForms} form{totalForms !== 1 ? 's' : ''}
            {(search || filterForm) && (
              <button onClick={() => { setSearch(''); setFilterForm('') }}
                className="ml-2 text-accent underline underline-offset-2">
                Clear filters
              </button>
            )}
          </p>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center min-h-[200px] gap-3 text-muted">
          <span className="inline-block w-5 h-5 border-2 border-borderlt border-t-accent rounded-full animate-spin" />
          <span className="text-sm">Loading history…</span>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* ── Empty state ── */}
      {!loading && !error && groups.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-2 text-muted">
          <span className="font-mono text-4xl text-border">⌗</span>
          <p className="text-sm text-secondary">No PDFs generated yet.</p>
          <p className="text-xs">Upload an XML, fill forms, and click Generate PDF.</p>
        </div>
      )}

      {/* ── No filter results ── */}
      {!loading && groups.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[120px] gap-2 text-muted">
          <p className="text-sm">No results match your filters.</p>
          <button onClick={() => { setSearch(''); setFilterForm('') }}
            className="text-xs text-accent underline underline-offset-2">Clear filters</button>
        </div>
      )}

      {/* ── Groups ── */}
      <div className="flex flex-col gap-2">
        {filtered.map(group => {
          const isDeletingVoucher = deleting === `del-voucher-${group.document_id}`
          return (
            <div key={group.voucher_number}
                 className="bg-surface border border-border rounded-lg overflow-hidden">

              {/* Folder header */}
              <div className="flex items-center">
                <button
                  onClick={() => toggle(group.voucher_number)}
                  className="flex-1 flex items-center gap-3 px-4 py-3 hover:bg-hover transition-colors text-left"
                >
                  <span className="font-mono text-base text-accent flex-shrink-0">
                    {expanded[group.voucher_number] ? '▾' : '▸'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-medium text-primary truncate">
                      {group.voucher_number}
                    </p>
                    <p className="text-xs text-secondary mt-0.5">
                      {group.forms.length} form{group.forms.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted font-mono flex-shrink-0 mr-2">
                    {group.folder}
                  </span>
                </button>

                {/* Delete entire voucher */}
                <button
                  onClick={() => handleDeleteVoucher(group.document_id, group.voucher_number)}
                  disabled={isDeletingVoucher}
                  title="Remove all history for this voucher"
                  className="px-3 py-3 text-muted hover:text-danger transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  {isDeletingVoucher
                    ? <span className="inline-block w-3 h-3 border border-muted border-t-danger rounded-full animate-spin" />
                    : <span className="text-sm">🗑</span>
                  }
                </button>
              </div>

              {/* Forms inside */}
              {expanded[group.voucher_number] && (
                <div className="border-t border-border">
                  {group.forms.map(form => {
                    const dlKey  = `${group.document_id}-${form.form_type}`
                    const delKey = `del-${group.document_id}-${form.form_type}`
                    const isDown = downloading === dlKey
                    const isDel  = deleting    === delKey
                    return (
                      <div key={form.form_type}
                           className="flex items-center gap-3 px-5 py-2.5 border-b border-border last:border-b-0 hover:bg-hover/50 group">
                        <span className="font-mono text-[10px] text-accent bg-accent-bg border border-accent-bd rounded px-1.5 py-0.5 flex-shrink-0">
                          {form.form_type.toUpperCase()}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-primary">
                            {FORM_LABELS[form.form_type] || form.form_type}
                          </p>
                          <p className="text-[10px] text-muted mt-0.5">
                            {new Date(form.generated_at).toLocaleString()}
                          </p>
                        </div>

                        {/* Download */}
                        <button
                          onClick={() => handleDownload(group.document_id, form.form_type, form.filename)}
                          disabled={isDown || isDel}
                          className="flex-shrink-0 flex items-center gap-1 text-xs text-accent hover:text-yellow-400 font-medium transition-colors px-2 py-1 rounded hover:bg-accent-bg disabled:opacity-40"
                        >
                          {isDown
                            ? <><span className="inline-block w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" /> Generating…</>
                            : <>⬇ Download</>
                          }
                        </button>

                        {/* Delete single form */}
                        <button
                          onClick={() => handleDeleteForm(group.document_id, form.form_type, group.voucher_number)}
                          disabled={isDel || isDown}
                          title="Remove this entry"
                          className="flex-shrink-0 text-muted hover:text-danger transition-colors px-1.5 py-1 rounded hover:bg-danger/10 disabled:opacity-40 opacity-0 group-hover:opacity-100"
                        >
                          {isDel
                            ? <span className="inline-block w-3 h-3 border border-muted border-t-danger rounded-full animate-spin" />
                            : <span className="text-sm">✕</span>
                          }
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}