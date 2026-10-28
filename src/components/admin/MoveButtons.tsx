import { moveItem } from "@/app/admin/actions";

export function MoveButtons({ model, id, first, last }: { model: "skillGroup" | "section"; id: string; first: boolean; last: boolean }) {
  return (
    <div className="flex gap-1">
      {(["up", "down"] as const).map((dir) => (
        <form key={dir} action={moveItem}>
          <input type="hidden" name="model" value={model} />
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="dir" value={dir} />
          <button
            disabled={dir === "up" ? first : last}
            aria-label={dir === "up" ? "Yukarı taşı" : "Aşağı taşı"}
            className="grid size-8 place-items-center rounded-md border border-line text-sm text-muted hover:border-ink hover:text-ink disabled:opacity-30"
          >
            {dir === "up" ? "↑" : "↓"}
          </button>
        </form>
      ))}
    </div>
  );
}
