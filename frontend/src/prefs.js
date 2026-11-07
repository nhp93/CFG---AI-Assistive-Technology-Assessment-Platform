// Shared storage, navigation, and accessibility preference helpers.
import { useState } from 'react'

export const PALETTES = [
  ['standard', 'Standard', ['#003a8c', '#ffbf00', '#ffffff']],
  ['blue-orange', 'Blue & Orange', ['#0072B2', '#E69F00', '#56B4E9']],
  ['blue-yellow', 'Blue & Yellow', ['#2563EB', '#FACC15', '#475569']],
  ['monochrome', 'Monochrome', ['#000000', '#767676', '#ffffff']],
]

export const navigate = (path) => { window.location.hash = path }

export function load(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value === null ? fallback : JSON.parse(value)
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ }
}

// useState that is saved to localStorage immediately, so it survives navigation and refresh.
export function useStored(key, initial) {
  const [value, setValue] = useState(() => load(key, initial))
  return [value, (next) => { save(key, next); setValue(next) }]
}

const root = document.documentElement
export const applyFontSize = (px) => {
  if (!px) return
  const num = typeof px === 'number' ? px : parseInt(px, 10)
  if (isNaN(num)) return
  const basePct = (num / 16) * 100
  const largePct = basePct * 1.33
  root.style.setProperty('--app-base-font-size', `${basePct}%`)
  root.style.setProperty('--app-large-font-size', `${largePct}%`)
  root.style.setProperty('--text-size', num + 'px')
  save('fontSize', num)
}
export const applyPalette = (name) => { root.dataset.palette = name }
export const applyZoom = (level) => root.style.setProperty('--zoom-multiplier', level)

// Ordered modules list options from least to most assistive: No moves forward, Yes moves back.
// Unordered modules (Contrast) step through every option for comparison.
export const MODULES = [
  { name: 'Magnification', q: 'Can you read this text comfortably?', ordered: true, start: 1,
    options: [16, 20, 24, 28, 32].map((px) => [px + 'px', { fontSize: px }]) },
  { name: 'Contrast', q: 'Can you clearly distinguish this text from its background?', start: 0,
    options: [['Black text on white', { color: '#000', background: '#fff' }], ['White text on black', { color: '#fff', background: '#000' }],
      ['Yellow text on black', { color: '#ff0', background: '#000' }], ['Black text on yellow', { color: '#000', background: '#ff0' }],
      ['Soft dimmed theme', { color: '#ccc', background: '#333' }]] },
  { name: 'Speech', q: 'Was that speech easy to understand?', ordered: true, start: 2,
    options: [['1.5×', 1.5], ['1.25×', 1.25], ['1.0×', 1], ['0.75×', 0.75]] },
  { name: 'Cursor', q: 'Can you easily locate and follow the pointer?', ordered: true, start: 0,
    options: [['Normal', 'normal'], ['Large', 'large'], ['Extra-large', 'xl'], ['High-visibility', 'high']] },
]
