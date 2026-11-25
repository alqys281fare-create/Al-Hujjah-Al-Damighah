import "./Poster.css";
import { useApp } from "../../context/AppContext.jsx";

// package cover: the uploaded image, or a gradient with the package name when there is none
export default function Poster({ p, big }) {
  const { tr } = useApp();
  return p.image ? (
    <img className="poster" src={p.image} alt={tr(p.name)} loading="lazy" />
  ) : (
    <div className={"poster poster-fallback" + (big ? " big" : "")} style={{ background: `linear-gradient(160deg,${p.color || "#0f3d2e"},#000)` }}>
      <b>{tr(p.name)}</b>
    </div>
  );
}
