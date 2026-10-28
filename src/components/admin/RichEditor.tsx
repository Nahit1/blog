"use client";

import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Color, FontSize, TextStyle } from "@tiptap/extension-text-style";
import Youtube from "@tiptap/extension-youtube";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, type Editor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useRef, useState } from "react";
import { pickFile, uploadFile, type UploadMode } from "./upload";
import { Video } from "./video-extension";

export type EditorValue = { json: JSONContent; html: string };

const TEXT_COLORS = ["#1d1c1a", "#b4532a", "#c0392b", "#d97706", "#15803d", "#1d4ed8", "#7c3aed", "#6e6a63"];
const HIGHLIGHTS = ["#fef08a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#fed7aa"];
const FONT_SIZES = [
  { label: "Küçük", value: "14px" },
  { label: "Normal", value: "" },
  { label: "Büyük", value: "22px" },
  { label: "Çok büyük", value: "28px" },
];

export function RichEditor({
  initialContent,
  onChange,
  uploadMode,
  placeholder = "Yazmaya başla…",
}: {
  initialContent?: JSONContent | null;
  onChange: (value: EditorValue) => void;
  uploadMode: UploadMode;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState<string | null>(null);
  // editorProps ilk render'da tanımlanır; güncel editöre ref üzerinden ulaşılır.
  const editorRef = useRef<Editor | null>(null);

  async function insertUpload(editor: Editor, file: File) {
    const isVideo = file.type.startsWith("video/");
    setUploading(isVideo ? "Video yükleniyor…" : "Resim yükleniyor…");
    try {
      const src = await uploadFile(file, uploadMode);
      if (isVideo) editor.chain().focus().setVideo({ src }).run();
      else editor.chain().focus().setImage({ src, alt: file.name.replace(/\.[^.]+$/, "") }).run();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setUploading(null);
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      TextStyle,
      Color,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      Youtube.configure({ nocookie: true, width: 640, height: 360 }),
      Video,
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent ?? "",
    editorProps: {
      attributes: { class: "article prose prose-lg max-w-none font-serif px-5 py-4" },
      handlePaste: (_view, event) => {
        const file = Array.from(event.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
        if (!file || !editorRef.current) return false;
        insertUpload(editorRef.current, file);
        return true;
      },
      handleDrop: (_view, event) => {
        const file = Array.from(event.dataTransfer?.files ?? []).find((f) => /^(image|video)\//.test(f.type));
        if (!file || !editorRef.current) return false;
        event.preventDefault();
        insertUpload(editorRef.current, file);
        return true;
      },
    },
    onUpdate: ({ editor }) => onChange({ json: editor.getJSON(), html: editor.getHTML() }),
  });

  editorRef.current = editor;
  if (!editor) return <div className="min-h-[400px] rounded-xl border border-line bg-surface" />;

  return (
    <div className="rounded-xl border border-line bg-surface">
      <Toolbar editor={editor} onUpload={async (accept) => {
        const file = await pickFile(accept);
        if (file) await insertUpload(editor, file);
      }} />
      {uploading && <p className="border-b border-line bg-paper px-4 py-2 text-sm text-muted">{uploading}</p>}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor, onUpload }: { editor: Editor; onUpload: (accept: string) => void }) {
  const chain = () => editor.chain().focus();
  const currentSize = (editor.getAttributes("textStyle").fontSize as string | undefined) ?? "";
  const block = editor.isActive("heading", { level: 2 }) ? "h2" : editor.isActive("heading", { level: 3 }) ? "h3" : editor.isActive("heading", { level: 4 }) ? "h4" : "p";

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-xl border-b border-line bg-surface/95 p-2 backdrop-blur">
      <select
        value={block}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "p") chain().setParagraph().run();
          else chain().toggleHeading({ level: Number(v.slice(1)) as 2 | 3 | 4 }).run();
        }}
        className="h-8 rounded-md border border-line bg-paper px-2 text-sm"
        aria-label="Paragraf tipi"
      >
        <option value="p">Paragraf</option>
        <option value="h2">Başlık 1</option>
        <option value="h3">Başlık 2</option>
        <option value="h4">Başlık 3</option>
      </select>
      <select
        value={currentSize}
        onChange={(e) => (e.target.value ? chain().setFontSize(e.target.value).run() : chain().unsetFontSize().run())}
        className="h-8 rounded-md border border-line bg-paper px-2 text-sm"
        aria-label="Yazı boyutu"
      >
        {FONT_SIZES.map((s) => <option key={s.label} value={s.value}>{s.label}</option>)}
      </select>

      <Sep />
      <Btn label="Kalın" active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()}><b>B</b></Btn>
      <Btn label="İtalik" active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()}><i className="font-serif">I</i></Btn>
      <Btn label="Altı çizili" active={editor.isActive("underline")} onClick={() => chain().toggleUnderline().run()}><u>U</u></Btn>
      <Btn label="Üstü çizili" active={editor.isActive("strike")} onClick={() => chain().toggleStrike().run()}><s>S</s></Btn>
      <Btn label="Satır içi kod" active={editor.isActive("code")} onClick={() => chain().toggleCode().run()}><span className="font-mono text-xs">{"<>"}</span></Btn>

      <Sep />
      <Palette
        label="Yazı rengi"
        icon={<span className="font-semibold" style={{ borderBottom: `3px solid ${editor.getAttributes("textStyle").color ?? "currentColor"}` }}>A</span>}
        colors={TEXT_COLORS}
        onPick={(c) => chain().setColor(c).run()}
        onClear={() => chain().unsetColor().run()}
      />
      <Palette
        label="Vurgu rengi"
        icon={<span className="rounded-sm px-1" style={{ background: editor.getAttributes("highlight").color ?? "#fef08a", color: "#1d1c1a" }}>H</span>}
        colors={HIGHLIGHTS}
        onPick={(c) => chain().setHighlight({ color: c }).run()}
        onClear={() => chain().unsetHighlight().run()}
      />

      <Sep />
      <Btn label="Sola hizala" active={editor.isActive({ textAlign: "left" })} onClick={() => chain().setTextAlign("left").run()}><AlignIcon kind="left" /></Btn>
      <Btn label="Ortala" active={editor.isActive({ textAlign: "center" })} onClick={() => chain().setTextAlign("center").run()}><AlignIcon kind="center" /></Btn>
      <Btn label="Sağa hizala" active={editor.isActive({ textAlign: "right" })} onClick={() => chain().setTextAlign("right").run()}><AlignIcon kind="right" /></Btn>

      <Sep />
      <Btn label="Madde işaretli liste" active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()}>•≡</Btn>
      <Btn label="Numaralı liste" active={editor.isActive("orderedList")} onClick={() => chain().toggleOrderedList().run()}>1.</Btn>
      <Btn label="Alıntı" active={editor.isActive("blockquote")} onClick={() => chain().toggleBlockquote().run()}>❝</Btn>
      <Btn label="Kod bloğu" active={editor.isActive("codeBlock")} onClick={() => chain().toggleCodeBlock().run()}><span className="font-mono text-xs">{"{}"}</span></Btn>
      <Btn label="Ayırıcı çizgi" onClick={() => chain().setHorizontalRule().run()}>―</Btn>

      <Sep />
      <Btn
        label="Link"
        active={editor.isActive("link")}
        onClick={() => {
          const prev = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("Link adresi (boş bırakırsan link kaldırılır)", prev ?? "https://");
          if (url === null) return;
          if (!url || url === "https://") chain().extendMarkRange("link").unsetLink().run();
          else chain().extendMarkRange("link").setLink({ href: url }).run();
        }}
      >🔗</Btn>
      <Btn label="Resim yükle" onClick={() => onUpload("image/*")}>🖼</Btn>
      <Btn label="Video yükle" onClick={() => onUpload("video/mp4,video/webm,video/quicktime")}>🎬</Btn>
      <Btn
        label="YouTube videosu ekle"
        onClick={() => {
          const url = window.prompt("YouTube video linki");
          if (url) chain().setYoutubeVideo({ src: url }).run();
        }}
      ><span className="text-xs font-bold text-red-600">▶</span></Btn>

      <Sep />
      <Btn label="Biçimlendirmeyi temizle" onClick={() => chain().unsetAllMarks().clearNodes().run()}>⌫</Btn>
      <Btn label="Geri al" disabled={!editor.can().undo()} onClick={() => chain().undo().run()}>↶</Btn>
      <Btn label="Yinele" disabled={!editor.can().redo()} onClick={() => chain().redo().run()}>↷</Btn>
    </div>
  );
}

