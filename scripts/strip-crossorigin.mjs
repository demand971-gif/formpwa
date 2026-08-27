// Post-build: remove `crossorigin` attributes from dist/index.html.
//
// The Android WebView (WebViewAssetLoader) serves assets through a synthetic
// response without CORS headers. With the `crossorigin` attribute present,
// the module script and stylesheet become CORS requests and are silently
// blocked on-device — blank/unstyled app. Without it, everything loads.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const file = path.join(root, 'dist', 'index.html')
let html = readFileSync(file, 'utf8')
const stripped = html.replace(/ crossorigin/g, '')
if (stripped !== html) {
  writeFileSync(file, stripped)
  console.log('stripped crossorigin attributes from dist/index.html')
} else {
  console.log('no crossorigin attributes found — nothing to strip')
}
