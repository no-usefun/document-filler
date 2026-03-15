import { useAuth } from '../services/auth.jsx'
import { useNavigate } from 'react-router-dom'


const FORMS = [
  { id: 'form1', label: 'GST Declaration',   icon: '§' },
  { id: 'form2', label: 'SCOMET Letter',      icon: '⊠' },
  { id: 'form3', label: 'KYC Form',           icon: '✦' },
  { id: 'form4', label: 'CHA Authorization',  icon: '⊞' },
  { id: 'form5', label: 'Packing Details',    icon: '↗' },
]

const BORDER_COLORS = {
  sonauli: { dot: '#4a9e6b', label: 'Sonauli' },
  raxaul:  { dot: '#5b8fd4', label: 'Raxaul' },
}

export default function Sidebar({ activeForm, onSelectForm, documentId, border,
                                   onUploadClick, onHistoryClick, onImagesClick, activeView }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate                  = useNavigate()
  const bc                        = border ? BORDER_COLORS[border.id] : null

  function handleLogout() { logout(); navigate('/login') }

  function NavItem({ id, label, icon, onClick, active, disabled, badge }) {
    return (
      <button
        onClick={() => !disabled && onClick()}
        disabled={disabled}
        title={disabled ? 'Upload an XML file first' : label}
        className={`sidebar-item ${active ? 'active' : ''} ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        <span className="font-mono w-4 text-center flex-shrink-0 text-sm">{icon}</span>
        <span className="flex-1 truncate text-[13px]">{label}</span>
        {badge && <span className="text-[9px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
          style={{ background: badge.bg, color: badge.color }}>{badge.text}</span>}
        {active && <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />}
      </button>
    )
  }

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
        <button onClick={onUploadClick}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm font-medium text-accent
                     bg-accent-bg border border-accent-bd transition-colors
                     hover:bg-amber-400/10 hover:border-accent-dim">
          <span className="font-mono text-base leading-none">↑</span>
          Upload XML
        </button>
      </div>

      {/* Border badge */}
      {border && bc && (
        <div className="mx-3 mb-2 flex items-center gap-2 px-3 py-1.5 rounded bg-panel border border-border">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: bc.dot }} />
          <span className="text-[11px] text-secondary flex-1 truncate">{bc.label} Border</span>
          <span className="text-[9px] text-muted font-mono">active</span>
        </div>
      )}

      {/* Editable Forms nav */}
      <div className="flex-1 overflow-y-auto pb-2">
        <p className="section-label">Editable Forms</p>
        <nav className="flex flex-col gap-0.5 px-2">
          {FORMS.map(f => (
            <NavItem key={f.id} id={f.id} label={f.label} icon={f.icon}
              onClick={() => onSelectForm(f.id)}
              active={activeForm === f.id && activeView === 'forms'}
              disabled={!documentId} />
          ))}
        </nav>

        {/* Reference images section */}
        <p className="section-label mt-2">Reference Images</p>
        <div className="px-2">
          <NavItem id="images" label="Scanned Docs" icon="⊡"
            onClick={onImagesClick}
            active={activeView === 'images'}
            disabled={false} />
        </div>

        {/* Storage section */}
        <p className="section-label mt-2">Storage</p>
        <div className="px-2">
          <NavItem id="history" label="PDF History" icon="◷"
            onClick={onHistoryClick}
            active={activeView === 'history'}
            disabled={false} />
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
          <div className="w-6 h-6 rounded-full bg-accent-bg border border-accent-bd flex items-center
                          justify-center text-[11px] font-semibold text-accent flex-shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs text-secondary truncate block">{user?.email}</span>
            {isAdmin && (
              <span className="text-[9px] text-accent font-mono">⊕ admin</span>
            )}
          </div>
          <button onClick={handleLogout} title="Sign out"
            className="text-muted text-sm transition-colors hover:text-danger flex-shrink-0">⏻</button>
        </div>
      </div>
    </aside>
  )
}