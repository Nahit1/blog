import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");
  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-2xl font-semibold">Yönetim paneli</h1>
        <p className="mt-1 text-sm text-muted">Devam etmek için giriş yap.</p>
        <LoginForm />
      </div>
    </div>
  );
}
