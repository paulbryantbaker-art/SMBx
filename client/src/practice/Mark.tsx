/**
 * The inline wordmark — the header logo (smbX.ai) rendered at text size for
 * running-copy brand mentions (Paul, 2026-07-12: "use the logo everywhere we
 * say smbX; don't say just smbX"). Legal fine print keeps plain text.
 */
export default function Mark({ h = '1.05em' }: { h?: string }) {
  return (
    <img
      src="/logo-coral-x.png"
      alt="smbX.ai"
      style={{ height: h, width: 'auto', display: 'inline-block', verticalAlign: '-0.16em' }}
    />
  );
}
