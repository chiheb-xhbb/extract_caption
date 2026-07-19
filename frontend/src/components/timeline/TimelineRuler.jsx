import './Timeline.css'

function formatTime(s) {
  if (!isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function TimelineRuler({ duration, timeToPx }) {
  if (!duration) return <div className="timeline-ruler" />

  const totalPx  = timeToPx(duration)
  const minorStep = 1       // every 1s  → minor tick
  const majorStep = 5       // every 5s  → major tick with label

  const ticks = []
  for (let t = 0; t <= duration; t += minorStep) {
    const isMajor = t % majorStep === 0
    const x = timeToPx(t)
    ticks.push(
      <div
        key={t}
        className="timeline-ruler-tick"
        style={{ left: x }}
      >
        {isMajor && (
          <span className="timeline-ruler-label">{formatTime(t)}</span>
        )}
        <div className={isMajor ? 'timeline-ruler-line-major' : 'timeline-ruler-line-minor'} />
      </div>
    )
  }

  return (
    <div className="timeline-ruler" style={{ width: totalPx + 200 }}>
      {ticks}
    </div>
  )
}
