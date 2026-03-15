import { useState, useRef } from 'react'
import { uploadXML } from '../services/api.js'

export default function XMLUploader({ onUploaded, onCancel }) {
  const [dragging, setDragging]   = useState(false)
  const [file, setFile]           = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')
  const inputRef                  = useRef()

  function validateAndSet(f) {
    if (!f.name.endsWith('.xml')) { setError('Only .xml files are accepted.'); return }
    setError('')
    setFile(f)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files[0]) validateAndSet(e.dataTransfer.files[0])
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const res = await uploadXML(file)
      onUploaded(res.data.document_id)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full max-w-lg flex flex-col gap-5 animate-[fadeUp_0.25s_ease]">

      <div className="text-center">
        <h2 className="text-xl font-semibold text-primary mb-1">Upload XML File</h2>
        <p className="text-sm text-secondary">Upload an invoice or shipment XML to auto-populate forms</p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          min-h-[180px] rounded-lg border-2 border-dashed cursor-pointer
          flex items-center justify-center transition-colors
          ${dragging ? 'border-accent bg-accent-bg' : ''}
          ${file    ? 'border-accent-bd bg-accent-bg border-solid' : ''}
          ${!dragging && !file ? 'border-borderlt bg-surface hover:border-accent-dim hover:bg-accent-bg' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xml"
          className="hidden"
          onChange={e => e.target.files[0] && validateAndSet(e.target.files[0])}
        />

        {file ? (
          <div className="flex items-center gap-3 w-full px-6">
            <span className="font-mono text-3xl text-accent">⌗</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-primary break-all">{file.name}</p>
              <p className="text-xs text-secondary mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setFile(null) }}
              className="text-muted text-base px-1.5 py-1 rounded transition-colors hover:text-danger hover:bg-danger/10 flex-shrink-0"
            >✕</button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="font-mono text-3xl text-accent block mb-1">↑</span>
            <p className="text-sm font-medium text-primary">Drop XML file here</p>
            <p className="text-xs text-muted">or click to browse</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-danger/10 border border-danger/25 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2.5 justify-end">
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-accent" onClick={handleUpload} disabled={!file || uploading}>
          {uploading ? 'Uploading…' : 'Upload & Parse'}
        </button>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}