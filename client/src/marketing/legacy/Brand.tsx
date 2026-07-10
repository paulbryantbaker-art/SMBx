/**
 * Inline brand name "smbX.ai" with the wordmark's signature neon-green X.
 *
 * Inherits the surrounding font/size/weight so it blends into headings and body
 * copy — only the capital X carries the accent (#2BFF77); "smb" and ".ai" stay
 * in the inherited ink, matching the logo. Use wherever the brand is mentioned
 * in marketing copy. (The standalone logo lockup is the <Logo> component; this
 * is the inline name for running text.)
 */
export function Brand({ className }: { className?: string }) {
  return (
    <span className={className}>smb<span style={{ color: '#2BFF77' }}>X</span>.ai</span>
  );
}

export default Brand;
