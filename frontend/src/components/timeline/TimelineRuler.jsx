import { useMemo } from 'react'
import './Timeline.css'

/**
 * Formats seconds → "M:SS" or "M:SS.D" depending on precision.
 */
function formatTime(s, showDecimal = false) {
  if (!isFinite(s) || s < 0) return '0:00'
  const m   = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  const base = `${m}:${String(sec).padStart(2, '0')}`
  if (showDecimal) {
    const dec = Math.round((s % 1) * 10)
    return `${base}.${dec}`
  }
  return base
}

/**
 * Dynamically picks tick intervals based on the current pixelsPerSecond.
 */
function computeTickIntervals(pxPerSec) {
  // Major/minor step in seconds
  if (pxPerSec >= 400) return { major: 0.5,  minor: 0.1,  showDecimal: true }
  if (pxPerSec >= 200) return { major: 1,    minor: 0.25, showDecimal: true }
  if (pxPerSec >= 100) return { major: 2,    minor: 0.5,  showDecimal: false }
  if (pxPerSec >= 50)  return { major: 5,    minor: 1,    showDecimal: false }
  if (pxPerSec >= 20)  return { major: 10,   minor: 2,    showDecimal: false }
  if (pxPerSec >= 10)  return { major: 30,   minor: 5,    showDecimal: false }
  return                      { major: 60,   minor: 10,   showDecimal: false }
}

/**
 * Thin pure-presentation ruler. Receives timeToPx + raw config.
 */
export function TimelineRuler({ duration, timeToPx, pxPerSec }) {
  const ticks = useMemo(() => {
    if (!duration || !pxPerSec) return []

    const { major, minor, showDecimal } = computeTickIntervals(pxPerSec)
    const items = []
    // Use minor step for iteration, mark majors
    let t = 0
    while (t <= duration + minor * 0.5) {
      const rounded = Math.round(t * 1000) / 1000
      const isMajor = Math.abs(rounded % major) < minor * 0.01
      items.push({ t: rounded, isMajor, showDecimal })
      t += minor
    }
    return items
  }, [duration, pxPerSec])

  if (!duration) return <div className="tl-ruler" />

  return (
    <div className="tl-ruler" style={{ width: timeToPx(duration) + 80 }}>
      {ticks.map(({ t, isMajor, showDecimal }) => (
        <div
          key={t}
          className={`tl-ruler-tick ${isMajor ? 'major' : 'minor'}`}
          style={{ left: timeToPx(t) }}
        >
          {isMajor && (
            <span className="tl-ruler-label">{formatTime(t, showDecimal)}</span>
          )}
        </div>
      ))}
      {/* End‐of‐video marker */}
      <div
        className="tl-ruler-end"
        style={{ left: timeToPx(duration) }}
        title={`End: ${formatTime(duration)}`}
      />
    </div>
  )
}
