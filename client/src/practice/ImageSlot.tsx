/**
 * Photo placeholder for the three intentional photography slots (README:
 * "real photography TBD by the founder"). Renders a quiet dark gradient with
 * the art-direction caption so the layout reads correctly today; swap for a
 * real <img>/background when photos arrive.
 */
export default function ImageSlot({ caption }: { caption: string }) {
  return (
    <div className="pd-slot" role="img" aria-label={caption}>
      <div className="cap">{caption}</div>
    </div>
  );
}
