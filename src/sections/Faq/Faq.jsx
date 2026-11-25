
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import Reveal from "../../components/Reveal/Reveal.jsx";
import SectionShell from "../SectionShell/SectionShell.jsx";
import SectionHead from "../SectionHead/SectionHead.jsx";
import "./Faq.css";

export default function Faq({ s }) {
  const { tr } = useApp();
  const [open, setOpen] = useState(0);

  return (
    <SectionShell s={s}>
      <SectionHead s={s} />

      <div className="faq-wrap">
        <div className="faq">
          {s.items.map((i, k) => (
            <Reveal key={k} d={k * 80}>
              <div className={"q" + (open === k ? " on" : "")}>
                <button
                  id={`q${k}`}
                  aria-expanded={open === k}
                  aria-controls={`a${k}`}
                  onClick={() =>
                    setOpen(open === k ? -1 : k)
                  }
                >
                  <span>{tr(i.t)}</span>
                  <FaChevronDown
                    className="chev"
                    aria-hidden="true"
                  />
                </button>

                <div
                  className="ans"
                  id={`a${k}`}
                  role="region"
                  aria-labelledby={`q${k}`}
                >
                  <div>
                    <p>{tr(i.d)}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* FAQ Illustration */}
        <Reveal v="end" className="faq-art-box">
          <img
            src="/faq-illustration.svg"
            alt="Gold question mark, books, leaves and scales of justice"
            className="faq-art"
            loading="lazy"
          />
        </Reveal>
      </div>
    </SectionShell>
  );
}
