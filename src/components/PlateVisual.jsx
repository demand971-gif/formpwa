// Plate visual — barbell with plates (React port of renderPlateVisualHTML)
export default function PlateVisual({ plates, scale = 1 }) {
  if (!plates || !plates.length) {
    return <div style={{ display: 'flex', alignItems: 'center', color: '#888', fontSize: 12, height: 72 }}>Empty bar · no plates needed</div>
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: '#171816', padding: '4px 8px', borderRadius: 10 }}>
      <div style={{ width: 20, height: 12, background: '#777', borderRadius: 2 }} />
      <div style={{ width: 10, height: 52, background: '#aaa', borderRadius: 3, border: '1px solid #555', marginRight: 4 }} />
      {plates.map((p, i) => (
        <div key={i}
          title={p.name}
          style={{
            width: Math.round(p.width * scale),
            height: Math.round(p.height * scale),
            background: p.color,
            color: p.text,
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: p.weight >= 10 ? '9px' : '7px',
            fontWeight: 900,
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            userSelect: 'none',
            boxShadow: 'inset 0 0 3px rgba(0,0,0,0.3)',
          }}>
          {p.weight}
        </div>
      ))}
      <div style={{ width: 14, height: 12, background: '#777', borderRadius: 2, marginLeft: 3 }} />
    </div>
  )
}
