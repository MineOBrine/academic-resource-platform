import { FaTimes, FaExternalLinkAlt } from 'react-icons/fa'
import '../styles/documentViewer.css'

export default function DocumentViewer({ fileUrl, title, onClose }) {
  const viewerSrc = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`

  return (
    <div className="viewer-overlay" onClick={onClose}>
      <div className="viewer-modal" onClick={e => e.stopPropagation()}>
        <div className="viewer-header">
          <strong>{title}</strong>
          <div className="viewer-actions">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="viewer-icon-btn"
              title="Open in new tab"
            >
              <FaExternalLinkAlt />
            </a>
            <button className="viewer-icon-btn" onClick={onClose} title="Close">
              <FaTimes />
            </button>
          </div>
        </div>
        <iframe
          src={viewerSrc}
          title={title}
          className="viewer-frame"
        />
      </div>
    </div>
  )
}