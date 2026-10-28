import sanitizeHtml from "sanitize-html";

// Editörün üretebildiği her şeye izin verilir; script ve olay öznitelikleri temizlenir.
export function sanitizeContent(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h1", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "mark", "span",
      "a", "ul", "ol", "li", "blockquote", "pre", "code", "hr", "img", "video", "iframe", "div", "figure", "figcaption",
    ],
    allowedAttributes: {
      "*": ["style", "class", "data-type"],
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      video: ["src", "controls", "preload", "playsinline", "poster", "width", "height"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder"],
      mark: ["data-color"],
    },
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i, /^var\(--[\w-]+\)$/],
        "background-color": [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s,.%]+\)$/i, /^var\(--[\w-]+\)$/],
        "text-align": [/^(left|right|center|justify)$/],
        "font-size": [/^\d+(\.\d+)?(px|em|rem|%)$/],
        "font-family": [/^[\w\s,"'-]+$/],
      },
    },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: attribs.href?.startsWith("http") ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs,
      }),
    },
  });
}
