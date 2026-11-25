import "./ScrollUI.css";
import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";

// scroll progress bar + back-to-top button (same gold circle as the social-media button)
export default function ScrollUI() {
  const { T } = useApp();
  const [p, setP] = useState(0);
  useEffect(() => {
    const f = () => {
      const h = document.documentElement;
      setP(h.scrollTop / (h.scrollHeight - h.clientHeight || 1));
    };
    f();
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);
  const show = p > 0.08;
  return (
    <>
      <i className="sprog" style={{ transform: `scaleX(${p})` }} />
      <button
        className={"totop" + (show ? " show" : "")}
        aria-label={T("العودة إلى الأعلى", "Back to top")}
        tabIndex={show ? 0 : -1}
        onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
      >
        <FaArrowUp />
      </button>
    </>
  );
}
