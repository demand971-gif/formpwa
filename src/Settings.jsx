import React, { useState } from 'react';

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [notifications, setNotifications] = useState(localStorage.getItem('notifications') === 'true');

  const handleSave = () => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('notifications', notifications ? 'true' : 'false');
    alert('Settings saved!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Settings</h2>
      <label style={{ display: 'block', marginBottom: '4px' }}>
        <input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => setTheme('light')} /> Light
      </label>
      <label style={{ display: 'block', marginBottom: '4px' }}>
        <input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} /> Dark
      </label>
      <br />
      <label style={{ display: 'block', marginBottom: '4px' }}>
        <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} /> Enable notifications
      </label>
      <br />
      <button onClick={handleSave} style={{ marginTop: '10px', width: '100%', padding: '6px 12px' }}>Save Settings</button>
    </div>
  );
}