export type NumberFieldProps = {
  label: string;
  value: number;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
  help?: string;
};

export function NumberField({
  label,
  value,
  min,
  step = 1,
  onChange,
  help,
}: NumberFieldProps) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
      />
      {help && <span className="text-xs text-muted-foreground">{help}</span>}
    </label>
  );
}
