import { useCallback, useEffect, useRef, useState } from "react";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import "./Slider.css";

/* Scroll-snap slider with double-chevron arrows and dot pagination.
   variant "cards": N cards per view (dots = pages) · "logos": round logos, middle one enlarged (dots = items).
   Arrows and dots hide themselves when every slide already fits. */
export default function Slider({
  variant = "cards",
  perView = 3,
  rule = false,
  children,
  label = "",
}) {
  const { lang } = useApp();
  const rtl = lang === "ar";
  const dir = rtl ? -1 : 1;
  const ref = useRef();
  const hover = useRef(false);
  const act = useRef(0); // logos: index of the enlarged logo
  const [state, setState] = useState({ pages: 1, page: 0 });
  const logos = variant === "logos";

  const measure = useCallback(() => {
    const e = ref.current;
    if (!e) return;
    const max = e.scrollWidth - e.clientWidth;
    const kids = [...e.children];
    const c = e.getBoundingClientRect();
    const cx = c.left + c.width / 2;
    let best = 0,
      bd = Infinity;
    kids.forEach((el, i) => {
      const r = el.getBoundingClientRect(),
        d = Math.abs(r.left + r.width / 2 - cx);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    // when every logo fits there is nothing to scroll, so the autoplay index decides which one is enlarged
    if (logos) {
      if (max <= 4) best = Math.min(act.current, kids.length - 1);
      else act.current = best;
    }
    if (logos)
      kids.forEach((el, i) => el.classList.toggle("is-mid", i === best));
    if (max <= 4) return setState({ pages: 1, page: 0 });
    if (logos) setState({ pages: kids.length, page: best });
    else {
      const pages = Math.ceil(e.scrollWidth / e.clientWidth);
      setState({
        pages,
        page: Math.min(
          pages - 1,
          Math.round((Math.abs(e.scrollLeft) / max) * (pages - 1)),
        ),
      });
    }
  }, [logos]);

  useEffect(() => {
    measure();
    const e = ref.current;
    const ro = new ResizeObserver(measure);
    ro.observe(e);
    return () => ro.disconnect();
  }, [measure, children]);

  const step = () => {
    const e = ref.current,
      a = e.children[0];
    return a
      ? a.getBoundingClientRect().width +
          parseFloat(getComputedStyle(e).columnGap || 0)
      : 300;
  };
  const go = (d) =>
    ref.current.scrollBy({ left: d * dir * step(), behavior: "smooth" });
  const goTo = (i) => {
    const e = ref.current;
    if (logos) {
      const r = e.children[i].getBoundingClientRect(),
        c = e.getBoundingClientRect();
      e.scrollBy({
        left: r.left + r.width / 2 - (c.left + c.width / 2),
        behavior: "smooth",
      });
    } else e.scrollTo({ left: dir * i * e.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(
      () => {
        const e = ref.current;
        if (logos && e && !hover.current) {
          act.current = (act.current + 1) % e.children.length;
          return e.scrollWidth - e.clientWidth > 4
            ? goTo(act.current)
            : measure();
        }
        if (!e || hover.current || e.scrollWidth - e.clientWidth <= 4) return;
        Math.abs(e.scrollLeft) + e.clientWidth >= e.scrollWidth - 6
          ? e.scrollTo({ left: 0, behavior: "smooth" })
          : go(1);
      },
      logos ? 2600 : 4200,
    );
    return () => clearInterval(t);
  }, [lang, logos]);

  const many = state.pages > 1;
  const Prev = rtl ? FaAngleDoubleRight : FaAngleDoubleLeft;
  const Next = rtl ? FaAngleDoubleLeft : FaAngleDoubleRight;

  return (
    <div
      className={`slider is-${variant}`}
      style={{ "--pv": perView }}
      onMouseEnter={() => (hover.current = true)}
      onMouseLeave={() => (hover.current = false)}
    >
      <div className="slider-row">
        <button
          className="slider-arrow"
          aria-label="previous"
          onClick={() => go(-1)}
          hidden={!many}
        >
          <Prev />
        </button>
        <div
          className="slider-track"
          ref={ref}
          onScroll={measure}
          role="group"
          aria-label={label}
        >
          {children}
        </div>
        <button
          className="slider-arrow"
          aria-label="next"
          onClick={() => go(1)}
          hidden={!many}
        >
          <Next />
        </button>
      </div>
      {many && (
        <div className="slider-dots">
          {Array.from({ length: state.pages }, (_, i) => (
            <button
              key={i}
              className={i === state.page ? "on" : ""}
              aria-label={`${i + 1}`}
              aria-current={i === state.page}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
