/* Fleuron.tsx — section divider.
 *
 * Inserted between major movements. Hairlines extend from both sides
 * of a centered ❦ glyph.  CSS does the work — just <Fleuron /> in JSX.
 *
 * Token consumed: --rule, --ink-quaternary, --font-editorial
 */

export function Fleuron() {
  return (
    <div style={{ padding: "0 56px" }}>
      <div className="fleuron" style={{ padding: "20px 0" }}>
        ❦
      </div>
    </div>
  );
}
