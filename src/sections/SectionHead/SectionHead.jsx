import { useApp } from "../../context/AppContext.jsx";
import Reveal from "../../components/Reveal/Reveal.jsx";

// Title flanked by two gold rules that end in a dot, with the subtitle below.
export default function SectionHead({ s }) {
  const { tr } = useApp();
  if (!s.title?.ar && !s.title?.en) return null;
  return (
    <Reveal className="head">
      <div className="head-title">
        <i className="hl" />
        <h2>{tr(s.title)}</h2>
        <i className="hl" />
      </div>
      {tr(s.sub) && <p>{tr(s.sub)}</p>}
    </Reveal>
  );
}
