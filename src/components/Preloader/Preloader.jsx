import './Preloader.css'

import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext.jsx";

export default function Preloader() {
  const {
    tr,
    data: { settings: s },
  } = useApp();

  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 2000);

    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 2300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`pre ${fade ? "out" : ""}`}>
      <div className="pre-in">
        <span><img src="/logo.png" alt="Logo" /></span>
        <b>{tr(s.brand.name)}</b>
        <i />
      </div>
    </div>
  );
}
