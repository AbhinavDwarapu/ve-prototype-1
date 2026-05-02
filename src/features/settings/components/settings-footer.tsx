import { Button } from "@/shared/components/ui/button";

export function SettingsFooter({
  disabled,
  onSave,
}: {
  disabled: boolean;
  onSave: () => void;
}) {
  return (
    <div className="border-t p-4">
      <Button className="w-full" disabled={disabled} onClick={onSave}>
        Save
      </Button>
    </div>
  );
}
