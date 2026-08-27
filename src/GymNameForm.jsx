import { useState } from 'react';

function GymNameForm() {
  const [name, setName] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Gym app name: ${name}`);
  };
  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 300,
        margin: '2rem auto',
        padding: 1rem,
        border: '1px solid #ccc',
        borderRadius: 8,
      }}
    >
      <h2>Create Gym App</h2>
      <label htmlFor="appName">App name:</label>
      <input
        id="appName"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button type="submit">Save name</button>
    </form>
  );
}

export default GymNameForm;