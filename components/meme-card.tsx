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
      aria-label={`Edit meme: ${concept.title || concept.template}`}
      className="group animate-in fade-in slide-in-from-bottom-2 overflow-hidden rounded-2xl border border-foreground/10 bg-card/40 text-left shadow-lg backdrop-blur-xl transition-[transform,border-color,box-shadow,background-color] duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-acid/60 hover:bg-card/60 hover:shadow-2xl hover:shadow-acid/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
      <p className="border-t border-foreground/10 bg-card/60 px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-hot">
        match{" "}
        <span className="font-bold">
          {Math.round(concept.confidence * 100)}%
        </span>
      </p>
    </button>
  );
}
