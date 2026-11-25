import { FaShieldAlt, FaUsers, FaBalanceScale, FaClock, FaLock } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import Reveal from "../../components/Reveal/Reveal.jsx";
import SectionShell from "../SectionShell/SectionShell.jsx";
import "./Features.css";

export const FEATURE_ICONS = { FaShieldAlt, FaUsers, FaBalanceScale, FaClock, FaLock };

export default function Features({ s }) {
  const { tr } = useApp();
  return (
    <SectionShell s={s}>
      <div className="feats">
        {(s.items || []).map((i, k) => {
          const Icon = FEATURE_ICONS[i.icon] || FaShieldAlt;
          return (
            <Reveal key={i.id || k} d={k * 100}>
              <div className="feat">
                <span className="feat-icon"><Icon aria-hidden="true" /></span>
                <b>{tr(i.t)}</b>
                <small>{tr(i.d)}</small>
              </div>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
