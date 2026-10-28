"use client";

import { useActionState } from "react";
import { login, type FormState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block text-sm">
        <span className="text-muted">E-posta</span>
        <input name="email" type="email" required autoComplete="username" className="input mt-1" />
      </label>
      <label className="block text-sm">
        <span className="text-muted">Şifre</span>
        <input name="password" type="password" required autoComplete="current-password" className="input mt-1" />
      </label>
      {state.error && <p className="text-sm text-red-400" role="alert">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full">{pending ? "Giriş yapılıyor…" : "Giriş yap"}</button>
    </form>
  );
}
