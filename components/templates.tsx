import { Fragment } from "react";
import type { MemeTemplate } from "@/lib/meme-schema";
import { cn } from "@/lib/utils";

export interface TemplateProps {
  userImage: string;
  captions: string[];
}

/* eslint-disable @next/next/no-img-element */

function TopBottom({ userImage, captions }: TemplateProps) {
  const [top = "", bottom = ""] = captions;
  return (
    <div className="relative h-full w-full bg-black">
      <img
        src={userImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {top && (
        <p className="meme-font meme-stroke absolute inset-x-3 top-3 break-words text-center text-[clamp(0.95rem,5cqw,2rem)]">
          {top}
        </p>
      )}
      {bottom && (
        <p className="meme-font meme-stroke absolute inset-x-3 bottom-3 break-words text-center text-[clamp(0.95rem,5cqw,2rem)]">
          {bottom}
        </p>
      )}
    </div>
  );
}

function Drake({ userImage, captions }: TemplateProps) {
  const [reject = "", approve = ""] = captions;
  return (
    <div className="grid h-full w-full grid-cols-2 grid-rows-2 bg-white">
      <div className="relative flex items-center justify-center bg-rose-50 p-2">
        <span className="absolute left-1.5 top-1.5 text-base">❌</span>
        <p className="meme-font break-words text-center text-[clamp(0.7rem,3.6cqw,1.25rem)] text-rose-700">
          {reject}
        </p>
      </div>
      <div className="relative overflow-hidden">
        <img
          src={userImage}
          alt=""
          className="h-full w-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-rose-500/20" />
      </div>
      <div className="relative flex items-center justify-center bg-emerald-50 p-2">
        <span className="absolute left-1.5 top-1.5 text-base">✅</span>
        <p className="meme-font break-words text-center text-[clamp(0.7rem,3.6cqw,1.25rem)] text-emerald-700">
          {approve}
        </p>
      </div>
      <div className="relative overflow-hidden">
        <img
          src={userImage}
          alt=""
          className="h-full w-full object-cover saturate-150 brightness-110"
        />
        <div className="absolute inset-0 bg-emerald-500/10" />
      </div>
    </div>
  );
}

function TwoButton({ userImage, captions }: TemplateProps) {
  const [a = "", b = "", context = ""] = captions;
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <img
        src={userImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover brightness-90"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/65" />
      <span className="absolute right-2 top-2 text-xl">💧</span>
      {context && (
        <p className="meme-font meme-stroke absolute inset-x-3 top-3 break-words text-center text-[clamp(0.85rem,4cqw,1.5rem)]">
          {context}
        </p>
      )}
      <div className="absolute inset-x-3 bottom-3 flex gap-2">
        <div className="meme-font flex-1 rounded-md bg-rose-500 px-2 py-2 text-center text-[clamp(0.7rem,3.2cqw,1.05rem)] text-white shadow-lg ring-2 ring-rose-300/80">
          {a}
        </div>
        <div className="meme-font flex-1 rounded-md bg-sky-500 px-2 py-2 text-center text-[clamp(0.7rem,3.2cqw,1.05rem)] text-white shadow-lg ring-2 ring-sky-300/80">
          {b}
        </div>
      </div>
    </div>
  );
}

const BRAIN_LEVELS = [
  "brightness-90 contrast-90 grayscale",
  "",
  "saturate-150 brightness-110 contrast-110",
  "saturate-[2] brightness-125 contrast-125 hue-rotate-30",
];

function ExpandingBrain({ userImage, captions }: TemplateProps) {
  const lines = [
    captions[0] ?? "",
    captions[1] ?? "",
    captions[2] ?? "",
    captions[3] ?? "",
  ];
  return (
    <div className="grid h-full w-full grid-cols-[42%_58%] grid-rows-4 bg-white">
      {lines.map((line, i) => (
        <Fragment key={i}>
          <div
            className={cn(
              "relative overflow-hidden",
              i < 3 && "border-b border-black/15",
            )}
          >
            <img
              src={userImage}
              alt=""
              className={cn("h-full w-full object-cover", BRAIN_LEVELS[i])}
            />
            {i === 3 && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-acid/25 via-transparent to-hot/30" />
            )}
          </div>
          <div
            className={cn(
              "flex items-center border-l border-black/15 p-2",
              i < 3 && "border-b",
            )}
          >
            <p className="meme-font break-words text-[clamp(0.65rem,2.9cqw,1.05rem)] text-black">
              {line}
            </p>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function ThisIsFine({ userImage, captions }: TemplateProps) {
  const [fire = "", cope = ""] = captions;
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <img
        src={userImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover saturate-150"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-orange-800/55 via-amber-500/10 to-rose-700/35" />
      <span className="absolute left-2 top-2 text-xl">🔥</span>
      <span className="absolute right-2 top-2 text-xl">🔥</span>
      {fire && (
        <p className="meme-font meme-stroke absolute inset-x-3 top-10 break-words text-center text-[clamp(0.85rem,4cqw,1.5rem)]">
          {fire}
        </p>
      )}
      {cope && (
        <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white px-3 py-2 text-center shadow-lg">
          <p className="meme-font break-words text-[clamp(0.8rem,3.6cqw,1.25rem)] text-black">
            {cope}
          </p>
        </div>
      )}
    </div>
  );
}

function DistractedBoyfriend({ userImage, captions }: TemplateProps) {
  const [boyfriend = "", temptation = "", girlfriend = ""] = captions;
  const labels: Array<{
    emoji: string;
    tag: string;
    text: string;
    pillClass: string;
  }> = [
    {
      emoji: "👀",
      tag: "me",
      text: boyfriend,
      pillClass: "bg-amber-400/95 text-black",
    },
    {
      emoji: "❤️",
      tag: "what i want",
      text: temptation,
      pillClass: "bg-rose-500/95 text-white",
    },
    {
      emoji: "🙄",
      tag: "what i had",
      text: girlfriend,
      pillClass: "bg-sky-500/95 text-white",
    },
  ];
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <img
        src={userImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/65" />
      <div className="absolute inset-x-3 bottom-3 space-y-1.5">
        {labels.map((l, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2 rounded-full px-2.5 py-1 shadow-md",
              l.pillClass,
            )}
          >
            <span className="text-sm leading-tight">{l.emoji}</span>
            <span className="meme-font flex-1 break-words text-[clamp(0.65rem,2.8cqw,0.95rem)] leading-tight">
              <span className="opacity-70">{l.tag}:</span> {l.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* eslint-enable @next/next/no-img-element */

export const TEMPLATE_COMPONENTS: Record<
  MemeTemplate,
  (props: TemplateProps) => JSX.Element
> = {
  "top-bottom": TopBottom,
  drake: Drake,
  "two-button": TwoButton,
  "expanding-brain": ExpandingBrain,
  "this-is-fine": ThisIsFine,
  "distracted-boyfriend": DistractedBoyfriend,
};
