import { useState, useEffect } from 'react';

// Fetch the 1,324‑exercise database from the public folder.
// Vite serves static files under /, so the path is relative to the origin.
async function loadExercises() {
  const res = await fetch('/extended-exercises.json');
  if (!res.ok) throw new Error('Could not load exercise database');
  return res.json();
}

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [partFilter, setPartFilter] = useState('');
  const [eqFilter, setEqFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showDetail, setShowDetail] = useState(null); // null | exercise name

  // Load data once on mount
  useEffect(() => {
    loadExercises().then(setExercises).catch(console.error);
  }, []);

  // ----- filter helpers -----
  const filtered = exercises.filter(ex => {
    const partMatch = !partFilter || ex.part.toLowerCase().includes(partFilter.toLowerCase());
    const eqMatch = !eqFilter || ex.eq.toLowerCase().includes(eqFilter.toLowerCase());
    const searchMatch = !search || ex.name.toLowerCase().includes(search.toLowerCase());
    return partMatch && eqMatch && searchMatch;
  });

  // ----- YouTube lookup (small static map for a few common exercises) -----
  const youtubeMap = {
    'Goblet squat': 'https://www.youtube.com/watch?v=vu0ZfLsHi0E',
    'Push-up': 'https://www.youtube.com/watch?v=WDIpL0pjun0',
    'Lat pulldown': 'https://www.youtube.com/watch?v=SALxEARiMkw',
    'Dumbbell row': 'https://www.youtube.com/watch?v=XwXK6fBskpw',
    'Lateral raise': 'https://www.youtube.com/watch?v=mBtWBogKL8M',
    'Cable crunch': 'https://www.youtube.com/watch?v=ToJeyhydUxU',
    'Reverse lunge': 'https://www.youtube.com/watch?v=u_zSfK5ZFU4',
    'Romanian deadlift': 'https://www.youtube.com/watch?v=_oyxCn2iSjU',
    'Hammer curl': 'https://www.youtube.com/watch?v=G7hy-AxQwcQ',
    'Triceps pushdown': 'https://www.youtube.com/watch?v=_w-HpW70nSQ',
    // fallback: search YouTube for any exercise
  };

  // ----- Plate calculator (Epley formula) -----
  const [calcWeight, setCalcWeight] = useState('');
  const [calcReps, setCalcReps] = useState('');
  const [calcResult, setCalcResult] = useState('');

  const calculateEpley = () => {
    const w = Number(calcWeight);
    const r = Number(calcReps);
    if (isFinite(w) && isFinite(r) && r > 0 && w > 0) {
      const est = Math.round(w * (1 + r / 30) * 10) / 10; // one decimal
      setCalcResult(`Estimated 1RM: ${est} kg`);
    } else {
      setCalcResult('');
    }
  };

  // ----- render exercise cards (first 20 after filter) -----
  const cards = filtered.slice(0, 20).map(ex => (
    <article
      key={ex.name}
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 10,
        background: '#faf8f2',
        cursor: 'pointer',
        marginBottom: 12,
      }}
      onClick={() => setShowDetail(ex.name)}
    >
      <h4 style={{ margin: 0, fontSize: 14 }}>{ex.name}</h4>
      <p style={{ margin: '4px 0', fontSize: 12, color: '#555' }}>
        Part: {ex.part} | Eq: {ex.eq} | Level: {ex.level}
      </p>
      <p style={{ margin: '4px 0', fontSize: 11, color: '#666' }}>
        {ex.cues?.[0] || ''}
      </p>
    </article>
  ));

  // ----- detail panel (simple div‑based popup appears below the grid) -----
  const detail = showDetail ? (
    <section
      style={{
        marginTop: 16,
        padding: 10,
        background: '#faf8f2',
        border: '1px solid #ddd',
        borderRadius: 8,
        maxWidth: 560,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      <h2 style={{ margin: '0 0 5px', fontSize: 20 }}>{showDetail}</h2>
      <p style={{ margin: '2px 0', fontSize: 13, color: '#555' }}>
        Part: {exercises.find(e => e.name === showDetail)?.part || ''} | \
        Eq: {exercises.find(e => e.name === showDetail)?.eq || ''} | \
        Level: {exercises.find(e => e.name === showDetail)?.level || ''}
      </p>
      <h3 style={{ margin: '5px 0 3px', fontSize: 14 }}>Cues</h3>
      <ul style={{ margin: 0, paddingLeft: 12, fontSize: 13 }}>
        {exercises.find(e => e.name === showDetail)?.cues?.map(c => (
          <li key={c}>{c}</li>
        ))}
        {!exercises.find(e => e.name === showDetail)?.cues?.length && (
          <li>No cues available.</li>
        )}
      </ul>

      {/* YouTube link */}
      <a
        href={youtubeMap[showDetail] || 'https://www.youtube.com/results?search_query=' + encodeURIComponent(showDetail + ' exercise proper form tutorial')}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          marginTop: 8,
          padding: '5px 8px',
          background: '#ff6b35',
          color: 'white',
          borderRadius: 6,
          fontSize: 13,
          textDecoration: 'none',
        }}
      >
        Watch YouTube tutorial →
      </a>

      {/* Plate calculator */}
      <div style={{ marginTop: 8, fontSize: 13 }}>
        <label style={{ marginRight: 8 }}>Weight (kg)</label>
        <input
          type="number"
          value={calcWeight}
          onChange={e => setCalcWeight(e.target.value)}
          style={{ marginBottom: 5, padding: 3, width: 80 }}
        />
        <label style={{ marginLeft: 8, marginRight: 8 }}>Reps</label>
        <input
          type="number"
          value={calcReps}
          onChange={e => setCalcReps(e.target.value)}
          style={{ marginBottom: 5, padding: 3, width: 50 }}
        />
        <button onClick={calculateEpley} style={{ padding: '4px 8px', fontSize: 12 }}>
          Calculate 1RM
        </button>
        {calcResult && <p>{calcResult}</p>}
      </div>

      <button
        style={{
          marginTop: 10,
          width: '100%',
          padding: '6px',
          background: '#2b2d42',
          color: 'white',
          border: 0,
          borderRadius: 6,
          fontSize: 14,
          cursor: 'pointer',
        }}
        onClick={() => setShowDetail(null)}
      >
        Close
      </button>
    </section>
  ) : null;

  return (
    <section style={{ padding: '20px' }}>
      <h2>Exercise Library (1,324 movements)</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>Part:
          <select
            onChange={e => setPartFilter(e.target.value)}
            style={{ marginRight: 8, padding: 4, fontSize: 12 }}
          >
            <option value="">All</option>
            <option value="Legs">Legs</option>
            <option value="Chest">Chest</option>
            <option value="Back">Back</option>
            <option value="Shoulders">Shoulders</option>
            <option value="Biceps">Biceps</option>
            <option value="Triceps">Triceps</option>
            <option value="Core">Core</option>
            <option value="Cardio">Cardio</option>
          </select>
        </label>

        <label>Equipment:
          <select
            onChange={e => setEqFilter(e.target.value)}
            style={{ marginRight: 8, padding: 4, fontSize: 12 }}
          >
            <option value="">All</option>
            <option value="Bodyweight">Bodyweight</option>
            <option value="Dumbbells">Dumbbells</option>
            <option value="Cable">Cable</option>
            <option value="Barbell">Barbell</option>
            <option value="Machine">Machine</option>
          </select>
        </label>

        <label>Search:
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type to search..."
            style={{ padding: 4, fontSize: 12 }}
          />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {cards}
        {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>No exercises match the current filters.</p>}
      </div>

      {/* Simple detail panel – appears below the grid when an exercise is clicked */}
      {detail}
    </section>
  );
}