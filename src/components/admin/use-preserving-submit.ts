import { startTransition, type FormEvent } from "react";

/**
 * React 19, form action'larından sonra kontrolsüz alanları sıfırlar; hata durumunda
 * girilen içerik kaybolur. Bu onSubmit, action'ı sıfırlama yapmadan çağırır.
 */
export function preservingSubmit(action: (formData: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(e.currentTarget, submitter);
    startTransition(() => action(formData));
  };
}
