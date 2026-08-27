import { useState } from 'react';
import GymNameForm from './GymNameForm';
import ExerciseLibrary from './ExerciseLibrary';
import './App.css';

function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <GymNameForm />
      <ExerciseLibrary />
    </div>
  );
}

export default App;