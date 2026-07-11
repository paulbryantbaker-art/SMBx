/** The wordmark: smbX.ai — only the X carries terra (per handoff §6). */
export function Brand({ className }: { className?: string }) {
  return (
    <span className={`mk-logo${className ? ` ${className}` : ''}`}>
      smb<span className="x">X</span>.ai
    </span>
  );
}
