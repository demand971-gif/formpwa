export default function Hero({ streak }) {
  return (
    <section className="hero" id="train">
      <div className="eyebrow">Your training space · live v5</div>
      <h1>MOVE BETTER.<br />GET STRONGER.</h1>
      <div className="hero-bottom">
        <div className="hero-copy">Choose a body area, discover smart exercise variations, and train at your own level—with cues that keep every rep intentional.</div>
        <div className="streak">
          <div className="streak-num" id="streakNum">{String(streak).padStart(2, '0')}</div>
          <div className="streak-label">day<br />streak</div>
        </div>
      </div>
    </section>
  )
}
