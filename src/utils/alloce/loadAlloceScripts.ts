/**
 * Alloce template scripts bind listeners at module evaluation time and inside
 * DOMContentLoaded. In a React SPA those nodes mount later, so we defer loading
 * until after layout mount and replay DOMContentLoaded when needed.
 *
 * Public assets cannot be `import()`-ed through Vite — load them as `<script type="module">`.
 */

const ADMIN_BUNDLE = '/assets/admin.bundle-DOCqQWIh.js'
const MAIN_BUNDLE = '/assets/main-BSp6wgyE.js'

let scriptsPromise: Promise<void> | null = null

function loadModuleScript(src: string): Promise<void> {
  const existing = document.querySelector<HTMLScriptElement>(
    `script[data-alloce-src="${src}"]`,
  )
  if (existing) {
    return existing.dataset.loaded === 'true'
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          existing.addEventListener('load', () => resolve(), { once: true })
          existing.addEventListener(
            'error',
            () => reject(new Error(`Failed to load ${src}`)),
            { once: true },
          )
        })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = src
    script.dataset.alloceSrc = src
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.body.appendChild(script)
  })
}

function patchDomContentLoaded<T>(run: () => Promise<T>): Promise<T> {
  if (document.readyState === 'loading') {
    return run()
  }

  const original = Document.prototype.addEventListener
  Document.prototype.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    if (type === 'DOMContentLoaded') {
      queueMicrotask(() => {
        const event = new Event('DOMContentLoaded')
        if (typeof listener === 'function') {
          listener.call(document, event)
        } else {
          listener.handleEvent(event)
        }
      })
      return
    }
    original.call(this, type, listener, options)
  }

  return run().finally(() => {
    Document.prototype.addEventListener = original
  })
}

/** Re-run Lucide createIcons after React paints new [data-lucide] nodes. */
export function refreshAlloceIcons() {
  const id = 'alloce-refresh-icons'
  document.getElementById(id)?.remove()
  const script = document.createElement('script')
  script.id = id
  script.type = 'module'
  script.textContent = `
    import { t as createIcons, n as icons } from "${ADMIN_BUNDLE}";
    try { createIcons({ icons }); } catch (_) {}
  `
  document.body.appendChild(script)
}

export function loadAlloceScripts(): Promise<void> {
  if (!scriptsPromise) {
    scriptsPromise = patchDomContentLoaded(() => loadModuleScript(MAIN_BUNDLE))
      .then(() => {
        requestAnimationFrame(() => refreshAlloceIcons())
      })
      .catch((error) => {
        console.error('[Alloce] Failed to load template scripts', error)
        scriptsPromise = null
      })
  } else {
    void scriptsPromise.then(() => refreshAlloceIcons())
  }

  return scriptsPromise
}
