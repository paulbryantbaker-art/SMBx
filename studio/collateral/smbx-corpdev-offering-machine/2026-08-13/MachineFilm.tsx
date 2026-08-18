/**
 * MachineFilm — the corp-dev offer film, on the site.
 *
 * THE CONSTRAINT THAT SHAPES ALL OF THIS: **autoplay only works muted.** Every
 * current browser refuses to start audio without a user gesture, and Safari on
 * iOS refuses to autoplay at all unless the element is `muted` AND
 * `playsInline`. So the film starts silent and offers sound, rather than
 * starting with sound and being blocked. There is no configuration that gets
 * both, on any browser, today.
 *
 * Everything else here exists because autoplay can still be refused after all
 * that — Low Power Mode, Data Saver, a per-site setting — and a hero that
 * silently fails to a black rectangle is worse than one that never tried. So
 * the play() promise is caught and the poster stays with a control on it.
 *
 * Behaviour:
 *   · starts when it scrolls into view, not on mount (a hero mounts at the top
 *     of the page, so for a hero these are the same moment; for a mid-page
 *     section they are not, and nobody wants to arrive at a film already over)
 *   · plays ONCE and holds on the mark. It is a 29-second argument with an
 *     ending, not a texture — looping it would restart the throw over the logo
 *   · SOUND control: unmutes live, or replays from the top with sound if the
 *     film has already finished, because unmuting a still frame does nothing
 *   · prefers-reduced-motion: the poster, and an explicit control. No motion
 *     starts on its own
 *
 * Colours are inline hex from the Carta palette rather than Tailwind tokens,
 * so this drops in without assuming anything about the tailwind config —
 * swap them for your tokens if you have them.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const INK = '#16181A';
const BONE = '#FCFAF6';
const DEAL_GREEN = '#0A7A58';
const MINT = '#A8F0CE';
const PANEL = '#1A1B19';

type Props = {
  /** where the three files are served from */
  src?: string;
  /** fill the viewport (hero) or sit in the flow (section) */
  variant?: 'hero' | 'section';
  /**
   * Does the file at `src` actually carry an audio track?
   *
   * DEFAULT IS FALSE, because as of 2026-08-13 the shipped files are SILENT —
   * Paul is scoring these himself. A SOUND control over a silent file is worse
   * than no control: it invites a click that does nothing, which reads as
   * broken. Set this true once a file with music is in place and the control
   * comes back, along with the replay-with-sound behaviour.
   *
   * Deliberately a prop and not feature detection: `mozHasAudio`,
   * `webkitAudioDecodedByteCount` and `audioTracks` are each supported by a
   * different subset of browsers and none of them is reliable before the file
   * has buffered, so detection would flicker the button in and out on load.
   * You know whether your file has audio. Tell it.
   */
  sound?: boolean;
  className?: string;
};

export default function MachineFilm({
  src = '/media/smbx-machine',
  variant = 'hero',
  sound: hasAudio = false,
  className = '',
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [started, setStarted] = useState(false);
  const [blocked, setBlocked] = useState(false);   // autoplay refused
  const [ended, setEnded] = useState(false);
  const [sound, setSound] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  /* start on view, once */
  useEffect(() => {
    if (reduced || started) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setStarted(true);
        const v = videoRef.current;
        if (!v) return;
        v.play().catch(() => setBlocked(true));   // refused: keep the poster
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, started]);

  const play = useCallback((withSound: boolean) => {
    const v = videoRef.current;
    if (!v) return;
    if (withSound) {
      v.muted = false;
      setSound(true);
    }
    /* unmuting a film that has already stopped does nothing audible — the
       gesture clearly means "let me hear it", so give it something to hear */
    if (withSound && (v.ended || v.currentTime >= v.duration - 0.05)) v.currentTime = 0;
    setEnded(false);
    setBlocked(false);
    setStarted(true);
    v.play().catch(() => setBlocked(true));
  }, []);

  const toggleSound = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (sound) {
      v.muted = true;
      setSound(false);
    } else {
      play(true);
    }
  }, [sound, play]);

  /* with no audio track there is nothing to unmute, so the only reason to show
     a control at all is that the picture is not moving */
  const showPlay = blocked || reduced || (hasAudio && ended && !sound);

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${variant === 'hero' ? 'w-full' : 'w-full'} ${className}`}
      style={{ backgroundColor: PANEL, aspectRatio: '16 / 9' }}
    >
      <video
        ref={videoRef}
        poster={`${src}-poster.jpg`}
        muted
        playsInline
        preload="metadata"
        controls={false}
        disablePictureInPicture
        aria-label="smbXCorpDev — the engagement, end to end"
        className="block h-full w-full object-cover"
        onEnded={() => setEnded(true)}
        onPlay={() => setEnded(false)}
      >
        {/* WebM first: smaller, and browsers pick the first they can decode */}
        <source src={`${src}.webm`} type="video/webm" />
        <source src={`${src}.mp4`} type="video/mp4" />
      </video>

      {/* SOUND — the film is built to read silently, so this is an offer, not
          an instruction. Absent entirely when the file has no audio track. */}
      {hasAudio && <button
        type="button"
        onClick={toggleSound}
        aria-pressed={sound}
        className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-3 py-2 text-[11px] tracking-[0.14em] transition-opacity duration-200 hover:opacity-100 focus:outline-none focus-visible:ring-1"
        style={{
          fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          color: sound ? INK : BONE,
          backgroundColor: sound ? MINT : 'rgba(10,122,88,0.85)',
          opacity: 0.9,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 7,
            height: 7,
            backgroundColor: sound ? DEAL_GREEN : MINT,
            display: 'inline-block',
          }}
        />
        {sound ? 'SOUND ON' : 'SOUND OFF'}
      </button>}

      {/* shown only when nothing is moving: autoplay refused, reduced motion,
          or the film has finished and has never been heard */}
      {showPlay && (
        <button
          type="button"
          onClick={() => play(hasAudio)}
          className="absolute inset-0 flex items-center justify-center focus:outline-none"
          style={{ backgroundColor: 'rgba(14,15,13,0.35)' }}
        >
          <span
            className="inline-flex items-center gap-3 px-5 py-3 text-[12px] tracking-[0.16em]"
            style={{
              fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
              color: BONE,
              backgroundColor: DEAL_GREEN,
            }}
          >
            <span aria-hidden style={{ width: 8, height: 8, backgroundColor: MINT }} />
            {ended ? (hasAudio ? 'PLAY AGAIN, WITH SOUND' : 'PLAY AGAIN') : 'PLAY THE FILM'}
          </span>
        </button>
      )}
    </div>
  );
}
