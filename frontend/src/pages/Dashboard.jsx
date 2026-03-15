import { useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Toolbar from '../components/Toolbar.jsx'
import FormViewer from '../components/FormViewer.jsx'
import XMLUploader from '../components/XMLUploader.jsx'
import PDFHistory from '../components/PDFHistory.jsx'

export default function Dashboard() {
  const [activeForm, setActiveForm]     = useState(null)
  const [documentId, setDocumentId]     = useState(null)
  const [showUploader, setShowUploader] = useState(false)
  const [showHistory, setShowHistory]   = useState(false)

  function handleUploaded(docId) {
    setDocumentId(docId)
    setShowUploader(false)
    setShowHistory(false)
    setActiveForm('form1')
  }

  function handleShowHistory() {
    setShowHistory(true)
    setShowUploader(false)
    setActiveForm(null)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      <Sidebar
        activeForm={activeForm}
        onSelectForm={f => { setActiveForm(f); setShowHistory(false); setShowUploader(false) }}
        documentId={documentId}
        onUploadClick={() => { setShowUploader(true); setShowHistory(false) }}
        onHistoryClick={handleShowHistory}
        showHistory={showHistory}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        {!showHistory && (
          <Toolbar activeForm={activeForm} documentId={documentId} />
        )}

        <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          {showUploader && (
            <XMLUploader onUploaded={handleUploaded} onCancel={() => setShowUploader(false)} />
          )}
          {showHistory && (
            <PDFHistory onClose={() => setShowHistory(false)} />
          )}
          {!showUploader && !showHistory && (
            <FormViewer activeForm={activeForm} documentId={documentId} />
          )}
        </main>
      </div>
    </div>
  )
}