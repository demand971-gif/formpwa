import { useState } from 'react'
import { videoIdFromUrl } from '../lib/youtube.js'

export default function YouTubeModal({ yt, onClose, onToast }) {
  const [copied, setCopied] = useState(false)
  const [copyMsg, setCopyMsg] = useState('')
  const id = videoIdFromUrl(yt.url)

  const copy = async () => {
    let ok = false
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(yt.url); ok = true }
    } catch (err) {}
    if (ok) {
      setCopied(true); setCopyMsg('LINK COPIED TO CLIPBOARD'); onToast('YouTube link copied')
      setTimeout(() => { setCopied(false); setCopyMsg('') }, 2200)
    } else {
      setCopyMsg('LINK SELECTED — PRESS CTRL+C OR LONG-PRESS TO COPY'); onToast('Link selected for manual copy')
    }
  }

  return (
    <div className="modal open" id="youtubeModal" onClick={(e) => { if (e.target.id === 'youtubeModal') onClose() }}>
      <div className="sheet">
        <button className="close" id="closeYoutubeModal" onClick={onClose}>×</button>
        <div className="micro">Video tutorial</div>
        <h2 id="youtubeTitle">{yt.title || 'Exercise tutorial'}</h2>
        <iframe className="youtube-frame" id="youtubeFrame"
          src={id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` : 'about:blank'}
          title="YouTube exercise tutorial"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen />
        <a className="youtube-direct" id="youtubeDirect" href={yt.url} target="_blank" rel="noopener noreferrer">OPEN THIS VIDEO IN YOUTUBE ↗</a>
        <div className="micro" style={{ textAlign: 'center', marginTop: 9, lineHeight: 1.5 }}>External tabs work when the app is opened outside the embedded file viewer.</div>
        <input className="youtube-url" id="youtubeUrlField" value={yt.url} readOnly aria-label="Direct YouTube video URL" />
        <button className="media-tab" id="copyYoutubeLink" type="button" style={{ width: '100%', marginTop: 9 }} onClick={copy}>
          {copied ? 'COPIED ✓' : 'COPY YOUTUBE LINK'}
        </button>
        <div className="micro" id="copyStatus" style={{ textAlign: 'center', marginTop: 8 }}>{copyMsg}</div>
      </div>
    </div>
  )
}
