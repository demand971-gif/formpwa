// WebAudio cues (verbatim from the original app)
let soundOn = localStorage.getItem('form-sound') !== 'off'
let audioCtx = null

export function getSoundOn() { return soundOn }
export function setSoundOn(v) { soundOn = v; localStorage.setItem('form-sound', v ? 'on' : 'off') }

export function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  if (audioCtx.state === 'suspended') audioCtx.resume()
}

export function beep(freq = 880, dur = 0.12, type = 'sine', vol = 0.07) {
  if (!soundOn) return
  try {
    ensureAudio()
    const o = audioCtx.createOscillator(), g = audioCtx.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.value = vol
    o.connect(g)
    g.connect(audioCtx.destination)
    o.start()
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur)
    o.stop(audioCtx.currentTime + dur)
  } catch (err) {}
}

export function cueStart() { beep(660, .09); setTimeout(() => beep(880, .12), 90) }
export function cueRest() { beep(392, .16, 'triangle') }
export function cueDone() { beep(523, .09); setTimeout(() => beep(659, .09), 80); setTimeout(() => beep(784, .16), 160) }
