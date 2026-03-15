import { useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Toolbar from '../components/Toolbar.jsx'
import FormViewer from '../components/FormViewer.jsx'
import XMLUploader from '../components/XMLUploader.jsx'
import PDFHistory from '../components/PDFHistory.jsx'
import ImagePanel from '../components/ImagePanel.jsx'

export default function Dashboard() {
  const [activeForm, setActiveForm]     = useState(null)
  const [documentId, setDocumentId]     = useState(null)
  const [border, setBorder]             = useState(null)   // selected border info
  const [showUploader, setShowUploader] = useState(false)
  const [showHistory, setShowHistory]   = useState(false)
  const [showImages, setShowImages]     = useState(false)
  const [view, setView]                 = useState(null)   // 'forms' | 'history' | 'images'

  function handleUploaded(docId, borderInfo) {
    setDocumentId(docId)
    setBorder(borderInfo)
    setShowUploader(false)
    setView('forms')
    setActiveForm('form1')
  }

  function selectForm(f) {
    setActiveForm(f)
    setView('forms')
    setShowUploader(false)
  }

  function showView(v) {
    setView(v)
    setActiveForm(view === 'forms' ? activeForm : null)
    setShowUploader(false)
  }

  const inForms   = view === 'forms' && !showUploader
  const inHistory = view === 'history'
  const inImages  = view === 'images'

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      <Sidebar
        activeForm={activeForm}
        onSelectForm={selectForm}
        documentId={documentId}
        border={border}
        onUploadClick={() => { setShowUploader(true); setView(null) }}
        onHistoryClick={() => showView('history')}
        onImagesClick={() => showView('images')}
        activeView={view}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {inForms && (
          <Toolbar activeForm={activeForm} documentId={documentId} border={border} />
        )}

        <main className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          {showUploader && (
            <XMLUploader onUploaded={handleUploaded} onCancel={() => setShowUploader(false)} />
          )}
          {inHistory && (
            <PDFHistory onClose={() => setView('forms')} />
          )}
          {inImages && (
            <ImagePanel onClose={() => setView('forms')} />
          )}
          {inForms && (
            <FormViewer activeForm={activeForm} documentId={documentId} border={border} />
          )}
        </main>
      </div>
    </div>
  )
}