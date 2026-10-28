import "server-only";
import { Resend } from "resend";
import { absoluteUrl } from "./site";
import { localePath, type Locale } from "./i18n";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.MAIL_FROM ?? "Nahit Ferhat Ektaş <bulten@nahitferhat.com>";

type Mail = { to: string; subject: string; html: string; headers?: Record<string, string> };

/** Mailleri 100'lük gruplar halinde gönderir. Resend anahtarı yoksa terminale yazar. */
export async function sendMails(mails: Mail[]) {
  if (!resend) {
    for (const m of mails) {
      const links = [...m.html.matchAll(/href="([^"]+)"/g)].map((x) => `  ${x[1]}`).join("\n");
      console.log(`\n[mail:dev] → ${m.to}\nKonu: ${m.subject}\nLinkler:\n${links}\n`);
    }
    return;
  }
  for (let i = 0; i < mails.length; i += 100) {
    const { error } = await resend.batch.send(mails.slice(i, i + 100).map((m) => ({ from, ...m })));
    if (error) throw new Error(`Mail gönderilemedi: ${error.message}`);
  }
}

function layout(body: string, footer = "") {
  return `<!doctype html><html><body style="margin:0;background:#f6f6f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1c1c">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="font-size:14px;color:#6b6b6b;margin:0 0 24px">Nahit Ferhat Ektaş</p>
<div style="background:#fff;border-radius:12px;padding:28px 24px;line-height:1.6;font-size:16px">${body}</div>
<p style="font-size:12px;color:#8a8a8a;margin:20px 4px 0;line-height:1.5">${footer}</p>
</div></body></html>`;
}

function button(href: string, label: string) {
  return `<p style="margin:24px 0 4px"><a href="${href}" style="display:inline-block;background:#1c1c1c;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">${label}</a></p>`;
}

const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export function confirmMail(email: string, token: string, locale: Locale): Mail {
  const url = absoluteUrl(`${localePath(locale, "/newsletter/confirm")}?token=${token}`);
  return locale === "tr"
    ? {
        to: email,
        subject: "Aboneliğini onayla",
        html: layout(`<p>Merhaba,</p><p>Yeni yazılarımdan haberdar olmak için abone oldun. Onaylamak için aşağıdaki butona tıkla.</p>${button(url, "Aboneliği onayla")}`,
          "Bu isteği sen yapmadıysan bu e-postayı görmezden gelebilirsin."),
      }
    : {
        to: email,
        subject: "Confirm your subscription",
        html: layout(`<p>Hi,</p><p>You signed up to hear about my new articles. Please confirm by clicking the button below.</p>${button(url, "Confirm subscription")}`,
          "If you didn't request this, you can safely ignore this email."),
      };
}

export function newPostMail(
  email: string,
  token: string,
  post: { title: string; excerpt: string | null; slug: string; locale: Locale; coverImage: string | null },
): Mail {
  const postUrl = absoluteUrl(localePath(post.locale, `/blog/${post.slug}`));
  const unsubscribeUrl = absoluteUrl(`${localePath(post.locale, "/newsletter/unsubscribe")}?token=${token}`);
  const tr = post.locale === "tr";
  const cover = post.coverImage
    ? `<img src="${post.coverImage.startsWith("http") ? post.coverImage : absoluteUrl(post.coverImage)}" alt="" style="width:100%;border-radius:8px;margin-bottom:16px">`
    : "";
  return {
    to: email,
    subject: tr ? `Yeni yazı: ${post.title}` : `New article: ${post.title}`,
    headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
    html: layout(
      `${cover}<p style="font-size:13px;color:#6b6b6b;margin:0 0 6px">${tr ? "Yeni yazı" : "New article"}</p>
<h1 style="font-size:22px;line-height:1.3;margin:0 0 12px">${escape(post.title)}</h1>
${post.excerpt ? `<p style="margin:0;color:#3d3d3d">${escape(post.excerpt)}</p>` : ""}
${button(postUrl, tr ? "Yazıyı oku" : "Read the article")}`,
      `${tr ? "Bu e-postayı yeni yazılara abone olduğun için aldın." : "You're receiving this because you subscribed to new articles."} <a href="${unsubscribeUrl}" style="color:#8a8a8a">${tr ? "Abonelikten çık" : "Unsubscribe"}</a>`,
    ),
  };
}
