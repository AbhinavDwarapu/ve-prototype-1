export type FileFolderErrorProps = {
  message: string | null;
};

export function FileFolderError({ message }: FileFolderErrorProps) {
  if (!message) return null;

  return (
    <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/15 p-2 text-xs text-destructive">
      {message}
    </p>
  );
}
