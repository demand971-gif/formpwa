import React from 'react';
import './App.css';

export default function NavBar({ setView }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', margin: '8px 0', background: 'rgba(0,0,0,0.05)', padding: '6px 0' }}>
      <button onClick={() => setView('home')} style={{ padding: '6px 10px', cursor: 'pointer', background: 'var(--primary, #007bff)', color: 'white', borderRadius: 4 }}'>Home</button>
      <button onClick={() => setView('settings')} style={{ padding: '6px 10px', cursor: 'pointer', background: 'var(--primary, #007bff)', color: 'white', borderRadius: 4 }}>Settings</button>
      <button onClick={() => setView('profile')} style={{ padding: '6px 10px', cursor: 'pointer', background: 'var(--primary, #007bff)', color: 'white', borderRadius: 4 }}>Profile</button>
    </div>
  );
}