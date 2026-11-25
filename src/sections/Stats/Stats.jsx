
import { useEffect, useRef, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import Reveal from "../../components/Reveal/Reveal.jsx";
import SectionShell from "../SectionShell/SectionShell.jsx";
import SectionHead from "../SectionHead/SectionHead.jsx";

import {
  FaTrophy,
  FaHandshake,
  FaBalanceScale,
  FaStar,
} from "react-icons/fa";

import "./Stats.css";

// React Icons mapping
const iconMap = {
  FaTrophy,
  FaHandshake,
  FaBalanceScale,
  FaStar,
};

// Counts up from 0 when scrolled into view
function Counter({ v }) {
  const [n, setN] = useState(0);
  const ref = useRef();

  const m = String(v).match(/^(\D*)(\d[\d,.]*)(.*)$/);

  useEffect(() => {
    if (!m) return;

    const target = parseFloat(m[2].replace(/,/g, ""));

    const o = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;

      o.disconnect();

      const t0 = performance.now();

      const step = (t) => {
        const k = Math.min(1, (t - t0) / 1700);

        setN(target * (1 - Math.pow(1 - k, 3)));

        if (k < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    });

    if (ref.current) o.observe(ref.current);

    return () => o.disconnect();
  }, [v]);

  return (
    <span ref={ref}>
      {m
        ? m[1] + Math.round(n).toLocaleString("en-US") + m[3]
        : v}
    </span>
  );
}

export default function Stats({ s }) {
  const { tr } = useApp();

  return (
    <SectionShell s={s}>
      <SectionHead s={s} />

      <div className="stats">
        {s.items.map((i, k) => {
          const Icon = iconMap[i.icon] || FaTrophy;

          return (
            <Reveal key={k} v="zoom" d={k * 120}>
              <div className="stat">
                <span className="sic">
                  <Icon />
                </span>

                <strong>
                  <Counter v={i.value} />
                </strong>

                <small>{tr(i.t)}</small>
              </div>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
