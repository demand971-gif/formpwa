import { useState, useEffect } from 'react';
import exercises from './extended-exercises.json';

// Core exercise list (first 19 from the original PWA)
const coreExercises = [
  { name: 'Goblet squat', part: 'Legs', eq: 'Dumbbells', level: 'Beginner', icon: '🏋️', color: '#d8ff3e', cues: ['Keep the weight close to your chest.', 'Sit between your hips while keeping your whole foot grounded.', 'Drive the floor away and finish tall.'] },
  { name: 'Push-up', part: 'Chest', eq: 'Bodyweight', level: 'All levels', icon: '↘', color: '#ff9a72', cues: ['Create one straight line from head to heel.', 'Keep elbows about 30–45° from your body.', 'Lower only as far as you can control.'] },
  { name: 'Lat pulldown', part: 'Back', eq: 'Cable', level: 'Beginner', icon: '⇣', color: '#dcd9ef', cues: ['Keep shoulders away from ears.', 'Drive elbows down toward your sides.', 'Control the return—do not let the stack pull you.'] },
  { name: 'Dumbbell row', part: 'Back', eq: 'Dumbbells', level: 'All levels', icon: '↙', color: '#bde9e0', cues: ['Brace your torso and keep ribs down.', 'Pull your elbow toward your back pocket.', 'Pause briefly; lower under control.'] },
  { name: 'Lateral raise', part: 'Shoulders', eq: 'Dumbbells', level: 'Beginner', icon: 'T', color: '#ffe891', cues: ['Use a light, controllable weight.', 'Lead with the elbows and stop near shoulder height.', 'Avoid shrugging or swinging.'] },
  { name: 'Cable crunch', part: 'Core', eq: 'Cable', level: 'Intermediate', icon: '⌒', color: '#d8ff3e', cues: ['Lock your hips and exhale fully.', 'Bring ribs toward pelvis—do not simply hinge.', 'Return slowly while keeping tension.'] },
  { name: 'Reverse lunge', part: 'Glutes', eq: 'Dumbbells', level: 'Beginner', icon: '↶', color: '#ff9a72', cues: ['Step back far enough to keep the front foot planted.', 'Use a slight forward torso angle for more glute bias.', 'Push through the front foot to stand.'] },
  { name: 'Romanian deadlift', part: 'Legs', eq: 'Barbell', level: 'Intermediate', icon: '⌞', color: '#bde9e0', cues: ['Soften your knees, then push hips back.', 'Keep the bar close and spine long.', 'Stop when hamstrings limit the hinge.'] },
  { name: 'Hammer curl', part: 'Biceps', eq: 'Dumbbells', level: 'Beginner', icon: '↟', color: '#dcd9ef', cues: ['Keep palms facing inward.', 'Pin elbows near your sides.', 'Avoid leaning back to move the weight.'] },
  { name: 'Triceps pushdown', part: 'Triceps', eq: 'Cable', level: 'Beginner', icon: '⇊', color: '#ffe891', cues: ['Set shoulders down and keep elbows still.', 'Extend fully without moving your upper arm.', 'Control the cable on the way up.'] },
  { name: 'Hip thrust', part: 'Glutes', eq: 'Barbell', level: 'Intermediate', icon: '⌃', color: '#ff9a72', cues: ['Tuck your chin and keep ribs down.', 'Drive through the whole foot.', 'Finish with glutes—not lower-back extension.'] },
  { name: 'Plank', part: 'Core', eq: 'Bodyweight', level: 'Beginner', icon: '━', color: '#d8ff3e', cues: ['Stack elbows below shoulders.', 'Squeeze glutes and gently tuck pelvis.', 'Breathe behind the brace; stop before form fades.'] },
  { name: 'Dumbbell bench press', part: 'Chest', eq: 'Dumbbells', level: 'Beginner', icon: '↥', color: '#ff9a72', cues: ['Plant both feet and keep your upper back supported.', 'Lower the dumbbells with elbows about 45° from your torso.', 'Press up while keeping wrists stacked over elbows.'] },
  { name: 'Incline push-up', part: 'Chest', eq: 'Bodyweight', level: 'Beginner', icon: '↗', color: '#ffe891', cues: ['Place hands on a stable bench and form a straight body line.', 'Lower your chest toward the edge without dropping your hips.', 'Press the bench away and fully control every repetition.'] },
  { name: 'Cable fly', part: 'Chest', eq: 'Cable', level: 'Intermediate', icon: '↔', color: '#d8ff3e', cues: ['Use a split stance and keep ribs stacked over hips.', 'Maintain a soft elbow bend as you bring the handles together.', 'Open only until you feel a controlled chest stretch.'] },
  { name: 'Overhead press', part: 'Shoulders', eq: 'Dumbbells', level: 'Intermediate', icon: '⇧', color: '#dcd9ef', cues: ['Brace your core and begin with weights near shoulder height.', 'Press upward without arching your lower back.', 'Finish with arms overhead and shoulders comfortable.'] },
  { name: 'Front raise', part: 'Shoulders', eq: 'Dumbbells', level: 'Beginner', icon: '↑', color: '#bde9e0', cues: ['Stand tall with light dumbbells in front of your thighs.', 'Raise with nearly straight arms to shoulder height.', 'Lower slowly without swinging or leaning back.'] },
  { name: 'Barbell curl', part: 'Biceps', eq: 'Barbell', level: 'Beginner', icon: '⌣', color: '#ffe891', cues: ['Stand tall with elbows close to your sides.', 'Curl the bar without driving your elbows forward.', 'Squeeze briefly and lower until your arms are extended.'] },
  { name: 'Overhead triceps extension', part: 'Triceps', eq: 'Dumbbells', level: 'Intermediate', icon: '⇈', color: '#ff9a72', cues: ['Hold one dumbbell securely overhead with ribs down.', 'Bend only at the elbows and lower behind your head.', 'Extend the elbows without letting them flare excessively.'] },
  { name: 'Dead bug', part: 'Core', eq: 'Bodyweight', level: 'Beginner', icon: '✣', color: '#bde9e0', cues: ['Press your lower back gently into the floor.', 'Extend the opposite arm and leg without losing your brace.', 'Return to center slowly, then alternate sides.'] },
];

