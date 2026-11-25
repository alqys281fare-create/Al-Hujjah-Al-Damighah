import { useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaQuoteRight } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import Reveal from "../../components/Reveal/Reveal.jsx";
import Tilt from "../../components/Tilt/Tilt.jsx";
import Slider from "../../components/Slider/Slider.jsx";
import SectionShell from "../SectionShell/SectionShell.jsx";
import SectionHead from "../SectionHead/SectionHead.jsx";
import Btn from "../Btn/Btn.jsx";
import { getIcon } from "../../utils/icons.js";
import "./Cards.css";

/* One component, three looks - picked from the section's data:
   stars on            -> "review"  (avatar, name, stars, quote)
   groups / item button -> "service" (tabs + 4-up grid)
   otherwise            -> "pillar"  (vision / mission / goals, staggered) */
export default function Cards({ s }) {
  const { tr } = useApp();
  const [g, setG] = useState(s.groups[0]?.id);
  const variant = s.stars ? "review" : s.groups.length || tr(s.itemButton) ? "service" : "pillar";
  const items = s.groups.length ? s.items.filter((i) => i.group === g) : s.items;

  return (
    <SectionShell s={s} className={`is-${variant}`}>
      <SectionHead s={s} />

      {variant === "service" && (
        <>
          {s.groups.length > 0 && (
            <div className="svc-tabs-wrap">
              <Reveal className="svc-tabs" role="tablist">
                {s.groups.map((x) => (
                  <button key={x.id} role="tab" aria-selected={g === x.id} className={g === x.id ? "on" : ""} onClick={() => setG(x.id)}>
                    {tr(x.label)}
                  </button>
                ))}
              </Reveal>
            </div>
          )}
          <div className="svc-grid" key={g}>
            {items.map((i, k) => {
              const Icon = getIcon(i.icon);
              return (
                <Reveal key={k} v="zoom" d={k * 90}>
                  <Tilt className="svc-card">
                    {i.image ? <img className="svc-img" src={i.image} alt="" /> : Icon && <span className="svc-ic"><Icon /></span>}
                    <h3>{tr(i.t)}</h3>
                    <p>{tr(i.d)}</p>
                    {tr(s.itemButton) && (
                      <Link className="svc-btn" to={"/booking?topic=" + encodeURIComponent(tr(i.t))}>{tr(s.itemButton)}</Link>
                    )}
                  </Tilt>
                </Reveal>
              );
            })}
          </div>
          {tr(s.button?.label) && <div className="svc-more"><Btn b={s.button} /></div>}
        </>
      )}

      {variant === "pillar" && (
        <div className="pillars">
          {items.map((i, k) => {
            const Icon = getIcon(i.icon);
            return (
              <Reveal key={k} d={k * 140}>
                <article className="pillar">
                  <span className="pillar-ic">{i.image ? <img src={i.image} alt="" /> : Icon && <Icon />}</span>
                  <h3>{tr(i.t)}</h3>
                  <i className="dr" />
                  <p>{tr(i.d)}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}

      {variant === "review" && (
        <Slider variant="cards" perView={3} rule label={tr(s.title)}>
          {items.map((i, k) => (
            <article className="rev" key={k}>
              <span className="rev-tab" aria-hidden="true"><FaQuoteRight /></span>
              <header>
                <span className="rev-av">{i.image ? <img src={i.image} alt="" /> : [...tr(i.t)][0]}</span>
                <div>
                  <h3>{tr(i.t)}</h3>
                  <div className="rev-stars" aria-label={`${i.rating || 5}/5`}>
                    {Array.from({ length: i.rating || 5 }, (_, n) => <FaStar key={n} />)}
                  </div>
                  <i className="rev-line" />
                </div>
              </header>
              <p>{tr(i.d)}</p>
            </article>
          ))}
        </Slider>
      )}
    </SectionShell>
  );
}
