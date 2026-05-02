import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  help?: ReactNode;
  inputClassName?: string;
};

export function TextField({
  id,
  label,
  help,
  className,
  inputClassName,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <label htmlFor={inputId} className={cn("grid gap-1.5 text-sm", className)}>
      <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <input
        id={inputId}
        className={cn(
          "h-10 min-w-10 rounded-md border border-editor-outline bg-editor-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground hover:bg-editor-surface-variant/60 focus-visible:border-ring focus-visible:bg-editor-surface-variant focus-visible:ring-3 focus-visible:ring-ring/30",
          inputClassName,
        )}
        {...props}
      />
      {help ? <span className="text-xs text-muted-foreground">{help}</span> : null}
    </label>
  );
}
