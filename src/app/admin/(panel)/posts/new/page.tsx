import { PostForm } from "@/components/admin/PostForm";
import { db } from "@/lib/db";
import { uploadMode } from "@/lib/upload-mode";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const translations = await db.post.findMany({ select: { id: true, title: true, locale: true }, orderBy: { updatedAt: "desc" } });
  return (
    <PostForm
      uploadMode={uploadMode()}
      translations={translations}
      initial={{ title: "", slug: "", locale: "tr", excerpt: "", coverImage: "", tags: "", contentJson: null, contentHtml: "", translationOf: "", status: "DRAFT" }}
    />
  );
}
