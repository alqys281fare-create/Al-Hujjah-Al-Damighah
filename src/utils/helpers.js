export const setIn = (obj, path, val) => {
  const n = structuredClone(obj);
  let o = n;
  path.slice(0, -1).forEach((k) => (o = o[k]));
  o[path.at(-1)] = val;
  return n;
};
export const uid = (p) => p + Date.now().toString(36);
export const B = () => ({ ar: "", en: "" });
export const resizeImg = (file, max = 1600) =>
  new Promise((res) => {
    const r = new FileReader();
    r.onload = () => {
      const i = new Image();
      i.onload = () => {
        const s = Math.min(1, max / i.width),
          c = document.createElement("canvas");
        c.width = i.width * s;
        c.height = i.height * s;
        c.getContext("2d").drawImage(i, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.82));
      };
      i.src = r.result;
    };
    r.readAsDataURL(file);
  });

// Make a stored image path work from any route ("logo.png" / "./a.png" -> "/logo.png"); URLs and data: images pass through
export const asset = (p) =>
  !p
    ? p
    : /^(https?:|data:|blob:|\/)/.test(p)
      ? p
      : "/" + p.replace(/^\.\//, "");
