import type { Metadata } from "next";
import { PostList } from "@/components/site/PostList";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { listPosts } from "@/lib/posts";
import { t, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: t(locale).blog, alternates: { languages: { tr: "/blog", en: "/en/blog" } } };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const d = t(locale);
  const posts = await listPosts(locale);

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-6 space-y-16 pt-10">
      <div>
        <h1 className="mb-10 font-serif text-4xl font-semibold tracking-tight">{d.blog}</h1>
        <PostList posts={posts} locale={locale} />
      </div>
      <SubscribeForm locale={locale} d={d} />
    </div>
  );
}