function Btn({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`grid h-8 min-w-8 place-items-center rounded-md px-1.5 text-sm transition disabled:opacity-30 ${active ? "bg-ink text-paper" : "hover:bg-paper"}`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px bg-line" aria-hidden />;
}

function Palette({ label, icon, colors, onPick, onClear }: { label: string; icon: React.ReactNode; colors: string[]; onPick: (c: string) => void; onClear: () => void }) {
  return (
    <details className="relative">
      <summary title={label} aria-label={label} className="grid h-8 min-w-8 cursor-pointer list-none place-items-center rounded-md px-1.5 text-sm hover:bg-paper [&::-webkit-details-marker]:hidden">
        {icon}
      </summary>
      <div className="absolute left-0 top-9 z-20 w-48 rounded-lg border border-line bg-surface p-3 shadow-lg">
        <div className="grid grid-cols-5 gap-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                onPick(c);
                e.currentTarget.closest("details")?.removeAttribute("open");
              }}
              className="size-7 rounded-full ring-1 ring-line"
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          <label className="flex items-center gap-1.5 text-muted">
            Özel
            <input type="color" onChange={(e) => onPick(e.target.value)} className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0" />
          </label>
          <button type="button" onClick={(e) => { onClear(); e.currentTarget.closest("details")?.removeAttribute("open"); }} className="text-muted underline">
            Kaldır
          </button>
        </div>
      </div>
    </details>
  );
}

function AlignIcon({ kind }: { kind: "left" | "center" | "right" }) {
  const lines = { left: [14, 10, 14, 8], center: [14, 10, 14, 10], right: [14, 10, 14, 8] }[kind];
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      {lines.map((w, i) => {
        const x = kind === "left" ? 1 : kind === "right" ? 15 - w : (16 - w) / 2;
        return <rect key={i} x={x} y={2 + i * 3.5} width={w} height="1.6" rx="0.8" fill="currentColor" />;
      })}
    </svg>
  );
}
