import React, { useState } from 'react';
import GymNameForm from './GymNameForm';
import ExerciseLibrary from './ExerciseLibrary';
import NavBar from './NavBar';
import Settings from './Settings';
import Profile from './Profile';
import './App.css';

function App() {
  const [view, setView] = useState('home');

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <>
            <GymNameForm />
            <ExerciseLibrary />
          </>
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <div className="left-stopper"></div>
      <div className="right-stopper"></div>
      <div className="content">
        <NavBar setView={setView} />
        {renderContent()}
      </div>
    </div>
  );
}

export default App;