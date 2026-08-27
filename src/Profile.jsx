import React, { useState } from 'react';

export default function Profile() {
  const [name, setName] = useState(localStorage.getItem('userName') || 'Athlete');
  const [goal, setGoal] = useState(localStorage.getItem('userGoal') || 'Get stronger');

  const handleSave = () => {
    localStorage.setItem('userName', name);
    localStorage.setItem('userGoal', goal);
    alert('Profile updated!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Profile</h2>
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Goal:</strong> {goal}</p>
      <input type="text" defaultValue={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ width: '100%', marginBottom: '8px' }} />
      <input type="text" defaultValue={goal} onChange={e => setGoal(e.target.value)} placeholder="Fitness goal" style={{ width: '100%' }} />
      <button onClick={handleSave} style={{ width: '100%', padding: '6px 12px' }}>Save Profile</button>
    </div>
  );
}