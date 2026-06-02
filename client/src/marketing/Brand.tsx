/**
 * Inline brand name "smbX" with the wordmark's signature neon-green X.
 *
 * Inherits the surrounding font/size/weight so it blends into headings and body
 * copy — only the capital X carries the accent (#2BFF77), matching the logo.
 * Use this wherever the brand is mentioned in marketing copy so every mention
 * reads as the wordmark. (The full logo lockup with ".ai" is the <Logo>
 * component; this is just the inline name.)
 */
export function Brand({ className }: { className?: string }) {
  return (
    <span className={className}>smb<span style={{ color: '#2BFF77' }}>X</span></span>
  );
}

export default Brand;
