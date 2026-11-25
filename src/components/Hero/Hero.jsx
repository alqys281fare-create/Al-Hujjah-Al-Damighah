import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import Particles from "../Particles/Particles.jsx";
import { asset } from "../../utils/helpers.js";
import "./Hero.css";

// Home page hero: parallax background, optional particles, optional horizontal flip (set in admin).
export default function Hero() {
  const {
    data: {
      settings: { hero: h },
    },
    tr,
    fx,
  } = useApp();
  const ref = useRef();

  useEffect(() => {
    const onScroll = () =>
      ref.current?.style.setProperty("--py", Math.min(scrollY, 900) * 0.35 + "px");
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  const delay = (ms) => ({ "--d": ms + "ms" });

  return (
    <section className="first" ref={ref}>
      <div className={"hero-bg" + (h.flip ? " is-flipped" : "")}>
        <div
          className="kb"
          style={{
            backgroundImage: h.image
              ? `url(${asset(h.image)})`
              : "linear-gradient(135deg,#4a3a1f,#0f0f0d)",
          }}
        />
      </div>
      <div className="shade" style={{ opacity: Math.min(1, 0.5 + (h.overlay ?? 0.25) * 2) }} />
      {fx.particles && <Particles />}
      <div className="hero">
        <div className="wrap hero-in">
          <div className="hero-text">
            {/* <p className="kick a" style={delay(100)}>{tr(h.kicker)}</p> */}
            <h1 className="a" style={delay(250)}>{tr(h.title)}</h1>
            <h2 className="a" style={delay(400)}>{tr(h.sub)}</h2>
            <p className="desc a" style={delay(550)}>{tr(h.desc)}</p>
            <div className="a" style={delay(700)}>
              <Link className="btn" to={h.ctaLink || "/"}>
                <span>{tr(h.cta)}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}