import { useAuth } from '../services/auth.jsx'
import { useNavigate } from 'react-router-dom'

const FORMS = [
  { id: 'form1', label: 'GST Declaration',     icon: '§', note: 'Pre-filled' },
  { id: 'form2', label: 'SCOMET Letter',        icon: '⊠', note: 'Pre-filled' },
  { id: 'form3', label: 'KYC Form',             icon: '✦', note: 'Static'    },
  { id: 'form4', label: 'CHA Authorization',    icon: '⊞', note: 'Pre-filled' },
  { id: 'form5', label: 'Packing Details',      icon: '↗', note: 'Pre-filled' },
]

export default function Sidebar({ activeForm, onSelectForm, documentId, onUploadClick, onHistoryClick, showHistory }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  function handleLogout() { logout(); navigate('/login') }

  return (
    <aside className="w-[220px] flex-shrink-0 bg-surface border-r border-border flex flex-col overflow-hidden">

      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-[18px] border-b border-border">
        <span className="font-mono text-lg text-accent">⌗</span>
        <span className="font-mono text-[13px] font-medium tracking-widest">
          XML<span className="text-accent">→</span>PDF
        </span>
      </div>

      {/* Upload button */}
      <div className="px-3 pt-3.5 pb-2">
        <button
          onClick={onUploadClick}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-accent
                     bg-accent-bg border border-accent-bd transition-colors
                     hover:bg-amber-400/10 hover:border-accent-dim"
        >
          <span className="font-mono text-base leading-none">↑</span>
          Upload XML
        </button>
      </div>

      {/* Form nav */}
      <div className="flex-1 overflow-y-auto pb-2">
        <p className="section-label">Documents</p>
        <nav className="flex flex-col gap-0.5 px-2">
          {FORMS.map(f => (
            <button
              key={f.id}
              onClick={() => documentId && onSelectForm(f.id)}
              disabled={!documentId}
              title={!documentId ? 'Upload an XML file first' : f.label}
              className={`sidebar-item ${activeForm === f.id && !showHistory ? 'active' : ''} ${!documentId ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <span className="font-mono w-4 text-center flex-shrink-0 text-sm">{f.icon}</span>
              <span className="flex-1 truncate text-[13px]">{f.label}</span>
              {activeForm === f.id && !showHistory && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              )}
            </button>
          ))}
        </nav>

        {/* History button */}
        <p className="section-label mt-2">Storage</p>
        <div className="px-2">
          <button
            onClick={onHistoryClick}
            className={`sidebar-item w-full ${showHistory ? 'active' : ''}`}
          >
            <span className="font-mono w-4 text-center flex-shrink-0 text-sm">◷</span>
            <span className="flex-1 truncate text-[13px]">PDF History</span>
            {showHistory && <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3 flex flex-col gap-2">
        {documentId && (
          <div className="flex items-center justify-between bg-panel border border-border rounded px-2.5 py-1.5">
            <span className="text-[10px] text-muted uppercase tracking-widest">Doc ID</span>
            <span className="font-mono text-xs text-accent">{documentId.slice(-8)}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-accent-bg border border-accent-bd flex items-center justify-center
                          text-[11px] font-semibold text-accent flex-shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <span className="text-xs text-secondary flex-1 truncate">{user?.email}</span>
          <button onClick={handleLogout} title="Sign out"
            className="text-muted text-sm transition-colors hover:text-danger flex-shrink-0">⏻</button>
        </div>
      </div>
    </aside>
  )
}