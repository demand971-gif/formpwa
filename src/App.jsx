import React from 'react';
import GymNameForm from './GymNameForm';
import ExerciseLibrary from './ExerciseLibrary';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="left-stopper"></div>
      <div className="right-stopper"></div>
      <div className="content">
        <GymNameForm />
        <ExerciseLibrary />
      </div>
    </div>
  );
}

export default App;