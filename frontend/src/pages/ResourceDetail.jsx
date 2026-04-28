import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FaDownload, FaExternalLinkAlt, FaTrash, FaArrowLeft, FaUser, FaCalendar, FaFileAlt, FaTag } from 'react-icons/fa'
import Layout from '../components/Layout'
import { toast } from '../utils/toast'
import { useAuth } from '../contexts/AuthContext'
import { resourceService } from '../services/resourceService'
import Tag from '../components/Tag'
import '../styles/pages/resourceDetail.css'

export default function ResourceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()

  const [resource, setResource] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    resourceService.getAll()
      .then(data => {
        const found = (data.resources || []).find(r => r._id === id)
        if (found) setResource(found)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const handleDownload = async () => {
      try {
          const url = resourceService.getFileUrl(resource.fileUrl)
          const response = await fetch(url)
          const blob = await response.blob()
          const blobUrl = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = blobUrl
          a.download = resource.title + '.pdf'
          document.body.appendChild(a)
          a.click()
          a.remove()
          window.URL.revokeObjectURL(blobUrl)
          toast.success('Download started!')
      } catch {
          toast.error('Download failed.')
      }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this resource?')) return
    try {
      await resourceService.delete(resource._id)
      toast.success('Resource deleted.')
      navigate('/resources')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.')
    }
  }

  const canDelete =
    isAdmin ||
    (resource?.uploadedBy?._id || resource?.uploadedBy) === (user?._id || user?.id)

  const formatDate = (ts) =>
    new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const getFileType = (filename) => {
    if (!filename) return 'Unknown'
    const ext = filename.split('.').pop()?.toUpperCase()
    return ext || 'File'
  }

  if (loading) return (
    <Layout>
      <div className="detail-loading"><span className="spinner" /></div>
    </Layout>
  )

  if (notFound) return (
    <Layout>
      <div className="detail-not-found">
        <FaFileAlt size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
        <h2>Resource not found</h2>
        <p>This resource may have been deleted.</p>
        <Link to="/resources" className="btn-primary" style={{ marginTop: 20 }}>
          Back to Resources
        </Link>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <Link to="/resources" className="detail-back">
        <FaArrowLeft /> Back to Resources
      </Link>

      <div className="detail-layout">

        <div className="detail-main">
          <div className="detail-card">
            <div className="detail-header">
              {resource.subject && <Tag label={resource.subject} />}
              <h1 className="detail-title">{resource.title}</h1>
              {resource.description && (
                <p className="detail-description">{resource.description}</p>
              )}
            </div>

            <div className="detail-divider" />

            <div className="detail-meta">
              <div className="meta-item">
                <FaUser className="meta-icon" />
                <div>
                  <span className="meta-label">Uploaded by</span>
                  <span className="meta-value">{resource.uploadedBy?.name || 'Unknown'}</span>
                </div>
              </div>
              <div className="meta-item">
                <FaCalendar className="meta-icon" />
                <div>
                  <span className="meta-label">Date uploaded</span>
                  <span className="meta-value">{formatDate(resource.createdAt)}</span>
                </div>
              </div>
              <div className="meta-item">
                <FaFileAlt className="meta-icon" />
                <div>
                  <span className="meta-label">File type</span>
                  <span className="meta-value">{getFileType(resource.fileUrl)}</span>
                </div>
              </div>
              {resource.subject && (
                <div className="meta-item">
                  <FaTag className="meta-icon" />
                  <div>
                    <span className="meta-label">Subject</span>
                    <span className="meta-value">{resource.subject}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="detail-actions-card">
            <h3>Actions</h3>
            <button className="btn-primary detail-download-btn" onClick={handleDownload}>
              <FaDownload /> Download Resource
            </button>
            {canDelete && (
              <button className="detail-delete-btn" onClick={handleDelete}>
                <FaTrash /> Delete Resource
              </button>
            )}
            <div className="detail-actions-divider" />
            <Link to="/resources" className="btn-ghost detail-back-btn">
              <FaArrowLeft /> Browse More
            </Link>
          </div>
        </div>

      </div>
    </Layout>
  )
}