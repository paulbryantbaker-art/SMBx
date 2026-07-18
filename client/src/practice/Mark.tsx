/**
 * The inline wordmark — "smb" and ".ai" as real text (inheriting the
 * surrounding font, weight, and color) with only the coral X as art
 * (Paul, 2026-07-12: "just use the X to make it easier inline").
 *
 * Geometry is transferred from the logo itself (coral-only crop, measured):
 * X = 2.874x the x-height with 32.3% below the baseline, and it overlaps
 * both neighbors — the tail sweeps under the "b", the top blade over the
 * ".". Schibsted Grotesk's x-height is 0.46em, so: height 1.32em, bottom
 * -0.427em, on a 0.9em advance. The zero-height anchor's bottom edge is the
 * baseline, which keeps the math exact at any font size and never inflates
 * the line box.
 */
export default function Mark() {
  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      smb
      <span style={{ position: 'relative', display: 'inline-block', width: '0.9em', height: 0 }}>
        <img
          src="/logo-x-green.png"
          alt="X"
          style={{
            position: 'absolute',
            left: '-0.18em',
            bottom: '-0.427em',
            height: '1.32em',
            width: 'auto',
            maxWidth: 'none',
          }}
        />
      </span>
      .ai
    </span>
  );
}
