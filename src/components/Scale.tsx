type Props = { max: number; value: number; onChange: (n: number) => void; label: string };

export default function Scale({ max, value, onChange, label }: Props) {
  return (
    <div className="scale" role="radiogroup" aria-label={label}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          role="radio"
          aria-checked={value === n}
          data-on={value === n ? 1 : 0}
          onClick={() => onChange(n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
