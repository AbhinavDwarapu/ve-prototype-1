import type { ReactNode } from "react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export type SourceChoiceCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  disabled?: boolean;
  helper?: string;
  onClick: () => void;
};

export function SourceChoiceCard({
  title,
  description,
  icon,
  disabled = false,
  helper,
  onClick,
}: SourceChoiceCardProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-auto w-full flex-col items-start gap-3 rounded-lg bg-editor-surface p-4 text-left whitespace-normal",
        disabled && "opacity-60",
      )}
    >
      <span className="flex w-full items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-md bg-editor-primary-container text-editor-on-primary-container">
          {icon}
        </span>
        <span className="flex flex-col">
          <span className="font-semibold">{title}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {description}
          </span>
        </span>
      </span>
      {helper && (
        <span className="text-xs font-normal text-muted-foreground">
          {helper}
        </span>
      )}
    </Button>
  );
}
