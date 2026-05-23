import { TEMPLATE_COMPONENTS } from "@/components/templates";
import { normalizeCaptions, type MemeConcept } from "@/lib/meme-schema";

interface MemeCardProps {
  concept: MemeConcept;
  userImage: string;
  index: number;
  onClick?: () => void;
}

export function MemeCard({ concept, userImage, index, onClick }: MemeCardProps) {
  const Template = TEMPLATE_COMPONENTS[concept.template];
  const captions = normalizeCaptions(concept.template, concept.captions);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-2xl border border-foreground/10 bg-card/40 text-left shadow-lg backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-acid/40 hover:shadow-acid/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{
        animationDelay: `${index * 80}ms`,
        animationFillMode: "backwards",
      }}
    >
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{ containerType: "inline-size" }}
      >
        <Template userImage={userImage} captions={captions} />
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-foreground/10 bg-card/60 px-3 py-2 text-xs">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate rounded-full bg-acid px-1.5 py-0.5 font-mono lowercase text-ink">
            {concept.title || concept.template}
          </span>
        </div>
        <span className="shrink-0 text-muted-foreground">
          {Math.round(concept.confidence * 100)}%
        </span>
      </div>
    </button>
  );
}
