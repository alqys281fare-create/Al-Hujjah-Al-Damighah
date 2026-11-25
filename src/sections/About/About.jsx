import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import SectionShell from "../SectionShell/SectionShell.jsx";
import "./About.css";

// All text comes from the dashboard:
//   title -> small badge, sub -> main title, items[0].t -> second title, items[0].d -> paragraph
export default function About({ s }) {
  const { tr } = useApp();
  const item = s.items?.[0] || {};
  return (
    <SectionShell s={s}>
      <div className="about-section-wrapper">
        <div className="about-text-content">
          {tr(s.title) && (
            <div className="about-badge">
              <span className="line" />
              <span className="dot" />
              <span className="text">{tr(s.title)}</span>
              <span className="dot" />
              <span className="line" />
            </div>
          )}
          <h2 className="about-main-title">{tr(s.sub)}</h2>
          {tr(item.t) && <h3 className="about-sub-title">{tr(item.t)}</h3>}
          <p className="about-description">{tr(item.d)}</p>
          {tr(s.button?.label) && (
            <Link to={s.button.link || "/"} className="about-action-btn">
              <span>{tr(s.button.label)}</span>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </div>
        {s.image && (
          <div className="about-visual">
            <img src={s.image} alt={tr(s.sub)} />
          </div>
        )}
      </div>
    </SectionShell>
  );
}
