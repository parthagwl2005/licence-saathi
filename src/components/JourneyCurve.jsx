import { useEffect, useState } from 'react';

// A gentle curved line with labelled points: the stages of an application.
// labels: short stage names; current: index of the stage in progress; ghost: grey preview when nothing is applied.
export default function JourneyCurve({ labels, current = 0, ghost = false, title }) {
  const n = labels.length;
  const W = 320;
  const pts = labels.map((_, i) => ({ x: 22 + (i * (W - 44)) / (n - 1), y: i % 2 === 0 ? 78 : 42 }));
  // Smooth curve through the points (Catmull-Rom converted to cubic Béziers)
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`;
  }
  const target = ghost ? 0 : (current / (n - 1)) * 100;
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  return (
    <svg viewBox={`0 0 ${W} 112`} className="w-full h-auto" role="img" aria-label={title}>
      <path d={d} fill="none" stroke="rgb(var(--line))" strokeWidth="3" strokeLinecap="round" strokeDasharray={ghost ? '2 7' : undefined} />
      {!ghost && (
        <path
          d={d}
          pathLength="100"
          fill="none"
          stroke="rgb(var(--brand))"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="100"
          strokeDashoffset={100 - drawn}
          style={{ transition: 'stroke-dashoffset 1200ms cubic-bezier(.2,.8,.2,1)' }}
        />
      )}
      {pts.map((p, i) => {
        const done = !ghost && i < current;
        const isCur = !ghost && i === current;
        const below = p.y > 60;
        return (
          <g key={i}>
            {isCur && <circle className="a-pulse" cx={p.x} cy={p.y} r="7" fill="rgb(var(--brand))" />}
            <circle
              cx={p.x}
              cy={p.y}
              r={isCur ? 7.5 : 6}
              fill={done || isCur ? 'rgb(var(--brand))' : 'rgb(var(--surface))'}
              stroke={done || isCur ? 'rgb(var(--brand))' : 'rgb(var(--line))'}
              strokeWidth="2.5"
            />
            {done && <path d={`M${p.x - 3},${p.y} l2.2,2.3 l4,-4.6`} fill="none" stroke="rgb(var(--on-brand))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
            {isCur && <circle cx={p.x} cy={p.y} r="2.6" fill="rgb(var(--on-brand))" />}
            <text
              x={p.x}
              y={below ? p.y + 23 : p.y - 15}
              textAnchor="middle"
              fontSize="11.5"
              fontWeight={isCur ? 700 : 500}
              fill={isCur ? 'rgb(var(--ink))' : 'rgb(var(--muted))'}
              style={{ fontFamily: 'inherit' }}
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
