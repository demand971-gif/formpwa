// Muscle-group body maps (SVGs extracted verbatim from the original app)
import { labelsByView } from '../dataBundle.js'

export default function BodyMap({ view, part, onChoosePart }) {
  return (
    <aside className="panel body-panel">
      <div className="panel-head">
        <div><div className="micro">Explore by</div><h2>Muscle group</h2></div>
        <div className="view-toggle" role="tablist" aria-label="Body side">
          <button className={view === 'Front' ? 'on' : ''} type="button" onClick={() => onChoosePart('__view_front__')} aria-pressed={view === 'Front'}>Front</button>
          <button className={view === 'Back' ? 'on' : ''} type="button" onClick={() => onChoosePart('__view_back__')} aria-pressed={view === 'Back'}>Back</button>
        </div>
      </div>
      <div className="figure-wrap" id="figureWrap">
<svg id="frontMap" className="body-svg" hidden={view !== 'Front'} viewBox="0 0 220 470" aria-label="Front body map">
        <circle className="body-base" cx="110" cy="34" r="25"/><path className="body-base" d="M78 72 Q110 55 142 72 L152 178 Q146 220 135 247 L127 426 Q118 447 110 426 L105 264 L95 426 Q86 447 78 426 L85 247 Q74 215 68 178Z"/><path className="body-base" d="M74 79 Q56 92 51 129 L37 233 Q38 249 47 238 L67 151Z"/><path className="body-base" d="M146 79 Q164 92 169 129 L183 233 Q182 249 173 238 L153 151Z"/>
        <path data-part="Chest" className="muscle" d="M80 82 Q95 70 108 84 L107 129 Q88 130 77 114Z"/><path data-part="Chest" className="muscle" d="M140 82 Q125 70 112 84 L113 129 Q132 130 143 114Z"/>
        <path data-part="Shoulders" className="muscle" d="M77 78 Q61 83 57 101 L71 112 L80 88Z"/><path data-part="Shoulders" className="muscle" d="M143 78 Q159 83 163 101 L149 112 L140 88Z"/>
        <path data-part="Biceps" className="muscle" d="M58 106 L70 115 L61 176 L49 171Z"/><path data-part="Biceps" className="muscle" d="M162 106 L150 115 L159 176 L171 171Z"/>
        <path data-part="Core" className="muscle" d="M89 134 L108 134 L107 210 L88 208Z"/><path data-part="Core" className="muscle" d="M112 134 L131 134 L132 208 L113 210Z"/>
        <path data-part="Legs" className="muscle" d="M85 236 Q97 244 106 239 L103 333 L79 331Z"/><path data-part="Legs" className="muscle" d="M135 236 Q123 244 114 239 L117 333 L141 331Z"/><path data-part="Legs" className="muscle" d="M79 337 L102 338 L99 424 L77 424Z"/><path data-part="Legs" className="muscle" d="M141 337 L118 338 L121 424 L143 424Z"/>
        </svg>
<svg id="backMap" className="body-svg" viewBox="0 0 220 470" hidden aria-label="Back body map">
        <circle className="body-base" cx="110" cy="34" r="25"/><path className="body-base" d="M78 72 Q110 55 142 72 L152 178 Q146 220 135 247 L127 426 Q118 447 110 426 L105 264 L95 426 Q86 447 78 426 L85 247 Q74 215 68 178Z"/><path className="body-base" d="M74 79 Q56 92 51 129 L37 233 Q38 249 47 238 L67 151Z"/><path className="body-base" d="M146 79 Q164 92 169 129 L183 233 Q182 249 173 238 L153 151Z"/>
        <path className="body-base" d="M110 72 L110 186" fill="none" stroke="#c5c2b8" stroke-width="2"/>
        <path data-part="Back" className="muscle" d="M84 76 Q110 64 136 76 L138 118 Q110 132 82 118Z"/>
        <path data-part="Back" className="muscle" d="M78 118 L108 124 L105 186 L76 168Z"/>
        <path data-part="Back" className="muscle" d="M142 118 L112 124 L115 186 L144 168Z"/>
        <path data-part="Shoulders" className="muscle" d="M77 78 Q61 83 57 101 L71 112 L80 88Z"/>
        <path data-part="Shoulders" className="muscle" d="M143 78 Q159 83 163 101 L149 112 L140 88Z"/>
        <path data-part="Triceps" className="muscle" d="M58 106 L70 115 L61 176 L49 171Z"/>
        <path data-part="Triceps" className="muscle" d="M162 106 L150 115 L159 176 L171 171Z"/>
        <path data-part="Glutes" className="muscle" d="M84 186 Q110 198 136 186 L140 232 Q110 252 80 232Z"/>
        <path data-part="Legs" className="muscle" d="M82 236 Q97 246 106 240 L103 333 L78 330Z"/>
        <path data-part="Legs" className="muscle" d="M138 236 Q123 246 114 240 L117 333 L142 330Z"/>
        <path data-part="Legs" className="muscle" d="M79 337 L102 338 L99 424 L77 424Z"/>
        <path data-part="Legs" className="muscle" d="M141 337 L118 338 L121 424 L143 424Z"/>
        </svg>
      </div>
      <div className="view-hint" id="viewHint">{view} muscles</div>
      <div className="body-labels" id="bodyLabels">
        {labelsByView[view].map(p => (
          <button key={p} type="button" data-part={p} className={p === part ? 'on' : ''} onClick={() => onChoosePart(p)}>{p}</button>
        ))}
      </div>
    </aside>
  )
}
