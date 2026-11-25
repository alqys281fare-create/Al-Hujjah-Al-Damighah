import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";

// Section call-to-action button; renders nothing when the label is empty.
export default function Btn({ b, cls = "" }) {
  const { tr } = useApp();
  if (!tr(b?.label)) return null;
  return (
    <Link className={"btn " + cls} to={b.link || "/"}>
      <span>{tr(b.label)}</span>
    </Link>
  );
}
