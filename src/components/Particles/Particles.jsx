import './Particles.css'
import { useEffect, useRef } from "react";
export default function Particles() {
  const c = useRef();
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = c.current,
      x = cv.getContext("2d");
    let w,
      h,
      raf,
      P = [],
      m = { x: -999, y: -999 };
    const rs = () => {
      w = cv.width = cv.offsetWidth;
      h = cv.height = cv.offsetHeight;
      P = Array.from({ length: Math.min(70, Math.floor(w / 18)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        a: Math.random() * 0.6 + 0.2,
      }));
    };
    const mm = (e) => {
      const b = cv.getBoundingClientRect();
      m = { x: e.clientX - b.left, y: e.clientY - b.top };
    };
    rs();
    addEventListener("resize", rs);
    addEventListener("mousemove", mm);
    const loop = () => {
      x.clearRect(0, 0, w, h);
      for (const p of P) {
        const dx = p.x - m.x,
          dy = p.y - m.y,
          d = Math.hypot(dx, dy) || 1;
        if (d < 110) {
          p.x += (dx / d) * 1.6;
          p.y += (dy / d) * 1.6;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -5) {
          p.y = h + 5;
          p.x = Math.random() * w;
        }
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        x.beginPath();
        x.fillStyle = `rgba(226,190,120,${p.a})`;
        x.shadowBlur = 10;
        x.shadowColor = "#e2be78";
        x.arc(p.x, p.y, p.r, 0, 7);
        x.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", rs);
      removeEventListener("mousemove", mm);
    };
  }, []);
  return <canvas ref={c} className="particles" />;
}
