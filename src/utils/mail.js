// EmailJS REST API — keys come from .env (VITE_EMAILJS_*). The request is ALWAYS saved to the dashboard first;
// a mail failure never blocks the customer.
const URL = "https://api.emailjs.com/api/v1.0/email/send";
const env = import.meta.env;

const pick = (map, key, lang) => map[key]?.[lang === "ar" ? 0 : 1] || key || "";
const WHO = { indiv: ["فرد", "Individual"], inst: ["مؤسسة", "Institution"] };
const PAY = {
  transfer: ["تحويل بنكي", "Bank transfer"],
  card: ["بطاقة مدى / ائتمان", "Mada / Credit card"],
  apple: ["Apple Pay", "Apple Pay"],
  later: ["تواصلوا معي للدفع", "Contact me to pay"],
};
const VIA = {
  phone: ["اتصال", "Phone call"],
  whatsapp: ["واتساب", "WhatsApp"],
  email: ["البريد الإلكتروني", "Email"],
};
const METHOD = {
  phone: ["اتصال هاتفي", "Phone call"],
  video: ["اجتماع مرئي", "Video meeting"],
  office: ["حضوري في المكتب", "In office"],
};

// empty values become "-" so the email never shows a blank line
const d = (v) =>
  v === undefined || v === null || String(v).trim() === "" ? "-" : String(v);

