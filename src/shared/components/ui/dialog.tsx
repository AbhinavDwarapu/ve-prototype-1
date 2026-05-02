/* eslint-disable react-refresh/only-export-components -- primitive barrel */
import { Dialog } from "@base-ui/react/dialog";

import { cn } from "@/shared/lib/utils";

function Root(props: Dialog.Root.Props) {
  return <Dialog.Root {...props} />;
}

function Portal(props: Dialog.Portal.Props) {
  return <Dialog.Portal {...props} />;
}

function Backdrop({
  className,
  ...props
}: Dialog.Backdrop.Props) {
  return (
    <Dialog.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function Popup({
  className,
  ...props
}: Dialog.Popup.Props) {
  return (
    <Dialog.Popup
      className={cn(
        "fixed top-1/2 left-1/2 z-50 w-[min(100%-1.5rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-editor-outline bg-popover p-5 text-popover-foreground shadow-[var(--shadow-editor-2)] outline-none",
        className,
      )}
      {...props}
    />
  );
}

function Title({ className, ...props }: Dialog.Title.Props) {
  return (
    <Dialog.Title
      className={cn("text-base font-semibold tracking-tight", className)}
      {...props}
    />
  );
}

function Description({ className, ...props }: Dialog.Description.Props) {
  return (
    <Dialog.Description
      className={cn("mt-2 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function Close({ className, ...props }: Dialog.Close.Props) {
  return <Dialog.Close className={className} {...props} />;
}

export const DialogPrimitives = {
  Root,
  Portal,
  Backdrop,
  Popup,
  Title,
  Description,
  Close,
};
