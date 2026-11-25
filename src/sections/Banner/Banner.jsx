import { FaEnvelope, FaPhoneAlt, FaCommentDots, FaUserCog, FaHeadset } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import Reveal from "../../components/Reveal/Reveal.jsx";
import SectionShell from "../SectionShell/SectionShell.jsx";
import { bannerSettings, textSide } from "./bannerDefaults.js";
import "./Banner.css";

export default function Banner({ s, preview = false }) {
  const { tr, lang, data, T } = useApp();
  const o = bannerSettings(s);
  const side = textSide(o.align, lang);
  // the text block changes sides with the language, so the photo mirrors with it
  const flipped = o.flip !== (lang !== "ar");
  const c = data?.settings?.contact || {};

  const style = {
    "--bn-h": o.minHeight + "px",
    "--bn-dark": o.overlay,
    "--bn-light": +(o.overlay * 0.15).toFixed(3),
    "--bn-flat": +(o.overlay * 0.85).toFixed(3),
    "--bn-color": o.textColor,
  };

  // optional contact strip (enabled with `contactRow: true` on the section)
  const contacts = [
    { Icon: FaUserCog, t: T("الدعم الفني", "Technical support"), d: T("لحل أي مشكلة تواجهك", "Fix any issue you face") },
    { Icon: FaCommentDots, t: T("الدردشة المباشرة", "Live chat"), d: T("إجابة سريعة على استفساراتك", "Quick answers") },
    { Icon: FaPhoneAlt, t: T("الهاتف", "Phone"), d: c.phone || T("تواصل مباشر مع فريق الدعم", "Talk to our team") },
    { Icon: FaEnvelope, t: T("البريد الإلكتروني", "Email"), d: c.email || T("للاستفسارات العامة", "General enquiries") },
  ];

  const body = (
    <div className="banner" data-side={side} style={style}>
      {o.image && <img className={"banner-img" + (flipped ? " is-flipped" : "")} src={o.image} alt="" aria-hidden="true" />}
      <div className="banner-overlay" />
      <div className="wrap banner-inner">
        <div className="banner-content">
          <h2>{tr(s.title)}</h2>
          <p>{tr(s.sub)}</p>
          {tr(s.button?.label) && (
            <Link className="btn banner-btn" to={s.button.link || "/"}>
              {s.contactRow && <FaHeadset aria-hidden="true" />}
              <span>{tr(s.button.label)}</span>
            </Link>
          )}
          {s.contactRow && (
            <ul className="banner-contacts">
              {contacts.map(({ Icon, t, d }) => (
                <li key={t}>
                  <span className="bc-ic"><Icon /></span>
                  <b>{t}</b>
                  <small>{d}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  if (preview) return <div className="banner-preview-box">{body}</div>;
  return (
    <SectionShell s={s} wrap={false}>
      <Reveal v="fade">{body}</Reveal>
    </SectionShell>
  );
}
