import { Card } from "../../components/Card";
import { Panel } from "../../components/Panel";
import { SectionHeader } from "../../components/SectionHeader";
import { Tag } from "../../components/Tag";
import { IconButton } from "../../components/IconButton";
import { SendIcon, SparkleIcon } from "../../components/icons";
import { HangingPlantAccent } from "./decorative";
import { FoodLineAccent } from "./FoodLineAccent";
import { MoodPreviewCard } from "./MoodPreviewCard";
import { moodPreviewEntries } from "./moodPreviewData";

const suggestionChips = ["Long day", "Need comfort", "Too tired to cook", "Healthy please", "Something light"];

export function VibeCheckPreview() {
  return (
    <Panel className="relative flex flex-col overflow-hidden lg:h-full">
      {/* Anchored to the panel corner independently of the content flow below — sits right
          at the card's top edge so the ropes read as continuing beyond it. */}
      <HangingPlantAccent className="pointer-events-none absolute -top-1 right-5 hidden sm:block" />

      {/* Flexible breathing room above the heading — shares the panel's leftover height
          with the spacer above the food line, so the whole content group sits lower
          without needing a fixed (and viewport-breaking) margin. */}
      <div aria-hidden className="grow-[2]" />

      <div className="relative">
        <svg
          viewBox="0 -1 36 33"
          width="46"
          height="42"
          className="pointer-events-none absolute left-2 -top-11 hidden sm:block"
          aria-hidden
        >
          {/* four-point twinkle sparkle — elongated vertical points, short horizontal
              points, soft concave waist curves instead of straight diamond edges */}
          <path
            d="M10 0.08C10.46 5.45 13.46 8.33 16 9.7 13.46 11.08 10.46 13.95 10 19.33 9.56 13.95 6.56 11.08 4 9.7 6.56 8.33 9.56 5.45 10 0.08Z"
            fill="#F7C56D"
          />
          {/* soft rounded heart — even lobes and a smooth (not sharp) bottom point */}
          <path
            d="M26 29.5C26 29.5 19 24.1 19 19 19 16.5 21 14.5 23.2 14.5 24.5 14.5 25.4 15.3 26 16.6 26.6 15.3 27.5 14.5 28.8 14.5 31 14.5 33 16.5 33 19 33 24.1 26 29.5 26 29.5Z"
            fill="#F0846B"
          />
        </svg>

        <SectionHeader
          title={
            <>
              How are you <span className="text-brand-accent">feeling</span> today?
            </>
          }
          subtitle={
            <>
              Your mood helps me cook up the{" "}
              <span className="font-semibold text-brand-accent-strong">perfect meal</span> for you.
            </>
          }
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {moodPreviewEntries.map((entry) => (
          <MoodPreviewCard key={entry.mood} entry={entry} />
        ))}
      </div>

      <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-sm text-ink-muted">
        <SparkleIcon width={14} height={14} className="text-brand-accent" />
        Hover a mood to see the magic
      </p>

      <Card tone="cream" className="mt-3">
        <h3 className="font-display text-base font-bold text-ink">Or tell me more about your day…</h3>
        <div className="relative mt-3">
          <textarea
            disabled
            placeholder="Ex: Had a long day at work, feeling exhausted and need something comforting but quick."
            rows={2}
            maxLength={200}
            className="w-full resize-none rounded-2xl border border-tan-200 bg-surface p-4 pb-6 pr-14 text-sm text-ink placeholder:text-ink-muted disabled:cursor-not-allowed"
          />
          <span className="absolute bottom-3 right-14 text-xs text-ink-muted">0/200</span>
          <IconButton
            icon={<SendIcon width={16} height={16} />}
            label="Send"
            disabled
            className="absolute bottom-3 right-3 bg-brand-accent-strong text-white hover:bg-accent-800 hover:text-white disabled:opacity-60"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestionChips.map((chip) => (
            <Tag key={chip} label={chip} disabled className="cursor-default opacity-80" />
          ))}
        </div>
      </Card>

      {/* Breathing room before the food line — still the larger of the two spacers
          (grow-[3] vs grow-[2] above) so food stays clearly separated from the input
          panel, but no longer absorbing 100% of the panel's leftover height on its own. */}
      <div aria-hidden className="grow-[3]" />

      <FoodLineAccent />
    </Panel>
  );
}
