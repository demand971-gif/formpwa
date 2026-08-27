export default function InstallModal({ open, status, onClose, onInstallNow }) {
  if (!open) return null
  return (
    <div className="modal open" id="installModal" onClick={(e) => { if (e.target.id === 'installModal') onClose() }}>
      <div className="sheet">
        <button className="close" id="closeInstallModal" type="button" onClick={onClose}>×</button>
        <div className="micro">Progressive web app</div>
        <h2>Install FORM</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.5 }}>FORM is a PWA. Install it to open full-screen, keep your progress, and train even when the network drops.</p>
        <ol className="cues" style={{ paddingLeft: 18 }}>
          <li><strong>Android / Chrome:</strong> tap <em>Install</em> below, or the browser menu → <em>Install app</em> / <em>Add to Home screen</em>.</li>
          <li><strong>iPhone / iPad:</strong> tap the Share button, then <em>Add to Home Screen</em>.</li>
          <li><strong>Desktop:</strong> click the install icon in the address bar, or menu → <em>Install FORM</em>.</li>
        </ol>
        <button className="program-start" id="installNow" type="button" onClick={onInstallNow}>INSTALL THIS DEVICE</button>
        <div className="micro" id="installStatus" style={{ textAlign: 'center', marginTop: 10 }}>{status || 'PWA ready · service worker will register on this origin'}</div>
      </div>
    </div>
  )
}
