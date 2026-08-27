export default function TopBar({ theme, onThemeToggle, onOpenInstall }) {
  return (
    <header className="topbar">
      <div className="brand"><span className="brand-mark">F</span> FORM</div>
      <nav className="nav">
        <a className="active" href="#train">Train</a>
        <a href="#library">Exercises</a>
        <a href="#plans">Programs</a>
        <a href="#studio">Tools</a>
        <a href="#progress">Progress</a>
      </nav>
      <div className="profile">
        <button className="theme-btn" id="themeToggle" type="button" onClick={onThemeToggle}>{theme === 'dark' ? 'LIGHT' : 'DARK'}</button>
        <button className="install-chip" id="openInstall" type="button" onClick={onOpenInstall}>INSTALL APP</button>
        <span>Hey, Athlete</span>
        <div className="avatar">A</div>
      </div>
    </header>
  )
}