export default function ExerciseLibrary() {
  const [partFilter, setPartFilter] = useState('');
  const [eqFilter, setEqFilter] = useState('');
  const [search, setSearch] = useState('');

  // filtered list from extended database
  const filteredExtended = exercises
    .filter(ex => {
      const partMatch = !partFilter || ex.part.toLowerCase().includes(partFilter.toLowerCase());
      const eqMatch = !eqFilter || ex.eq.toLowerCase().includes(eqFilter.toLowerCase());
      const searchMatch = !search || ex.name.toLowerCase().includes(search.toLowerCase());
      return partMatch && eqMatch && searchMatch;
    })
    .slice(0, 48); // first 48 after filters

  // core exercises (already limited)
  const filteredCore = coreExercises.filter(ex => {
    const partMatch = !partFilter || ex.part.toLowerCase().includes(partFilter.toLowerCase());
    const eqMatch = !eqFilter || ex.eq.toLowerCase().includes(eqFilter.toLowerCase());
    const searchMatch = !search || ex.name.toLowerCase().includes(search.toLowerCase());
    return partMatch && eqMatch && searchMatch;
  });

  const parts = ['All', ...['Chest','Back','Shoulders','Biceps','Triceps','Core','Legs','Cardio']);
  const equipments = ['All', ...['Bodyweight','Dumbbells','Cable','Barbell','Machine']];

  return (
    <section style={{ padding: '2rem' }}>
      <h2>Exercise Library</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>Part: 
          <select onChange={e => setPartFilter(e.target.value)} style={{ marginRight: '8px' }}>
            {parts.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label>Equipment: 
          <select onChange={e => setEqFilter(e.target.value)} style={{ marginRight: '8px' }}>
            {equipments.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <label>Search: 
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type to search..."
            style={{ marginLeft: '8px' }}
          />
        </label>
      </div>

      {/* Core exercises section */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Core exercises (first 19)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {filteredCore.map((ex, i) => (
            <article key={ex.name} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '10px', background: '#faf8f2' }}>
              <h4>{ex.name}</h4>
              <p><strong>Part:</strong> {ex.part} | <strong>Eq:</strong> {ex.eq} | <strong>Level:</strong> {ex.level}</p>
              <p>{ex.cues?.[0] || ''}</p>
            </article>
          ))}
          {filteredCore.length === 0 && <p>No core exercises match the current filters.</p>}
        </div>
      </div>

      {/* Extended library section (first 48 after filters) */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Extended library (first 48)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {filteredExtended.map((ex, i) => (
            <article key={ex.name} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '10px', background: '#faf8f2' }}>
              <h4>{ex.name}</h4>
              <p><strong>Part:</strong> {ex.part} | <strong>Eq:</strong> {ex.eq} | <strong>Level:</strong> {ex.level}</p>
              <p>{ex.cues?.[0] || ''}</p>
            </article>
          ))}
          {filteredExtended.length === 0 && <p>No exercises match the current filters.</p>}
        </div>
      </div>
    </section>
  );
}