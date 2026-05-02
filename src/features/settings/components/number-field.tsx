import { TextField } from "@/shared/components/ui/text-field";

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
    <TextField
      label={label}
      type="number"
      value={value}
      min={min}
      step={step}
      help={help}
      onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
    />
  );
}
