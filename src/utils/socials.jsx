import { FaWhatsapp, FaInstagram, FaLinkedinIn, FaFacebookF, FaTiktok, FaSnapchatGhost, FaTelegramPlane } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

// key = field name inside settings.contact.social  (YouTube was removed; Snapchat + TikTok are first-class)
export const SOCIALS = [
  { k: "whatsapp", label: "WhatsApp", Icon: FaWhatsapp, bg: "#25D366", fg: "#fff" },
  { k: "x", label: "X", Icon: FaXTwitter, bg: "#111", fg: "#fff" },
  { k: "instagram", label: "Instagram", Icon: FaInstagram, bg: "linear-gradient(45deg,#f9a03f,#e1306c,#833ab4)", fg: "#fff" },
  { k: "snapchat", label: "Snapchat", Icon: FaSnapchatGhost, bg: "#FFFC00", fg: "#111" },
  { k: "tiktok", label: "TikTok", Icon: FaTiktok, bg: "#111", fg: "#fff" },
  { k: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn, bg: "#0A66C2", fg: "#fff" },
  { k: "facebook", label: "Facebook", Icon: FaFacebookF, bg: "#1877F2", fg: "#fff" },
  { k: "telegram", label: "Telegram", Icon: FaTelegramPlane, bg: "#26A5E4", fg: "#fff" },
];

// only networks that have a link filled in (Dashboard > Settings > Contact & social)
export const getSocials = (contact = {}) =>
  SOCIALS.map((x) => ({ ...x, url: contact.social?.[x.k] })).filter((x) => x.url);
