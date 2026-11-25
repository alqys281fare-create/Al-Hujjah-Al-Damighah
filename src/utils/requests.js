export const typeOf = (r) => r.type || (r.package ? "package" : "contact");

// status flow: new -> contacted (in progress) -> done, or cancelled. Old records only have "new" / "done".
export const STATUSES = [
  { k: "new", ar: "جديد", en: "New", color: "#b7791f", bg: "#fdf3dc" },
  {
    k: "contacted",
    ar: "قيد المتابعة",
    en: "In progress",
    color: "#1d5fbf",
    bg: "#e4eefc",
  },
  { k: "done", ar: "مكتمل", en: "Completed", color: "#13795b", bg: "#dff4ec" },
  {
    k: "cancelled",
    ar: "ملغي",
    en: "Cancelled",
    color: "#9b2c2c",
    bg: "#fbe5e5",
  },
];
export const statusOf = (r) =>
  STATUSES.some((s) => s.k === r.status) ? r.status : "new";
export const statusInfo = (k) => STATUSES.find((s) => s.k === k) || STATUSES[0];

export const METHODS = {
  phone: ["اتصال هاتفي", "Phone call"],
  video: ["اجتماع مرئي", "Video meeting"],
  office: ["حضوري في المكتب", "In office"],
};
export const WHO = {
  indiv: ["فرد", "Individual"],
  inst: ["مؤسسة", "Institution"],
};

// Saudi mobile 05xxxxxxxx -> 9665xxxxxxxx for wa.me
export const waLink = (phone = "") => {
  const d = String(phone).replace(/\D/g, "");
  if (!d) return "";
  const n = d.startsWith("00")
    ? d.slice(2)
    : d.startsWith("0")
      ? "966" + d.slice(1)
      : d;
  return "https://wa.me/" + n;
};

export const reqTotal = (r) => Number(r.total) || 0;
export const dayKey = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-CA") : "";

// Excel-friendly CSV: "sep=," tells Excel the delimiter (Arabic-locale Excel otherwise expects ";" and puts everything in one column),
// UTF-8 BOM keeps Arabic readable, and phone/date cells are forced to text so "0551234567" keeps its leading zero.
const cell = (v) =>
  `"${String(v ?? "")
    .replace(/"/g, '""')
    .replace(/\r?\n/g, " ")}"`;
const text = (v) => (v ? `"=""${String(v).replace(/"/g, '""""')}"""` : '""');
export const PAY = {
  transfer: ["تحويل بنكي", "Bank transfer"],
  card: ["بطاقة", "Card"],
  apple: ["Apple Pay", "Apple Pay"],
  later: ["تواصل للدفع", "Contact to pay"],
};
export const VIA = {
  phone: ["اتصال", "Call"],
  whatsapp: ["واتساب", "WhatsApp"],
  email: ["بريد", "Email"],
};

export function toCsv(rows, T) {
  const i = T(0, 1),
    fmt = (iso) => (iso ? new Date(iso).toLocaleString("en-GB") : "");
  const head = [
    T("الرقم", "ID"),
    T("نوع الطلب", "Request type"),
    T("الحالة", "Status"),
    T("الاسم", "Name"),
    T("الجوال", "Phone"),
    T("البريد", "Email"),
    T("الصفة", "Requester"),
    T("المؤسسة", "Company"),
    T("الموضوع", "Topic"),
    T("الباقة", "Package"),
    T("الكمية", "Qty"),
    T("سعر الوحدة", "Unit price"),
    T("الإجمالي", "Total"),
    T("طريقة الدفع", "Payment"),
    T("التواصل عبر", "Contact via"),
    T("طريقة التواصل", "Method"),
    T("التاريخ المفضل", "Preferred date"),
    T("الفترة", "Time slot"),
    T("الرسالة", "Message"),
    T("المرفقات", "Attachments"),
    T("ملاحظات داخلية", "Internal notes"),
    T("تاريخ الإرسال", "Sent at"),
  ];
  const lines = rows.map((r) =>
    [
      cell(String(r.id).slice(-6)),
      cell(
        typeOf(r) === "package"
          ? T("شراء باقة", "Package purchase")
          : T("تواصل / استشارة", "Contact / consultation"),
      ),
      cell(statusInfo(statusOf(r))[T("ar", "en")]),
      cell(r.name),
      text(r.phone),
      cell(r.email),
      cell(WHO[r.who]?.[i] || ""),
      cell(r.company),
      cell(r.topic),
      cell(r.packageName || ""),
      cell(r.qty || ""),
      cell(r.unitPrice || ""),
      cell(r.total || ""),
      cell(PAY[r.payment]?.[i] || r.payment || ""),
      cell(VIA[r.contactVia]?.[i] || r.contactVia || ""),
      cell(METHODS[r.method]?.[i] || r.method || ""),
      text(r.date),
      cell(r.slot),
      cell(r.details),
      cell((r.attachments || []).map((a) => a.name).join(" | ") || r.files),
      cell(r.notes),
      text(fmt(r.date_sent)),
    ].join(","),
  );
  return "\ufeffsep=,\r\n" + [head.map(cell).join(","), ...lines].join("\r\n");
}

// ---- attachments: stored in the request as { name, type, size, data(base64 data URL) } ----
export const MAX_FILES = 5,
  MAX_TOTAL = 6 * 1024 * 1024;
export const fmtSize = (n = 0) =>
  n >= 1048576
    ? (n / 1048576).toFixed(1) + " MB"
    : Math.max(1, Math.round(n / 1024)) + " KB";
export const readFile = (file) =>
  new Promise((ok, no) => {
    const r = new FileReader();
    r.onload = () =>
      ok({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        data: r.result,
      });
    r.onerror = no;
    r.readAsDataURL(file);
  });
export const attachmentBlob = (a) => {
  const [head, b64] = String(a.data).split(",");
  const bin = atob(b64),
    u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: a.type || head.slice(5, head.indexOf(";")) });
};
export const canPreview = (a) =>
  /^(application\/pdf|image\/)/.test(a.type || "");
