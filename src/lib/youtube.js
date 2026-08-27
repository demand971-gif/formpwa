// YouTube link helpers
import youtubeVideos from '../data/youtubeVideos.js'

export function youtubeFor(name) {
  return youtubeVideos[name] || { url: 'https://www.youtube.com/', title: 'Open YouTube' }
}

export function videoIdFromUrl(url) {
  const m = String(url).match(/[?&]v=([^&]+)/)
  return m ? m[1] : null
}

export function watchUrlFor(ex) {
  if (youtubeVideos[ex.name]) return youtubeVideos[ex.name]
  if (ex.yt) return { url: 'https://www.youtube.com/watch?v=' + ex.yt, title: ex.ytTitle || ex.name + ' Tutorial' }
  return { url: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.name + ' exercise proper form tutorial'), title: 'Search ' + ex.name + ' Tutorial' }
}
