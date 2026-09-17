const PARTICLES = [
  { top: "18%", left: "12%", size: 6, dx: 14, dy: -20, duration: 7 },
  { top: "28%", left: "82%", size: 4, dx: -10, dy: -16, duration: 9 },
  { top: "62%", left: "6%", size: 5, dx: 16, dy: 18, duration: 8 },
  { top: "74%", left: "90%", size: 7, dx: -14, dy: 14, duration: 6.5 },
  { top: "10%", left: "48%", size: 3, dx: 8, dy: 12, duration: 10 },
  { top: "85%", left: "40%", size: 4, dx: -12, dy: -10, duration: 7.5 },
  { top: "45%", left: "94%", size: 3, dx: 10, dy: -14, duration: 8.5 },
  { top: "52%", left: "24%", size: 5, dx: -8, dy: 16, duration: 9.5 },
];

export default function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="particle"
          style={
            {
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              "--drift-x": `${p.dx}px`,
              "--drift-y": `${p.dy}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
