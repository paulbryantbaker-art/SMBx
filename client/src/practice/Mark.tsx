/**
 * The inline wordmark — the header logo (smbX.ai) rendered at text size for
 * running-copy brand mentions (Paul, 2026-07-12: "use the logo everywhere we
 * say smbX; don't say just smbX"). Legal fine print keeps plain text.
 *
 * Uses the content-trimmed cut (logo-inline.png). Calibration: the lowercase
 * letterforms occupy the middle ~34% of the trimmed box with their baseline
 * ~67% down, so 1.9em height + -0.62em align sets the letters at text scale
 * with the X's slashes breathing above and below the line.
 */
export default function Mark() {
  return (
    <img
      src="/logo-inline.png"
      alt="smbX.ai"
      style={{
        height: '1.9em',
        width: 'auto',
        display: 'inline-block',
        verticalAlign: '-0.62em',
        margin: '-0.5em 0.05em',
      }}
    />
  );
}
