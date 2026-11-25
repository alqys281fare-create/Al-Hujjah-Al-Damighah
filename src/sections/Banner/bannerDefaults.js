// Defaults applied to any banner section that has no value saved yet.
export const DEFAULT_BANNER_IMAGE = "/poster2.png";

export const BANNER_DEFAULTS = {
  flip: true, // mirror the photo horizontally
  overlay: 0.6, // dark layer strength behind the text (0 - 0.9)
  minHeight: 340, // px
  align: "end", // start | center | end  (start = right side in Arabic, left side in English)
  textColor: "#ffffff",
};

// Merge saved banner data with defaults. `image === undefined` falls back to the default photo,
// `image === ""` means "no photo" (plain gold-dark gradient).
export const bannerSettings = (s) => ({
  ...BANNER_DEFAULTS,
  ...Object.fromEntries(Object.entries(s).filter(([k, v]) => k in BANNER_DEFAULTS && v !== undefined)),
  image: s.image === undefined ? DEFAULT_BANNER_IMAGE : s.image,
});

// Which physical side of the banner the text sits on, given the page language.
export const textSide = (align, lang) =>
  align === "center" ? "center" : (align === "start") === (lang === "ar") ? "right" : "left";
