import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../services/auth.jsx'
import { listImages, uploadImage, deleteImage, updateImage } from '../services/api.js'

const FOLDERS = [
  { id: 'all',      label: 'All Documents', icon: '⊡', color: '#888' },
  { id: 'sonauli',  label: 'Sonauli Border', icon: '◈', color: '#4a9e6b' },
  { id: 'raxaul',   label: 'Raxaul Border',  icon: '◈', color: '#5b8fd4' },
  { id: 'general',  label: 'General',         icon: '◉', color: '#d4a853' },
]

export default function ImagePanel({ onClose }) {
  const { isAdmin, user }           = useAuth()
  const [activeFolder, setActiveFolder] = useState('all')
  const [images, setImages]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [uploading, setUploading]   = useState(false)
  const [viewing, setViewing]       = useState(null)
  const [error, setError]           = useState('')
  const [editingId, setEditingId]   = useState(null)
  const [editLabel, setEditLabel]   = useState('')
  const [uploadFolder, setUploadFolder] = useState('general')
  const [uploadLabel, setUploadLabel]   = useState('')
  const [deleting, setDeleting]     = useState('')
  const inputRef = useRef()

  function load(folder) {
    setLoading(true)
    const f = folder === 'all' ? '' : folder
    listImages(f)
      .then(res => setImages(res.data.images || []))
      .catch(() => setError('Failed to load images.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(activeFolder) }, [activeFolder])

  function handleFolderChange(fid) {
    setActiveFolder(fid)
    setViewing(null)
  }

  async function handleFiles(files) {
    if (!isAdmin) return
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!valid.length) return
    setUploading(true)
    setError('')
    try {
      for (const file of valid) {
        const label = uploadLabel || file.name
        await uploadImage(file, uploadFolder, label)
      }
      setUploadLabel('')
      load(activeFolder)
    } catch (e) {
      setError(e.response?.data?.message || 'Upload failed.')
    } finally { setUploading(false) }
  }

  function handleDrop(e) {
    e.preventDefault()
    if (!isAdmin) return
    handleFiles(e.dataTransfer.files)
  }

  async function handleDelete(id) {
    if (!isAdmin) return
    setDeleting(id)
    try {
      await deleteImage(id)
      setImages(prev => prev.filter(img => img._id !== id))
      if (images[viewing]?._id === id) setViewing(null)
    } catch { setError('Delete failed.') }
    finally { setDeleting('') }
  }

  async function handleSaveLabel(id) {
    try {
      await updateImage(id, editLabel, undefined)
      setImages(prev => prev.map(img => img._id === id ? { ...img, label: editLabel } : img))
      setEditingId(null)
    } catch { setError('Update failed.') }
  }

  async function handleMoveFolder(id, folder) {
    try {
      await updateImage(id, undefined, folder)
      setImages(prev => {
        const updated = prev.map(img => img._id === id ? { ...img, folder } : img)
        // If viewing a specific folder, remove moved image from current view
        if (activeFolder !== 'all' && folder !== activeFolder) {
          return updated.filter(img => img._id !== id)
        }
        return updated
      })
    } catch { setError('Move failed.') }
  }

  const current = viewing !== null ? images[viewing] : null
  const folderInfo = FOLDERS.find(f => f.id === activeFolder) || FOLDERS[0]

  return (
    <div className="w-full flex flex-col gap-0 max-w-3xl animate-[fadeIn_0.2s_ease]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-primary">Reference Documents</h2>
          <p className="text-xs text-secondary mt-0.5">
            {isAdmin ? 'Upload and manage scanned reference documents by border'
                     : 'View reference documents — stored by border location'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium px-2 py-1 rounded border font-mono ${
            isAdmin ? 'text-accent bg-accent-bg border-accent-bd'
                    : 'text-muted bg-panel border-border'}`}>
            {isAdmin ? '⊕ Admin' : '⊙ Viewer'}
          </span>
          <button onClick={onClose}
            className="text-muted text-sm px-3 py-1.5 rounded border border-borderlt hover:bg-hover transition-colors">
            ← Back
          </button>
        </div>
      </div>

      <div className="flex gap-4">

        {/* ── Left: folder sidebar ── */}
        <div className="w-44 flex-shrink-0 flex flex-col gap-1">
          <p className="text-[10px] text-muted uppercase tracking-widest mb-1 px-1">Folders</p>
          {FOLDERS.map(f => {
            const count = f.id === 'all'
              ? images.length
              : images.filter(img => img.folder === f.id).length
            return (
              <button key={f.id}
                onClick={() => handleFolderChange(f.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors w-full ${
                  activeFolder === f.id
                    ? 'bg-active text-primary border border-borderlt'
                    : 'text-secondary hover:bg-hover hover:text-primary'
                }`}
              >
                <span style={{ color: activeFolder === f.id ? f.color : undefined }}
                      className="font-mono text-sm flex-shrink-0">{f.icon}</span>
                <span className="text-[13px] flex-1 truncate">{f.label}</span>
                {activeFolder === f.id && (
                  <span className="text-[10px] font-mono text-muted">{count}</span>
                )}
              </button>
            )
          })}

          {/* Upload section — admin only */}
          {isAdmin && (
            <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
              <p className="text-[10px] text-muted uppercase tracking-widest px-1">Upload to</p>
              <select value={uploadFolder} onChange={e => setUploadFolder(e.target.value)}
                className="bg-panel border border-borderlt rounded px-2 py-1.5 text-xs text-primary outline-none focus:border-accent">
                {FOLDERS.filter(f => f.id !== 'all').map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
              <input value={uploadLabel} onChange={e => setUploadLabel(e.target.value)}
                placeholder="Label (optional)"
                className="bg-panel border border-borderlt rounded px-2 py-1.5 text-xs text-primary outline-none focus:border-accent placeholder-muted" />
              <button onClick={() => inputRef.current?.click()} disabled={uploading}
                className="btn-accent text-xs py-1.5 flex items-center justify-center gap-1.5 disabled:opacity-40">
                {uploading
                  ? <><span className="inline-block w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Uploading…</>
                  : <>⊕ Add image</>}
              </button>
              <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => handleFiles(e.target.files)} />
            </div>
          )}

          {/* Non-admin notice */}
          {!isAdmin && (
            <div className="mt-3 pt-3 border-t border-border px-1">
              <p className="text-[11px] text-muted leading-relaxed">
                Only admins can upload or delete images.
              </p>
            </div>
          )}
        </div>

        {/* ── Right: image grid ── */}
        <div className="flex-1 min-w-0">

          {error && (
            <p className="text-xs text-red-400 bg-danger/10 border border-danger/25 rounded px-3 py-2 mb-3">
              {error}
              <button onClick={() => setError('')} className="ml-2 underline">dismiss</button>
            </p>
          )}

          {/* Folder drop zone — admin only */}
          {isAdmin && (
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              className="border border-dashed border-borderlt rounded-lg p-3 mb-3 text-center
                         hover:border-accent-dim hover:bg-accent-bg/50 transition-colors"
            >
              <p className="text-xs text-muted">
                Drop images here → uploads to <span className="text-accent">{
                  FOLDERS.find(f => f.id === uploadFolder)?.label
                }</span> folder
              </p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center min-h-[200px] gap-3 text-muted">
              <span className="inline-block w-5 h-5 border-2 border-borderlt border-t-accent rounded-full animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          )}

          {/* Empty */}
          {!loading && images.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[200px] gap-2 text-muted">
              <span className="font-mono text-4xl text-border">⊡</span>
              <p className="text-sm text-secondary">
                {activeFolder === 'all' ? 'No images uploaded yet' : `No images in ${folderInfo.label}`}
              </p>
              {isAdmin && <p className="text-xs">Use the upload panel on the left to add images</p>}
            </div>
          )}

          {/* Grid */}
          {!loading && images.length > 0 && (
            <div className="grid grid-cols-3 gap-2.5">
              {images.map((img, i) => {
                const folderMeta = FOLDERS.find(f => f.id === img.folder)
                return (
                  <div key={img._id}
                    className="relative group bg-surface border border-border rounded-lg overflow-hidden cursor-pointer hover:border-accent-dim transition-colors"
                    onClick={() => setViewing(i)}
                  >
                    <img
                      src={img.data ? `data:${img.mime_type};base64,${img.data}` : ''}
                      alt={img.label}
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-2">
                      {editingId === img._id ? (
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <input value={editLabel} onChange={e => setEditLabel(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSaveLabel(img._id)}
                            autoFocus
                            className="flex-1 bg-panel border border-borderlt rounded px-1.5 py-0.5 text-xs text-primary outline-none focus:border-accent" />
                          <button onClick={() => handleSaveLabel(img._id)}
                            className="text-xs text-accent px-1">✓</button>
                          <button onClick={() => setEditingId(null)}
                            className="text-xs text-muted px-1">✕</button>
                        </div>
                      ) : (
                        <p className="text-xs text-primary truncate font-medium"
                           onDoubleClick={isAdmin ? e => { e.stopPropagation(); setEditingId(img._id); setEditLabel(img.label) } : undefined}
                           title={isAdmin ? 'Double-click to rename' : img.label}>
                          {img.label}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] font-mono"
                              style={{ color: folderMeta?.color || '#888' }}>
                          {folderMeta?.icon} {folderMeta?.label}
                        </span>
                        <span className="text-[10px] text-muted">
                          {(img.size_bytes / 1024).toFixed(0)} KB
                        </span>
                      </div>
                    </div>

                    {/* Admin actions on hover */}
                    {isAdmin && (
                      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                           onClick={e => e.stopPropagation()}>
                        {/* Move folder */}
                        <select
                          value={img.folder}
                          onChange={e => handleMoveFolder(img._id, e.target.value)}
                          className="bg-black/70 text-white text-[9px] rounded px-1 py-0.5 border border-white/20 outline-none cursor-pointer"
                          title="Move to folder"
                        >
                          {FOLDERS.filter(f => f.id !== 'all').map(f => (
                            <option key={f.id} value={f.id}>{f.label}</option>
                          ))}
                        </select>
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(img._id)}
                          disabled={deleting === img._id}
                          className="w-5 h-5 rounded-full bg-danger/80 text-white text-xs flex items-center justify-center hover:bg-danger"
                        >
                          {deleting === img._id
                            ? <span className="inline-block w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                            : '✕'}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Fullscreen viewer ── */}
      {current && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col"
             onClick={() => setViewing(null)}>
          {/* Viewer toolbar */}
          <div className="flex items-center justify-between px-6 py-3 bg-black/60 flex-shrink-0"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-4">
              <button onClick={() => setViewing(v => Math.max(0, v - 1))}
                disabled={viewing === 0}
                className="text-white text-2xl disabled:opacity-30 hover:text-accent transition-colors px-1">‹</button>
              <div>
                <p className="text-sm font-medium text-white">{current.label}</p>
                <p className="text-xs text-gray-400">
                  {viewing + 1} / {images.length} &nbsp;·&nbsp;
                  <span style={{ color: FOLDERS.find(f => f.id === current.folder)?.color }}>
                    {FOLDERS.find(f => f.id === current.folder)?.label}
                  </span>
                  &nbsp;·&nbsp; {current.uploaded_by}
                </p>
              </div>
              <button onClick={() => setViewing(v => Math.min(images.length - 1, v + 1))}
                disabled={viewing === images.length - 1}
                className="text-white text-2xl disabled:opacity-30 hover:text-accent transition-colors px-1">›</button>
            </div>
            <div className="flex items-center gap-2">
              <a href={`data:${current.mime_type};base64,${current.data}`}
                 download={current.filename}
                 onClick={e => e.stopPropagation()}
                 className="text-xs text-accent hover:text-yellow-400 px-3 py-1.5 border border-accent-bd rounded transition-colors">
                ⬇ Download
              </a>
              {isAdmin && (
                <button onClick={e => { e.stopPropagation(); handleDelete(current._id) }}
                  className="text-xs text-danger hover:text-red-400 px-3 py-1.5 border border-danger/30 rounded transition-colors">
                  ✕ Delete
                </button>
              )}
              <button onClick={() => setViewing(null)}
                className="text-gray-400 hover:text-white text-xl transition-colors ml-2">✕</button>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto"
               onClick={() => setViewing(null)}>
            <img
              src={current.data ? `data:${current.mime_type};base64,${current.data}` : ''}
              alt={current.label}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                       boxShadow: '0 8px 48px rgba(0,0,0,0.8)' }}
            />
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}