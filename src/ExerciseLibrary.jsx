export default function ExerciseLibrary() {
  // Static list of the first 10 exercise names (core selection)
  const coreExercises = [
    'Goblet squat',
    'Push-up',
    'Lat pulldown',
    'Dumbbell row',
    'Lateral raise',
    'Cable crunch',
    'Reverse lunge',
    'Romanian deadlift',
    'Hammer curl',
    'Triceps pushdown'
  ];

  return (
    <section style={{ padding: '2rem' }}>
      <h2>Exercise Library (first 10)</h2>
      <ul>
        {coreExercises.map(name => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </section>
  );
}