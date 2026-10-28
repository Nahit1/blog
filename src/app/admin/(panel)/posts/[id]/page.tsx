import type { JSONContent } from "@tiptap/react";
import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { db } from "@/lib/db";
import { uploadMode } from "@/lib/upload-mode";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { deletePost } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const post = await db.post.findUnique({ where: { id } });
  if (!post) notFound();

  const [translations, linked] = await Promise.all([
    db.post.findMany({ where: { NOT: { id } }, select: { id: true, title: true, locale: true }, orderBy: { updatedAt: "desc" } }),
    post.translationKey
      ? db.post.findFirst({ where: { translationKey: post.translationKey, NOT: { id } }, select: { id: true } })
      : null,
  ]);

  return (
    <div className="space-y-12">
      <PostForm
        uploadMode={uploadMode()}
        translations={translations}
        savedNotice={saved === "1"}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          locale: post.locale,
          excerpt: post.excerpt ?? "",
          coverImage: post.coverImage ?? "",
          tags: post.tags.join(", "),
          contentJson: post.contentJson as JSONContent,
          contentHtml: post.contentHtml,
          translationOf: linked?.id ?? "",
          status: post.status,
        }}
      />
      <form action={deletePost} className="border-t border-line pt-6">
        <input type="hidden" name="id" value={post.id} />
        <ConfirmSubmit message="Bu yazı kalıcı olarak silinsin mi?" className="text-sm text-red-400 underline">Bu yazıyı kalıcı olarak sil</ConfirmSubmit>
      </form>
    </div>
  );
}
