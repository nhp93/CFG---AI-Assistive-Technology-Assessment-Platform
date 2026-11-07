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
export const applyFontSize = (px) => root.style.setProperty('--text-size', px + 'px')
export const applyPalette = (name) => { root.dataset.palette = name }
export const applyZoom = (level) => root.style.setProperty('--zoom-multiplier', level)
