import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";
import Slider from "../../components/Slider/Slider.jsx";
import SectionShell from "../SectionShell/SectionShell.jsx";
import SectionHead from "../SectionHead/SectionHead.jsx";
import { getIcon } from "../../utils/icons.js";
import "./Carousel.css";

/* 1 card per view on phones, 2 on tablets, 3 on desktops */
function getPerView(w) {
  if (w <= 600) return 1;
  if (w <= 960) return 2;
  return 3;
}

function useResponsivePerView() {
  const [perView, setPerView] = useState(() =>
    typeof window === "undefined" ? 3 : getPerView(window.innerWidth)
  );

  useEffect(() => {
    const onResize = () => setPerView(getPerView(window.innerWidth));
    addEventListener("resize", onResize, { passive: true });
    return () => removeEventListener("resize", onResize);
  }, []);

  return perView;
}

/* Items with a title -> accreditation cards. Items without -> round partner logos. */
export default function Carousel({ s }) {
  const { tr } = useApp();
  const perView = useResponsivePerView();
  const logos = !s.items.some((i) => tr(i.t));

  const Mark = ({ i }) => {
    const Icon = getIcon(i.icon);
    return i.image ? (
      <img src={i.image} alt={tr(i.t)} />
    ) : Icon ? (
      <Icon aria-hidden="true" />
    ) : (
      <span>{i.icon}</span>
    );
  };

  return (
    <SectionShell s={s} className={logos ? "is-logos" : "is-accr"}>
      <SectionHead s={s} />
      {logos ? (
        <Slider variant="logos" rule label={tr(s.title)}>
          {s.items.map((i, k) => (
            <div className="logo" key={k}>
              <Mark i={i} />
            </div>
          ))}
        </Slider>
      ) : (
        <Slider variant="cards" perView={perView} label={tr(s.title)}>
          {s.items.map((i, k) => (
            <article className="accr" key={k}>
              <span className="accr-ring">
                <Mark i={i} />
              </span>
              <h3>{tr(i.t)}</h3>
              <i className="dr" />
              <p>{tr(i.d)}</p>
            </article>
          ))}
        </Slider>
      )}
    </SectionShell>
  );
}