import "./SectionShell.css";

// Shared <section> wrapper: id, background, dark text mode. `wrap={false}` = full-bleed (banners).
export default function SectionShell({ s, className = "", wrap = true, children }) {
  const dark = s.dark || s.type === "stats";
  return (
    <section
      id={s.id}
      className={`sec t-${s.type}${dark ? " dark" : ""} ${className}`.trim()}
      style={{ background: s.bg || undefined }}
    >
      {wrap ? <div className="wrap">{children}</div> : children}
    </section>
  );
}
