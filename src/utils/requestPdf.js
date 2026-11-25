// Builds a one-request PDF in the browser (HTML -> canvas -> PDF, so Arabic shapes and RTL render correctly).
import { typeOf, statusOf, statusInfo, METHODS, WHO, PAY, VIA, attachmentBlob } from "./requests.js";

const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])).replace(/\n/g, "<br>");
export const pdfName = (r) => (String(r.name || "request").replace(/[\\/:*?"<>|]+/g, "").trim() || "request") + ".pdf";


// Appends the customer's uploaded files (PDF pages, PNG/JPG images) after the report page(s), so ONE pdf holds everything.
// Word files cannot be merged into a PDF; they stay listed in the report and downloadable from the details panel.
async function appendAttachments(reportBlob, atts) {
  const { PDFDocument } = await import("pdf-lib");
  const out = await PDFDocument.load(await reportBlob.arrayBuffer());
  for (const a of atts) {
    try {
      const bytes = await attachmentBlob(a).arrayBuffer(), type = (a.type || "").toLowerCase(), name = String(a.name || "").toLowerCase();
      if (type === "application/pdf" || name.endsWith(".pdf")) {
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        (await out.copyPages(src, src.getPageIndices())).forEach((pg) => out.addPage(pg));
      } else if (/^image\/(png|jpe?g)$/.test(type) || /\.(png|jpe?g)$/.test(name)) {
        const img = /png/.test(type) || name.endsWith(".png") ? await out.embedPng(bytes) : await out.embedJpg(bytes);
        const W = 595.28, H = 841.89, m = 28, k = Math.min((W - 2 * m) / img.width, (H - 2 * m) / img.height, 1);
        const w = img.width * k, h = img.height * k, pg = out.addPage([W, H]);
        pg.drawImage(img, { x: (W - w) / 2, y: (H - h) / 2, width: w, height: h });
      }
    } catch (e) { console.warn("[pdf] could not merge attachment", a.name, e); }
  }
  return new Blob([await out.save()], { type: "application/pdf" });
}

export async function buildRequestPdf(r, { T, lang, money, brand, logo, fmt }) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
  const rtl = lang === "ar", pk = typeOf(r) === "package", st = statusInfo(statusOf(r));
  const row = (l, v, num) => (v ? `<tr><td class="l">${esc(l)}</td><td class="v${num ? " n" : ""}">${esc(v)}</td></tr>` : "");
  const sec = (title, rows) => (rows.trim() ? `<h3>${esc(title)}</h3><table>${rows}</table>` : "");
  const html = `
  <div dir="${rtl ? "rtl" : "ltr"}" style="width:794px;padding:40px 44px;background:#fff;color:#18202b;font-family:'IBM Plex Sans Arabic','Hanken Grotesk',Tahoma,sans-serif;font-size:15px;line-height:1.8;box-sizing:border-box">
    <style>
      .hd{display:flex;align-items:center;gap:16px;padding-bottom:18px;border-bottom:4px solid #BA9D62}
      .hd img{width:64px;height:64px;object-fit:contain}.hd b{font-size:22px;color:#94773F;display:block}.hd small{opacity:.7}
      .ti{display:flex;justify-content:space-between;align-items:center;margin:22px 0 6px}.ti h1{font-size:24px;margin:0}
      .chip{display:inline-block;padding:2px 14px;border-radius:99px;font-weight:700;font-size:13px}
      h3{margin:22px 0 8px;font-size:15px;color:#94773F;border-bottom:1px solid #eee3cc;padding-bottom:4px}
      table{width:100%;border-collapse:collapse}td{padding:7px 10px;border-bottom:1px solid #f1ece0;vertical-align:top}
      td.l{width:34%;color:#697386;background:#faf7ef}td.n{direction:ltr;unicode-bidi:isolate;text-align:${rtl ? "right" : "left"}}
      .msg{background:#faf7ef;border:1px solid #eee3cc;border-radius:10px;padding:12px 14px;margin-top:8px}
      .tot td{font-weight:700;font-size:17px;background:#f1fbf6}.ft{margin-top:28px;padding-top:10px;border-top:1px solid #eee3cc;font-size:12px;color:#8a91a0;text-align:center}
    </style>
    <div class="hd">${logo ? `<img src="${logo}" crossorigin="anonymous">` : ""}<div><b>${esc(brand)}</b><small>${esc(T("تقرير طلب", "Request report"))}</small></div></div>
    <div class="ti"><h1>${esc(pk ? T("طلب شراء باقة", "Package purchase") : T("طلب تواصل / استشارة", "Contact / consultation request"))}</h1>
      <span class="chip" style="background:${st.bg};color:${st.color}">${esc(T(st.ar, st.en))}</span></div>
    <div style="color:#697386;font-size:13px">#${esc(String(r.id).slice(-6))} · ${esc(fmt(r.date_sent, true))}</div>
    ${sec(T("بيانات مقدم الطلب", "Requester"),
      row(T("الاسم", "Name"), r.name) + row(T("الجوال", "Phone"), r.phone, 1) + row(T("البريد", "Email"), r.email, 1) +
      row(T("الصفة", "Type"), WHO[r.who] && T(...WHO[r.who])) + row(T("المؤسسة", "Company"), r.company))}
    ${pk ? sec(T("تفاصيل الباقة", "Package order"),
      row(T("الباقة", "Package"), r.packageName || r.package) + row(T("الكمية", "Quantity"), r.qty || 1, 1) +
      row(T("سعر الوحدة", "Unit price"), money(r.unitPrice || 0)) + `<tr class="tot"><td class="l">${esc(T("الإجمالي", "Total"))}</td><td class="v">${esc(money(r.total || 0))}</td></tr>` +
      row(T("طريقة الدفع", "Payment"), PAY[r.payment] ? T(...PAY[r.payment]) : r.payment)) : ""}
    ${sec(T("تفاصيل الطلب", "Request details"),
      row(T("الموضوع", "Topic"), r.topic) + row(T("طريقة التواصل", "Method"), METHODS[r.method] && T(...METHODS[r.method])) +
      row(T("التواصل عبر", "Contact via"), VIA[r.contactVia] ? T(...VIA[r.contactVia]) : r.contactVia) + row(T("التاريخ المفضل", "Preferred date"), r.date, 1) + row(T("الفترة", "Time slot"), r.slot) + row(T("المرفقات", "Files"), r.files))}
    ${r.details ? `<h3>${esc(T("الرسالة", "Message"))}</h3><div class="msg">${esc(r.details)}</div>` : ""}
    ${r.notes ? `<h3>${esc(T("ملاحظات داخلية", "Internal notes"))}</h3><div class="msg">${esc(r.notes)}</div>` : ""}
    <div class="ft">${esc(brand)} · ${esc(new Date().toLocaleDateString(rtl ? "ar-SA-u-nu-latn" : "en-GB"))}</div>
  </div>`;

  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-10000px;top:0;z-index:-1";
  host.innerHTML = html;
  document.body.appendChild(host);
  try {
    await (document.fonts?.ready || Promise.resolve());
    await Promise.all([...host.querySelectorAll("img")].map((i) => (i.complete ? 0 : new Promise((ok) => { i.onload = i.onerror = ok; }))));
    const canvas = await html2canvas(host.firstElementChild, { scale: 2, useCORS: true, backgroundColor: "#fff" });
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const W = pdf.internal.pageSize.getWidth(), H = pdf.internal.pageSize.getHeight();
    const imgH = (canvas.height * W) / canvas.width, img = canvas.toDataURL("image/jpeg", 0.92);
    for (let y = 0, p = 0; y < imgH - 1; y += H, p++) { if (p) pdf.addPage(); pdf.addImage(img, "JPEG", 0, -y, W, imgH); }
    pdf.setProperties({ title: r.name });
    const blob = pdf.output("blob");
    return r.attachments?.length ? await appendAttachments(blob, r.attachments) : blob;
  } finally { host.remove(); }
}