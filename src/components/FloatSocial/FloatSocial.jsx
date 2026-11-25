import { useEffect, useRef, useState } from "react";
import { FaCommentDots, FaTimes } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import { getSocials } from "../../utils/socials.jsx";
import "./FloatSocial.css";

// Floating button (home page): click to fan out every social network. Controlled from Dashboard > General.
export default function FloatSocial() {
  const { data: { settings: s }, T } = useApp();
  const [open, setOpen] = useState(false);
  const box = useRef();
  const list = getSocials(s.contact);

  useEffect(() => {
    if (!open) return;
    const off = (e) => (e.type === "keydown" ? e.key === "Escape" : !box.current?.contains(e.target)) && setOpen(false);
    addEventListener("keydown", off);
    addEventListener("pointerdown", off);
    return () => { removeEventListener("keydown", off); removeEventListener("pointerdown", off); };
  }, [open]);

  if (s.float?.enabled === false || !list.length) return null;
  return (
    <div ref={box} className={`fs fs-${s.float?.position === "end" ? "end" : "start"}${open ? " open" : ""}`}>
      <ul className="fs-list" id="fs-list">
        {list.map(({ k, label, Icon, url, bg, fg }, i) => (
          <li key={k} style={{ "--i": i }}>
            <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label} tabIndex={open ? 0 : -1} style={{ background: bg, color: fg }}>
              <Icon />
              <span className="fs-tip">{label}</span>
            </a>
          </li>
        ))}
      </ul>
      <button className="fs-main" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="fs-list" aria-label={T("تواصل معنا عبر وسائل التواصل", "Contact us on social media")}>
        <FaCommentDots className="fs-i1" />
        <FaTimes className="fs-i2" />
      </button>
    </div>
  );
}
