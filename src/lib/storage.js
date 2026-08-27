// localStorage helpers (verbatim from the original app)
export function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch (e) { return fallback }
}
export function saveJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)) }
export function loadProgress() { return loadJSON('form-progress', {}) }
export function saveProgress(data) { localStorage.setItem('form-progress', JSON.stringify(data)) }
export function prs() { return loadJSON('form-prs', {}) }
