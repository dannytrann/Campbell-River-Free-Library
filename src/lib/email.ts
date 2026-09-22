import "server-only";
import { createReviewToken, type ReviewKind } from "./review-token";
import { markerSvg } from "./markers";
import type { Library, Photo } from "./types";

const FROM = process.env.RESEND_FROM ?? "CR Little Libraries <onboarding@resend.dev>";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.crlibraries.info").replace(/\/$/, "");
}

async function send(subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.MODERATOR_EMAIL;
  if (!apiKey || !to) {
    console.warn("[email] skipped — RESEND_API_KEY or MODERATOR_EMAIL not set");
    return { ok: false as const, error: "email_not_configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: to.split(",").map((t) => t.trim()), subject, html }),
  });
  if (!res.ok) {
    const detail = await res.text();
    console.error("[email] resend failed", res.status, detail);
    return { ok: false as const, error: `resend_${res.status}` };
  }
  return { ok: true as const };
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function shell(heading: string, rows: string, reviewUrl: string, extra = "") {
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;background:#fdf6e9;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:3px solid #3b2a1a;border-radius:16px;overflow:hidden">
    <div style="background:#f2c14e;border-bottom:3px solid #3b2a1a;padding:14px 20px;font-size:18px;font-weight:800">
      📚 ${esc(heading)}
    </div>
    <div style="padding:20px;color:#3b2a1a;font-size:15px;line-height:1.5">
      ${extra}
      <table style="width:100%;border-collapse:collapse;margin-bottom:18px">${rows}</table>
      <a href="${reviewUrl}" style="display:inline-block;background:#f28c6b;color:#3b2a1a;font-weight:800;text-decoration:none;
        border:3px solid #3b2a1a;border-radius:999px;padding:12px 22px">Review it →</a>
      <p style="font-size:13px;color:#6b5844;margin-top:18px">
        Opens a page with Approve and Reject buttons — no sign-in needed. The link expires in 14 days.
      </p>
    </div>
  </div>
</div>`;
}

const row = (label: string, value: string) =>
  `<tr><td style="padding:4px 12px 4px 0;color:#6b5844;white-space:nowrap;vertical-align:top">${esc(label)}</td>
   <td style="padding:4px 0;font-weight:600">${value}</td></tr>`;

function reviewUrl(kind: ReviewKind, id: string) {
  return `${siteUrl()}/review?token=${encodeURIComponent(createReviewToken(kind, id))}`;
}

export async function sendLibrarySubmissionEmail(library: Library, submitterEmail?: string | null) {
  const maps = `https://www.google.com/maps/search/?api=1&query=${library.lat},${library.lng}`;
  const icon = `data:image/svg+xml;base64,${Buffer.from(markerSvg(library.icon)).toString("base64")}`;
  const rows = [
    row("Name", esc(library.name)),
    library.neighborhood ? row("Neighbourhood", esc(library.neighborhood)) : "",
    library.description ? row("Description", esc(library.description)) : "",
    row("Location", `<a href="${maps}" style="color:#1c6b8c">${library.lat.toFixed(5)}, ${library.lng.toFixed(5)}</a>`),
    submitterEmail ? row("Submitted by", esc(submitterEmail)) : "",
  ].join("");

  return send(
    `New little library: ${library.name}`,
    shell(
      "New library submitted",
      rows,
      reviewUrl("library", library.id),
      `<img src="${icon}" width="56" height="64" alt="" style="float:right;margin-left:12px">`,
    ),
  );
}

export async function sendPhotoSubmissionEmail(photo: Photo, libraryName: string, imageUrl: string | null) {
  const rows = [
    row("Library", esc(libraryName)),
    photo.caption ? row("Caption", esc(photo.caption)) : "",
  ].join("");

  return send(
    `New photo for ${libraryName}`,
    shell(
      "New photo submitted",
      rows,
      reviewUrl("photo", photo.id),
      imageUrl
        ? `<img src="${imageUrl}" alt="" style="width:100%;border:3px solid #3b2a1a;border-radius:12px;margin-bottom:16px">`
        : "",
    ),
  );
}
