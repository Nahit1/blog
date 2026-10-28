import { Reveal } from "./Reveal";

export function SectionHeading({ index, title, subtitle, action }: { index: string; title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-xs tracking-widest text-accent">{index}</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-lg text-muted">{subtitle}</p>}
      </div>
      {action}
    </Reveal>
  );
}
