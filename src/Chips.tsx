import type { Category } from "@/types";

const ALL: Category[] = ["bug", "UX", "copy", "feature", "question"];

type Props = { value: Category; onChange: (c: Category) => void };

export function Chips({ value, onChange }: Props) {
  return (
    <div className="fbw-chips" role="radiogroup" aria-label="Feedback category">
      {ALL.map((c) => (
        <button
          key={c}
          role="radio"
          aria-checked={value === c}
          className={`fbw-chip${value === c ? " active" : ""}`}
          onClick={() => onChange(c)}
          type="button"
        >
          {c}
        </button>
      ))}
    </div>
  );
}
