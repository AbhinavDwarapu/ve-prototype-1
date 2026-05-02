import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { DialogPrimitives } from "@/shared/components/ui/dialog";

import {
  ClientSideRenderPreflightError,
  runClientSideRender,
} from "./run-client-side-render";
import { saveVideoBlob } from "./save-video-blob";

type Phase = "progress" | "success" | "error";

function formatExportError(error: unknown): string {
  if (error instanceof ClientSideRenderPreflightError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function defaultExportFilename(): string {
  const stamp = new Date().toISOString().replaceAll(":", "-").slice(0, 19);
  return `export-${stamp}.mp4`;
}

export type ExportVideoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExportVideoDialog({
  open,
  onOpenChange,
}: ExportVideoDialogProps) {
  const titleId = useId();
  const [phase, setPhase] = useState<Phase>("progress");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const runIdRef = useRef(0);

  useEffect(() => {
    if (!open) {
      runIdRef.current += 1;
      return;
    }

    const runId = ++runIdRef.current;
    const abortController = new AbortController();

    (async () => {
      try {
        const blob = await runClientSideRender({
          signal: abortController.signal,
          onProgress: (p) => {
            if (runIdRef.current === runId) {
              setProgress(p.progress);
            }
          },
        });

        if (runIdRef.current !== runId || abortController.signal.aborted) {
          return;
        }

        await saveVideoBlob(blob, defaultExportFilename());

        if (runIdRef.current !== runId || abortController.signal.aborted) {
          return;
        }

        setPhase("success");
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }
        if (error instanceof DOMException && error.name === "AbortError") {
          onOpenChange(false);
          return;
        }
        if (runIdRef.current !== runId) {
          return;
        }
        setErrorMessage(formatExportError(error));
        setPhase("error");
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [open, onOpenChange]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onOpenChange(false);
    }
  };

  const progressPercent = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <DialogPrimitives.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitives.Portal>
        <DialogPrimitives.Backdrop />
        <DialogPrimitives.Popup aria-labelledby={titleId}>
          {phase === "progress" ? (
            <>
              <DialogPrimitives.Title id={titleId}>
                Exporting video…
              </DialogPrimitives.Title>
              <DialogPrimitives.Description className="mt-3">
                Encoding in your browser. You can leave this tab in the foreground
                for best results.
              </DialogPrimitives.Description>
              <div
                className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-800"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-indigo-500 transition-[width] duration-150"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-2 text-right text-xs font-mono tabular-nums text-neutral-500">
                {progressPercent}%
              </p>
            </>
          ) : null}

          {phase === "success" ? (
            <>
              <DialogPrimitives.Title id={titleId}>
                Export complete
              </DialogPrimitives.Title>
              <DialogPrimitives.Description className="mt-3">
                If your browser opened a save dialog, the file was written where you
                picked. Otherwise it was downloaded using your browser’s default
                download location.
              </DialogPrimitives.Description>
              <div className="mt-5 flex justify-end">
                <DialogPrimitives.Close render={<Button />}>Done</DialogPrimitives.Close>
              </div>
            </>
          ) : null}

          {phase === "error" ? (
            <>
              <DialogPrimitives.Title id={titleId}>
                Export failed
              </DialogPrimitives.Title>
              <DialogPrimitives.Description className="mt-3 whitespace-pre-wrap text-red-300/90">
                {errorMessage}
              </DialogPrimitives.Description>
              <div className="mt-5 flex justify-end gap-2">
                <DialogPrimitives.Close render={<Button variant="outline" />}>
                  Close
                </DialogPrimitives.Close>
              </div>
            </>
          ) : null}
        </DialogPrimitives.Popup>
      </DialogPrimitives.Portal>
    </DialogPrimitives.Root>
  );
}