// kind: "request" (Booking page, template 1) | "checkout" (Checkout page, template 2)
// ctx.money: optional price formatter from the app (adds *_formatted values with the currency)
export async function sendRequestMail(kind, r, id, ctx = {}) {
  const service = env.VITE_EMAILJS_SERVICE_ID,
    key = env.VITE_EMAILJS_PUBLIC_KEY;
  const template =
    kind === "checkout"
      ? env.VITE_EMAILJS_TEMPLATE_ID2
      : env.VITE_EMAILJS_TEMPLATE_ID1;
  if (!service || !key || !template) {
    console.warn("[mail] Missing EmailJS configuration (.env)");
    return false;
  }

  const lang = r.lang || "ar",
    isCheckout = kind === "checkout",
    money = ctx.money || ((n) => String(n));
  const time = new Date(r.date_sent || Date.now()).toLocaleString(
    lang === "ar" ? "ar-SA-u-ca-gregory-nu-latn" : "en-GB",
    { dateStyle: "full", timeStyle: "short", timeZone: "Asia/Riyadh" },
  );
  const contactMethod = r.contactVia
    ? pick(VIA, r.contactVia, lang)
    : pick(METHOD, r.method, lang);
  const paymentMethod = r.payment ? pick(PAY, r.payment, lang) : "";
  const notes = isCheckout ? r.customerNotes : r.details;
  const ref = id ? String(id).slice(-6) : "";
  // opens this request in the dashboard (after login) where it can be viewed / downloaded as a PDF named after the customer
  const link = id
    ? `${location.origin}/admin/requests?open=${encodeURIComponent(id)}`
    : `${location.origin}/admin/requests`;
  const hasPkg = !!r.packageName;

  const params = {
    kind,
    request_id: d(ref),
    subject: `${isCheckout ? "New Package Order" : "New Request"} - ${r.name || ""}`,
    name: d(r.name),
    from_name: d(r.name),
    to_name: d(r.name),
    phone: d(r.phone),
    email: r.email || "",
    email_display: d(r.email),
    reply_to: r.email || "",

    requester_type: d(pick(WHO, r.who, lang)),
    who: d(pick(WHO, r.who, lang)),
    company: d(r.company),
    payment_method: d(paymentMethod),
    payment: d(paymentMethod),
    contact_method: d(contactMethod),
    contact_via: d(contactMethod),
    method: d(pick(METHOD, r.method, lang)),
    additional_notes: d(notes),
    details: d(r.details),
    message: d(r.details),
    topic: d(r.topic),
    preferred_date: d(r.date),
    preferred_slot: d(r.slot),
    files: d(r.files),

    package: d(r.packageName),
    package_name: d(r.packageName),
    qty: hasPkg ? String(r.qty ?? 1) : "-",
    unit_price: hasPkg ? String(r.unitPrice ?? "") : "-",
    total: hasPkg ? String(r.total ?? "") : "-",
    unit_price_formatted: hasPkg ? money(r.unitPrice || 0) : "-",
    total_formatted: hasPkg ? money(r.total || 0) : "-",

    time,
    date: time,
    lang,
    dashboard_link: link,
    pdf_link: link,
  };
  // The same value under several common variable names, so an EmailJS template written with different
  // placeholder names still fills in. Use whichever names your template has.
  const alias = (value, names) =>
    names.forEach((n) => {
      if (params[n] === undefined) params[n] = value;
    });
  alias(params.topic, [
    "consultation_topic",
    "consultation_field",
    "consultation_type",
    "consultation_area",
    "field",
    "legal_field",
    "service",
    "service_type",
  ]);
  alias(params.method, [
    "consultation_method",
    "preferred_method",
    "preferred_consultation_method",
    "meeting_method",
    "meeting_type",
    "contact_preference",
  ]);
  alias(params.preferred_slot, [
    "preferred_time",
    "time_slot",
    "slot",
    "contact_time",
    "preferred_contact_time",
  ]);
  alias(params.preferred_date, ["consultation_date", "preferred_day"]);
  alias(params.details, [
    "consultation_details",
    "request_details",
    "description",
    "request_description",
    "case_details",
    "details_text",
  ]);
  // attachments: one line per file with a link that opens THAT file in the dashboard (viewer + download, after admin login)
  const atts = r.attachments || [],
    size = (n) =>
      n >= 1048576
        ? (n / 1048576).toFixed(1) + " MB"
        : Math.max(1, Math.round(n / 1024)) + " KB";
  const noFiles = lang === "ar" ? "لا توجد مرفقات" : "No attachments";
  params.files = d(atts.map((a) => a.name).join(", ") || r.files);
  params.attachments = atts.length
    ? atts
        .map(
          (a, i) =>
            `${i + 1}) ${a.name} (${size(a.size)})\n${link}${link.includes("?") ? "&" : "?"}file=${i}`,
        )
        .join("\n\n")
    : noFiles;
  // for templates that use triple braces {{{attachments_html}}} (renders real clickable links)
  params.attachments_html = atts.length
    ? atts
        .map(
          (a, i) =>
            `<a href="${link}${link.includes("?") ? "&" : "?"}file=${i}">${String(a.name).replace(/[&<>"]/g, "")}</a> (${size(a.size)})`,
        )
        .join("<br>")
    : noFiles;
  alias(params.attachments, [
    "attached_files",
    "attached_documents",
    "documents",
    "uploaded_files",
  ]);
  alias(params.files, ["file_names"]);
  alias(r.agree ? (lang === "ar" ? "نعم، تمت الموافقة" : "Yes, agreed") : "-", [
    "privacy_agreement",
    "privacy_consent",
    "privacy_policy",
    "privacy_accepted",
    "agree",
    "agreement",
  ]);
  alias(params.name, [
    "full_name",
    "client_name",
    "customer_name",
    "requester_name",
  ]);
  alias(params.phone, [
    "mobile",
    "phone_number",
    "client_phone",
    "customer_phone",
  ]);
  alias(params.requester_type, [
    "applicant_type",
    "client_type",
    "customer_type",
  ]);

  // The customer's files go with the email as EmailJS "variable attachments" (attachment_1 ... attachment_5, each a base64 data URL).
  // In the EmailJS template: Attachments tab > Add attachment > "Variable attachment" > parameter name attachment_1 (and 2, 3 ...).
  // EmailJS limits the request size by plan (free plan is small), so if it is refused we resend WITHOUT the files:
  // the mail still arrives with the dashboard links, and the files are always kept in the dashboard.
  const send = async (p) => {
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_id: service, template_id: template, user_id: key, template_params: p }),
    });
    if (!res.ok) console.error("[mail] EmailJS error:", res.status, await res.text());
    return res.ok;
  };
  try {
    if (atts.length) {
      const withFiles = { ...params };
      atts.slice(0, 5).forEach((a, i) => { withFiles[`attachment_${i + 1}`] = a.data; withFiles[`attachment_${i + 1}_name`] = a.name; });
      if (await send(withFiles)) return true;
      console.warn("[mail] attachments refused (plan size limit?) - resending without files");
    }
    return await send(params);
  } catch (e) {
    console.error("[mail] Failed to send email:", e);
    return false;
  }
}