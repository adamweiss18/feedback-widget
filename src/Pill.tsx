type Props = { count: number; onClick: () => void };

export function Pill({ count, onClick }: Props) {
  return (
    <button className="fbw-pill" aria-label="Open feedback" onClick={onClick} type="button">
      <span className="dot" aria-hidden />
      Feedback
      {count > 0 && <span className="badge">{count}</span>}
    </button>
  );
}
