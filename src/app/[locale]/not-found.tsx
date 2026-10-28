import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md pt-24 text-center">
      <p className="font-serif text-6xl font-semibold">404</p>
      <p className="mt-4 text-muted">Aradığın sayfa bulunamadı. · The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="mt-8 inline-block text-sm underline underline-offset-4">nahitferhat.com</Link>
    </div>
  );
}
