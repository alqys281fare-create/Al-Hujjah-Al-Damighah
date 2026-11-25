// 3D tilt + cursor glow
export default function Tilt({
  as: E = "div",
  className = "",
  children,
  max = 7,
  ...p
}) {
  const mv = (e) => {
    const t = e.currentTarget,
      b = t.getBoundingClientRect(),
      x = (e.clientX - b.left) / b.width,
      y = (e.clientY - b.top) / b.height;
    t.style.setProperty("--rx", (0.5 - y) * max + "deg");
    t.style.setProperty("--ry", (x - 0.5) * max * 2 + "deg");
    t.style.setProperty("--mx", x * 100 + "%");
    t.style.setProperty("--my", y * 100 + "%");
  };
  const lv = (e) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };
  return (
    <E
      className={"tilt " + className}
      onMouseMove={mv}
      onMouseLeave={lv}
      {...p}
    >
      {children}
    </E>
  );
}
