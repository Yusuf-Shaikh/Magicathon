const PHRASES = [
  "meme harder",
  "your camera roll is the manuscript",
  "impact font is dead",
  "context is king",
  "no signup. no install. no apology.",
  "chronically online taste only",
  "funny is the hard part",
  "make it a mess. make it a meme.",
];

export function Marquee() {
  return (
    <div
      aria-hidden
      className="relative overflow-hidden border-y border-foreground/10 bg-ink"
    >
      <div className="marquee-track flex shrink-0 items-center gap-12 whitespace-nowrap py-4 font-mono text-sm uppercase tracking-[0.25em] text-paper">
        {/* Track A */}
        {PHRASES.map((p, i) => (
          <span key={`a-${i}`} className="flex items-center gap-12">
            {p}
            <span className="text-acid">✦</span>
          </span>
        ))}
        {/* Track B — duplicated so the loop is seamless */}
        {PHRASES.map((p, i) => (
          <span key={`b-${i}`} className="flex items-center gap-12">
            {p}
            <span className="text-acid">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
